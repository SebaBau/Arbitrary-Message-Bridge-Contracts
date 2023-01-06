import { waffle, web3 } from "hardhat";
import { expect } from "chai";
import { getBigNumber } from "../utilities";

import AMBReceiverArtifacts from "../../artifacts/contracts/AMBReceiver.sol/AMBReceiver.json";
import AMBSenderArtifacts from "../../artifacts/contracts/AMBSender.sol/AMBSender.json";
import CounterReceiverArtifacts from "../../artifacts/contracts/CounterReceiver.sol/CounterReceiver.json";
import CounterSenderArtifacts from "../../artifacts/contracts/CounterSender.sol/CounterSender.json";

import { AMBReceiver, AMBSender, CounterReceiver, CounterSender } from "../../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("Integration tests", async () => {
  const [deployer] = provider.getWallets() as Wallet[];

  let ambReceiverContract: AMBReceiver;
  let ambSenderContract: AMBSender;
  let counterReceiverContract: CounterReceiver;
  let counterSenderContract: CounterSender;

  beforeEach(async () => {
    ambReceiverContract = (await deployContract(deployer, AMBReceiverArtifacts)) as AMBReceiver;
    ambSenderContract = (await deployContract(deployer, AMBSenderArtifacts)) as AMBSender;
    counterReceiverContract = (await deployContract(deployer, CounterReceiverArtifacts)) as CounterReceiver;
    counterSenderContract = (await deployContract(deployer, CounterSenderArtifacts)) as CounterSender;
  });

  it("Should work correctly and execute entire workflow", async () => {
    const preCounter = await counterReceiverContract.counter();
    const preBoolValue = await counterReceiverContract.boolValue();
    const preUint256Value = await counterReceiverContract.uint256Value();

    expect(preCounter).to.be.equal(0);
    expect(preBoolValue).to.be.equal(false);
    expect(preUint256Value).to.be.equal(0);

    await counterSenderContract.updateAMBAddress(ambSenderContract.address);
    await ambReceiverContract.updateRelayer(deployer.address);
    await counterReceiverContract.updateAMBAddress(ambReceiverContract.address);

    const tx = await counterSenderContract.send(counterReceiverContract.address, true, getBigNumber(10));

    const receipt = await tx.wait();

    const eventData = web3.eth.abi.decodeParameters(
      [
        { type: "address", name: "recipient" },
        { type: "bytes", name: "data" },
      ],
      receipt.logs[0].data
    );

    await ambReceiverContract.execute(eventData.recipient, eventData.data);

    const postCounter = await counterReceiverContract.counter();
    const postBoolValue = await counterReceiverContract.boolValue();
    const postUint256Value = await counterReceiverContract.uint256Value();

    expect(postCounter).to.be.equal(1);
    expect(postBoolValue).to.be.equal(true);
    expect(postUint256Value).to.be.equal(getBigNumber(10));
  });
});
