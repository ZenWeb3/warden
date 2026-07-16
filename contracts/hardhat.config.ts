import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    botTestnet: {
      url: process.env.BOT_RPC || "https://rpc.bohr.life",
      chainId: 968,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    botMainnet: {
      url: process.env.BOT_MAINNET_RPC || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  // Blockscout-style verification. Confirm the exact apiURL on the explorer's API tab.
  etherscan: {
    apiKey: { botTestnet: "no-key-needed", botMainnet: "no-key-needed" },
    customChains: [
      {
        network: "botTestnet",
        chainId: 968,
        urls: { apiURL: "https://scan.bohr.life/api", browserURL: "https://scan.bohr.life" },
      },
      {
        network: "botMainnet",
        chainId: 677,
        urls: { apiURL: "https://scan.botchain.ai/api", browserURL: "https://scan.botchain.ai" },
      },
    ],
  },
};

export default config;
