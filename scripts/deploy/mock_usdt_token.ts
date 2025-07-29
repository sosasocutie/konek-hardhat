import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MockUSDT", {
    contract: "ERC20Common",
    from: deployer,
    log: true,
    args: [
      deployer, // admin
      deployer, // pauser
      deployer, // minter
      true, // allowBurn
      "MUSDT", // name
      "MockUSDT", // symbol
      18, // decimals
    ],
  });
};

deploy.tags = ["MockUSDT"];
deploy.dependencies = ["VerifyContracts"];

export default deploy;
