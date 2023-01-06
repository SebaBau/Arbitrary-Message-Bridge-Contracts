import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { chainName, displayResult, dim, cyan, green } from "./utilities/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, getChainId } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  cyan("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  cyan("          Counter Sender - Deploy Script");
  cyan("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)}`);
  dim(`deployer: ${deployer}`);

  cyan("\nDeploying CounterSender contract...");

  const counterSenderResult = await deploy("CounterSender", {
    from: deployer,
    args: [],
    skipIfAlreadyDeployed: true,
  });

  displayResult("CounterSender :", counterSenderResult);

  green(`Done!`);
};

export default func;
func.tags = ["CounterSenderDeploy"];
