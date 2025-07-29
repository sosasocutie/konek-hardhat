import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed KonekNFT contract address
  const konekNFT = await get("KonekNFT");

  await deploy("BulkFetcher", {
    from: deployer,
    log: true,
    args: [
      konekNFT.address, // _konekNFT address
    ],
  });
};

deploy.tags = ["BulkFetcher"];
deploy.dependencies = ["KonekNFT"];

export default deploy;