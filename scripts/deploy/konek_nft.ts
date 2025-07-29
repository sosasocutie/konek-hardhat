import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("KonekNFT", {
    contract: "NFT",
    from: deployer,
    log: true,
    args: [
      deployer, // owner
      "Konek NFT", // name
      "KONEK", // symbol
      "https://api.konek.com/metadata/", // baseURI
    ],
  });
};

deploy.tags = ["KonekNFT"];
deploy.dependencies = ["VerifyContracts"];

export default deploy;
