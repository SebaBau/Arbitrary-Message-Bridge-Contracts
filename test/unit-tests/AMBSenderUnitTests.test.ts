import { waffle, web3 } from "hardhat";
import { expect } from "chai";
import { getBigNumber } from "../utilities";

import AMBSenderArtifacts from "../../artifacts/contracts/AMBSender.sol/AMBSender.json";

import { AMBSender } from "../../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("'AMBSender' contract unit tests'", () => {
  const [deployer, counterReceiver] = provider.getWallets() as Wallet[];

  let ambSenderContract: AMBSender;

  const AMBSender_Sent_Event = "Sent";

  beforeEach(async () => {
    ambSenderContract = (await deployContract(deployer, AMBSenderArtifacts)) as AMBSender;
  });

  describe("'send' function tests", () => {
    it("Should work correctly (emitted data verification)", async () => {
      const encodedData = web3.eth.abi.encodeFunctionCall(
        {
          name: "increment",
          type: "function",
          inputs: [
            {
              type: "bool",
              name: "boolValue_",
            },
            {
              type: "uint256",
              name: "uint256Value_",
            },
          ],
        },
        [true.toString(), getBigNumber(10).toString()]
      );

      const tx = await ambSenderContract.send(counterReceiver.address, encodedData);

      const receipt = await tx.wait();

      const eventData = web3.eth.abi.decodeParameters(
        [
          { type: "address", name: "recipient" },
          { type: "bytes", name: "data" },
        ],
        receipt.logs[0].data
      );

      expect(eventData.recipient).to.be.equal(counterReceiver.address);
      expect(eventData.data).to.be.equal(encodedData);
    });

    it("Should work correctly (emitted event verification)", async () => {
      const encodedData = web3.eth.abi.encodeFunctionCall(
        {
          name: "increment",
          type: "function",
          inputs: [
            {
              type: "bool",
              name: "boolValue_",
            },
            {
              type: "uint256",
              name: "uint256Value_",
            },
          ],
        },
        [true.toString(), getBigNumber(10).toString()]
      );

      await expect(ambSenderContract.send(counterReceiver.address, encodedData))
        .to.emit(ambSenderContract, AMBSender_Sent_Event)
        .withArgs(counterReceiver.address, encodedData);
    });
  });
});
