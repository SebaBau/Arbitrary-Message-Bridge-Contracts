import { ethers, waffle, web3 } from "hardhat";
import { expect } from "chai";
import { getBigNumber } from "../utilities";

import AMBReceiverArtifacts from "../../artifacts/contracts/AMBReceiver.sol/AMBReceiver.json";
import CounterReceiverArtifacts from "../../artifacts/contracts/CounterReceiver.sol/CounterReceiver.json";
import CounterReceiverWithRevertArtifacts from "../../artifacts/contracts/mocks/CounterReceiverWithRevert.sol/CounterReceiverWithRevert.json";

import { AMBReceiver, CounterReceiver, CounterReceiverWithRevert } from "../../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("'AMBReceiver' contract unit tests'", () => {
  const [deployer, alice, relayerWallet] = provider.getWallets() as Wallet[];

  let ambReceiverContract: AMBReceiver;
  let counterReceiverContract: CounterReceiver;
  let counterReceiverWithRevertContract: CounterReceiverWithRevert;

  const Ownable_NotOwner_Error = "Ownable_NotOwner";
  const AMBReceiver_OnlyRelayer_Error = "AMBReceiver_OnlyRelayer";
  const AMBReceiver_OnlyForContracts_Error = "AMBReceiver_OnlyForContracts";
  const AMBReceiver_ExecuteFailed_Error = "AMBReceiver_ExecuteFailed";

  const AMBReceiver_RelayerUpdated_Event = "RelayerUpdated";
  const AMBReceiver_TransactionExecuted_Event = "TransactionExecuted";

  beforeEach(async () => {
    ambReceiverContract = (await deployContract(deployer, AMBReceiverArtifacts)) as AMBReceiver;
    counterReceiverContract = (await deployContract(deployer, CounterReceiverArtifacts)) as CounterReceiver;
    counterReceiverWithRevertContract = (await deployContract(deployer, CounterReceiverWithRevertArtifacts)) as CounterReceiverWithRevert;
  });

  describe("After deployment", () => {
    it("Should has initial state", async () => {
      const relayer = await ambReceiverContract.relayer();

      await expect(relayer).to.be.equal(ethers.constants.AddressZero);
    });
  });

  describe("'updateRelayer' function tests", () => {
    it("Should work correctly and update address", async () => {
      const preRelayer = await ambReceiverContract.relayer();

      await expect(ambReceiverContract.updateRelayer(relayerWallet.address))
        .to.emit(ambReceiverContract, AMBReceiver_RelayerUpdated_Event)
        .withArgs(relayerWallet.address);

      const postRelayer = await ambReceiverContract.relayer();

      await expect(preRelayer).to.be.equal(ethers.constants.AddressZero);
      await expect(postRelayer).to.be.equal(relayerWallet.address);
    });

    it("Should revert when caller is not the owner", async () => {
      await expect(ambReceiverContract.connect(alice).updateRelayer(relayerWallet.address)).to.be.revertedWithCustomError(
        ambReceiverContract,
        Ownable_NotOwner_Error
      );
    });
  });

  describe("'execute' function tests", () => {
    it("Should work correctly and execute function", async () => {
      await ambReceiverContract.updateRelayer(deployer.address);
      await counterReceiverContract.updateAMBAddress(ambReceiverContract.address);

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

      await expect(ambReceiverContract.execute(counterReceiverContract.address, encodedData))
        .to.emit(ambReceiverContract, AMBReceiver_TransactionExecuted_Event)
        .withArgs(counterReceiverContract.address, encodedData);
    });

    it("Should revert when caller is not the relayer", async () => {
      await ambReceiverContract.updateRelayer(deployer.address);

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

      await expect(ambReceiverContract.connect(alice).execute(counterReceiverContract.address, encodedData)).to.be.revertedWithCustomError(
        ambReceiverContract,
        AMBReceiver_OnlyRelayer_Error
      );
    });

    it("Should revert when recipient is not the contract", async () => {
      await ambReceiverContract.updateRelayer(deployer.address);

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

      await expect(ambReceiverContract.execute(alice.address, encodedData)).to.be.revertedWithCustomError(
        ambReceiverContract,
        AMBReceiver_OnlyForContracts_Error
      );
    });

    it("Should revert when performed function failed", async () => {
      await ambReceiverContract.updateRelayer(deployer.address);

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

      await expect(ambReceiverContract.execute(counterReceiverWithRevertContract.address, encodedData)).to.be.revertedWithCustomError(
        ambReceiverContract,
        AMBReceiver_ExecuteFailed_Error
      );
    });
  });
});
