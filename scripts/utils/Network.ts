export enum Network {
  Hardhat = "hardhat",
  Testnet = "saigon",
  Mainnet = "ronin",
  Local = "local",
  CoreTestnet2 = "coretestnet2",
  Westend = "westend",
}

export type LiteralNetwork = Network | string;
