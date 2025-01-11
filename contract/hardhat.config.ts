import { HardhatUserConfig } from "hardhat/config";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

const mnemonic = process.env.MNEMONIC || ""; // 環境変数から mnemonic を取得
const privateKey = process.env.ACCOUNT_SEACRET || "1111111111111111111111111111111111111111111111111111111111111111"; // 個別のプライベートキーを取得


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD", // ガスのコストを表示する通貨
  },
  networks: {
    hardhat: {
      blockGasLimit: 10000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", // Hardhat 用のアカウントを mnemonic で設定
      },
    },
    sepolia: {
      url: `${process.env.ETH_TEST || ""}`,
      accounts: mnemonic
        ? { mnemonic } // Sepolia 用のアカウントを mnemonic で設定
        : [`0x${privateKey}`],
    },
    amoy: {
      url: `${process.env.POLYGON_TEST || ""}`,
      accounts: mnemonic
        ? { mnemonic } // Amoy 用のアカウントを mnemonic で設定
        : [`0x${privateKey}`],
    },
    "mantle-testnet": {
      url: "https://rpc.sepolia.mantle.xyz",
      accounts: mnemonic
        ? { mnemonic } // Mantle Testnet 用のアカウントを mnemonic で設定
        : [`0x${privateKey}`],
      chainId: 5003,
    },
  },
  // etherscan: {
  //   apiKey: {
  //     sepolia: "empty",
  //   },
  //   customChains: [
  //     {
  //       network: "sepolia",
  //       chainId: 11155111, // Sepolia のチェーン ID
  //       urls: {
  //         apiURL: "https://eth-sepolia.blockscout.com/api",
  //         browserURL: "https://eth-sepolia.blockscout.com",
  //       },
  //     },
  //   ],
  // },
  // sourcify: {
  //   enabled: false,
  // },
};

export default config;
