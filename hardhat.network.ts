import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

import { HardhatUserConfig } from "hardhat/config";

// Ensure that we have all the environment variables we need.
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let alchemyUrl: string;
if (!process.env.ALCHEMY_URL) {
  throw new Error("Please set your ALCHEMY_URL in a .env file");
} else {
  alchemyUrl = process.env.ALCHEMY_URL;
}

const networks: HardhatUserConfig["networks"] = {
  coverage: {
    url: "http://127.0.0.1:8555",
    blockGasLimit: 200000000,
    allowUnlimitedContractSize: true,
  },
  localhost: {
    chainId: 1337,
    url: "http://127.0.0.1:8545",
    allowUnlimitedContractSize: true,
  },
};

if (alchemyUrl && process.env.FORK_ENABLED && mnemonic) {
  networks.hardhat = {
    chainId: 1,
    forking: {
      url: alchemyUrl,
    },
    accounts: {
      mnemonic,
    },
  };
} else {
  console.log(alchemyUrl, process.env.FORK_ENABLED, mnemonic);
  networks.hardhat = {
    allowUnlimitedContractSize: true,
    mining: {
      auto: true,
      interval: 30000, // 30 sec per block
    },
  };
}

if (mnemonic) {
  networks.mumbai = {
    chainId: 80001,
    url: "https://rpc-mumbai.maticvigil.com",
    accounts: {
      mnemonic,
    },
  };

  networks.goerli = {
    chainId: 5,
    url: `https://eth-goerli.g.alchemy.com/v2/${alchemyUrl}`,
    accounts: {
      mnemonic,
    },
  };
}

export default networks;
