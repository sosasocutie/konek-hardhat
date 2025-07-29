import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
const RONIN_RPC = vars.get("RONIN_RPC");
const SAIGON_DEPLOYER_ACCOUNT = vars.get("SAIGON_DEPLOYER_ACCOUNT");
const RONIN_DEPLOYER_ACCOUNT = vars.get("RONIN_DEPLOYER_ACCOUNT");
const HARDHAT_DEPLOYER_ACCOUNT = vars.get("HARDHAT_DEPLOYER_ACCOUNT");
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  typechain: {
    outDir: "./typechain-types",
  },
  paths: {
    sources: "./contracts",
    cache: "./cache/hardhat",
    deploy: ["./scripts/deploy"],
  },
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [SAIGON_DEPLOYER_ACCOUNT],
    },
    hardhat: {
      forking: {
        url: "https://ronin-saigon.g.alchemy.com/v2/B8QTyaz47EInX5HMhlAoefRvt4zz-4vQ",
        blockNumber: 36475328,
      },
    },
    saigon: {
      url: "https://saigon-testnet.roninchain.com/rpc",
      accounts: [SAIGON_DEPLOYER_ACCOUNT],
      gasPrice: 21_000_000_000,
    },
    ronin: {
      url: RONIN_RPC,
      accounts: [RONIN_DEPLOYER_ACCOUNT],
      gasPrice: 21_000_000_000,
    },
    coretestnet2: {
      url: "https://rpc.test2.btcs.network",
      accounts: [HARDHAT_DEPLOYER_ACCOUNT],
      gasPrice: 21_000_000_000,
    },
    westend: {
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [HARDHAT_DEPLOYER_ACCOUNT],
      gasPrice: 21_000_000_000,
    },
  },
};

export default config;
