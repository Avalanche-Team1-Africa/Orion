import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "hardhat-deploy";
import "dotenv/config";

// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "api-key";
// const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// const MNEMONIC = process.env.MNEMONIC || "test test test test test test test test test test junk"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0, // First account in the list
    },
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // sepolia: {
    //   url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
    //   accounts: [WALLET_PRIVATE_KEY],
    // },
  },
  sourcify: {
    enabled: false,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;