import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { getBigNumber } from "../utilities";

import CounterSenderArtifacts from "../../artifacts/contracts/CounterSender.sol/CounterSender.json";
import AMBSenderArtifacts from "../../artifacts/contracts/AMBSender.sol/AMBSender.json";

import { AMBSender, CounterSender } from "../../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("'CounterSender' contract unit tests'", () => {
  const [deployer, alice, counterReceiver] = provider.getWallets() as Wallet[];

  let counterSenderContract: CounterSender;
  let ambSenderContract: AMBSender;

  const Ownable_NotOwner_Error = "Ownable_NotOwner";

  const CounterSender_AMBAddressUpdated_Event = "AMBAddressUpdated";
  const CounterSender_MessageSent_Event = "MessageSent";

  beforeEach(async () => {
    counterSenderContract = (await deployContract(deployer, CounterSenderArtifacts)) as CounterSender;
    ambSenderContract = (await deployContract(deployer, AMBSenderArtifacts)) as AMBSender;
  });

  describe("After deployment", () => {
    it("Should has initial state", async () => {
      const ambAddress = await counterSenderContract.ambAddress();

      await expect(ambAddress).to.be.equal(ethers.constants.AddressZero);
    });
  });

  describe("'updateAMBAddress' function tests", () => {
    it("Should work correctly and update address", async () => {
      const preAMBAddress = await counterSenderContract.ambAddress();

      await expect(counterSenderContract.updateAMBAddress(ambSenderContract.address))
        .to.emit(counterSenderContract, CounterSender_AMBAddressUpdated_Event)
        .withArgs(ambSenderContract.address);

      const postAMBAddress = await counterSenderContract.ambAddress();

      await expect(preAMBAddress).to.be.equal(ethers.constants.AddressZero);
      await expect(postAMBAddress).to.be.equal(ambSenderContract.address);
    });

    it("Should revert when caller is not the owner", async () => {
      await expect(counterSenderContract.connect(alice).updateAMBAddress(ambSenderContract.address)).to.be.revertedWith(Ownable_NotOwner_Error);
    });
  });

  describe("'send' function tests", () => {
    it("Should work correctly", async () => {
      await counterSenderContract.updateAMBAddress(ambSenderContract.address);

      await expect(counterSenderContract.send(counterReceiver.address, true, getBigNumber(10)))
        .to.emit(counterSenderContract, CounterSender_MessageSent_Event)
        .withArgs(counterReceiver.address, true, getBigNumber(10));
    });

    it("Should revert when AMB address is not set", async () => {
      await expect(counterSenderContract.send(counterReceiver.address, true, getBigNumber(10))).to.be.reverted;
    });
  });
});
