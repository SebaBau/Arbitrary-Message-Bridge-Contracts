import { ethers, waffle } from "hardhat";
import { expect } from "chai";

import CounterReceiverArtifacts from "../../artifacts/contracts/CounterReceiver.sol/CounterReceiver.json";

import { CounterReceiver } from "../../typechain";
import { Wallet } from "ethers";
import { getBigNumber } from "../utilities";

const { provider, deployContract } = waffle;

describe("'CounterReceiver' contract unit tests'", () => {
  const [deployer, alice] = provider.getWallets() as Wallet[];

  let counterReceiverContract: CounterReceiver;

  const Ownable_NotOwner_Error = "Ownable_NotOwner";
  const CounterReceiver_OnlyAMB_Error = "CounterReceiver_OnlyAMB";

  const CounterReceiver_AMBAddressUpdated_Event = "AMBAddressUpdated";
  const CounterReceiver_IncrementExecuted_Event = "IncrementExecuted";

  beforeEach(async () => {
    counterReceiverContract = (await deployContract(deployer, CounterReceiverArtifacts)) as CounterReceiver;
  });

  describe("After deployment", () => {
    it("Should has initial state", async () => {
      const counter = await counterReceiverContract.counter();
      const boolValue = await counterReceiverContract.boolValue();
      const uint256Value = await counterReceiverContract.uint256Value();
      const ambAddress = await counterReceiverContract.ambAddress();

      await expect(counter).to.be.equal(0);
      await expect(boolValue).to.be.equal(false);
      await expect(uint256Value).to.be.equal(0);
      await expect(ambAddress).to.be.equal(ethers.constants.AddressZero);
    });
  });

  describe("'updateAMBAddress' function tests", () => {
    it("Should work correctly and update address", async () => {
      const preAMBAddress = await counterReceiverContract.ambAddress();

      await expect(counterReceiverContract.updateAMBAddress(deployer.address))
        .to.emit(counterReceiverContract, CounterReceiver_AMBAddressUpdated_Event)
        .withArgs(deployer.address);

      const postAMBAddress = await counterReceiverContract.ambAddress();

      await expect(preAMBAddress).to.be.equal(ethers.constants.AddressZero);
      await expect(postAMBAddress).to.be.equal(deployer.address);
    });

    it("Should revert when caller is not the owner", async () => {
      await expect(counterReceiverContract.connect(alice).updateAMBAddress(deployer.address)).to.be.revertedWith(Ownable_NotOwner_Error);
    });
  });

  describe("'increment' function tests", () => {
    it("Should work correctly", async () => {
      await counterReceiverContract.updateAMBAddress(deployer.address);

      const preCounter = await counterReceiverContract.counter();
      const preBoolValue = await counterReceiverContract.boolValue();
      const preUint256Value = await counterReceiverContract.uint256Value();

      await expect(counterReceiverContract.increment(true, getBigNumber(10)))
        .to.emit(counterReceiverContract, CounterReceiver_IncrementExecuted_Event)
        .withArgs(true, getBigNumber(10), 1);

      const postCounter = await counterReceiverContract.counter();
      const postBoolValue = await counterReceiverContract.boolValue();
      const postUint256Value = await counterReceiverContract.uint256Value();

      expect(preCounter).to.be.equal(0);
      expect(preBoolValue).to.be.equal(false);
      expect(preUint256Value).to.be.equal(0);

      expect(postCounter).to.be.equal(1);
      expect(postBoolValue).to.be.equal(true);
      expect(postUint256Value).to.be.equal(getBigNumber(10));
    });

    it("Should revert when caller is not AMB address", async () => {
      await expect(counterReceiverContract.connect(alice).increment(true, getBigNumber(10))).to.be.revertedWithCustomError(
        counterReceiverContract,
        CounterReceiver_OnlyAMB_Error
      );
    });
  });
});
