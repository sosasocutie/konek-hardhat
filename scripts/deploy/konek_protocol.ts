import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed KonekNFT contract address
  const konekNFT = await get("KonekNFT");

  // Get the deployed MockUSDT contract address
  const mockUSDT = await get("MockUSDT");

  // Treasury configuration
  const treasuryFee = 500; // 5% in basis points (500/10000)

  await deploy("KonekProtocol", {
    from: deployer,
    log: true,
    args: [
      konekNFT.address, // _konekNFT
      mockUSDT.address, // _usdtToken
      "0xCad18c76AC676Bf813dC7CB8F3152647740AC537", // _treasury
      treasuryFee, // _treasuryFee
    ],
  });
};

deploy.tags = ["KonekProtocol"];
deploy.dependencies = ["KonekNFT", "MockUSDT"];

export default deploy;
