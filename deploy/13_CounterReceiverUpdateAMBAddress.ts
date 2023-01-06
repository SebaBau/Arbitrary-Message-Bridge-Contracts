import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { chainName, dim, cyan, green } from "./utilities/utils";
import { ethers } from "hardhat";
import { ambReceiverAddress, counterReceiverAddress } from "./data";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, getChainId } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const signer = ethers.provider.getSigner(deployer);

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  cyan("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  cyan("    Counter Receiver - Update AMB Address Script");
  cyan("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`);
  dim(`deployer: ${deployer}`);

  cyan("\nCounterReceiver Updating Relayer Address...");

  const contract = await ethers.getContractAt("CounterReceiver", counterReceiverAddress, signer);
  const tx = await contract.updateAMBAddress(ambReceiverAddress);
  await tx.wait(1);

  green(`Done!`);
};

export default func;
func.tags = ["CounterReceiverUpdateAMBAddress"];
