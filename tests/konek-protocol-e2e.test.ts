import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Konek Protocol E2E Test", function () {
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let konekNFT: any;
  let konekProtocol: any;
  let mockUSDT: any;

  beforeEach(async function () {
    // Deploy all contracts using fixtures
    await deployments.fixture(["KonekNFT", "MockUSDT", "KonekProtocol"]);

    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];

    // Get deployed contracts
    const konekNFTDeployment = await deployments.get("KonekNFT");
    const konekProtocolDeployment = await deployments.get("KonekProtocol");
    const mockUSDTDeployment = await deployments.get("MockUSDT");

    konekNFT = await ethers.getContractAt("NFT", konekNFTDeployment.address);
    konekProtocol = await ethers.getContractAt(
      "KonekProtocol",
      konekProtocolDeployment.address
    );
    mockUSDT = await ethers.getContractAt(
      "ERC20Common",
      mockUSDTDeployment.address
    );
  });

  it("should deploy contracts with correct configuration", async function () {
    // Verify KonekNFT deployment
    expect(await konekNFT.name()).to.equal("Konek NFT");
    expect(await konekNFT.symbol()).to.equal("KONEK");
    // expect(await konekNFT.owner()).to.equal(deployer.address);

    // Verify MockUSDT deployment
    expect(await mockUSDT.name()).to.equal("MUSDT");
    expect(await mockUSDT.symbol()).to.equal("MockUSDT");

    // Verify KonekProtocol has correct addresses
    // Add protocol-specific verification based on your contract
  });

  it("should handle gift creation and sending", async function () {
    // Create a gift (only owner can create gifts)
    await konekProtocol
      .connect(deployer)
      .createGift(
        "Virtual Rose",
        ethers.parseEther("10"),
        "https://example.com/rose.png"
      );

    // Verify gift was created
    const gift = await konekProtocol.gifts(0);
    expect(gift.name).to.equal("Virtual Rose");
    expect(gift.price).to.equal(ethers.parseEther("10"));
    expect(gift.imageUrl).to.equal("https://example.com/rose.png");
    expect(gift.active).to.be.true;

    // Mint USDT to user1 for testing
    await mockUSDT
      .connect(deployer)
      .mint(user1.address, ethers.parseEther("1000"));

    const treasuryAddress = "0xCad18c76AC676Bf813dC7CB8F3152647740AC537";
    const initialTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);

    // User1 sends gift to user2 (creator)
    await mockUSDT
      .connect(user1)
      .approve(await konekProtocol.getAddress(), ethers.parseEther("50")); // 5 gifts * 10 USDT

    await konekProtocol.connect(user1).sendGift(user2.address, 0, 5); // Send 5 roses

    // Check treasury received fee (5% of 50 USDT = 2.5 USDT)
    const finalTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);
    expect(finalTreasuryBalance).to.equal(
      initialTreasuryBalance + ethers.parseEther("2.5")
    );

    // Check user1 balance decreased
    expect(await mockUSDT.balanceOf(user1.address)).to.equal(
      ethers.parseEther("950")
    );

    // Check creator gift earnings (95% of 50 USDT = 47.5 USDT)
    expect(await konekProtocol.creatorGifts(user2.address)).to.equal(
      ethers.parseEther("47.5")
    );

    // Check gift count for creator
    expect(await konekProtocol.creatorGiftCounts(user2.address, 0)).to.equal(5);
  });

  it("should handle treasury fee collection", async function () {
    const treasuryAddress = "0xCad18c76AC676Bf813dC7CB8F3152647740AC537";

    // Mint USDT to user1 first
    await mockUSDT
      .connect(deployer)
      .mint(user1.address, ethers.parseEther("1000"));

    const initialTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);

    await mockUSDT
      .connect(user1)
      .approve(await konekProtocol.getAddress(), ethers.parseEther("100"));

    await konekProtocol
      .connect(user1)
      .sendSuperchat(user2.address, ethers.parseEther("100"), "Hello");

    const finalTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);

    expect(finalTreasuryBalance).to.equal(
      initialTreasuryBalance + ethers.parseEther("5")
    );

    expect(await mockUSDT.balanceOf(user1.address)).to.equal(
      ethers.parseEther("900")
    );

    expect(await konekProtocol.creatorEarnings(user2.address)).to.equal(
      ethers.parseEther("95")
    );
  });

  it("should handle creator cash out", async function () {
    // Mint USDT to user1 for testing
    await mockUSDT
      .connect(deployer)
      .mint(user1.address, ethers.parseEther("1000"));

    // User1 sends superchat to user2 (creator)
    await mockUSDT
      .connect(user1)
      .approve(await konekProtocol.getAddress(), ethers.parseEther("100"));

    await konekProtocol
      .connect(user1)
      .sendSuperchat(user2.address, ethers.parseEther("100"), "Hello");

    // Check creator earnings before cash out
    expect(await konekProtocol.creatorEarnings(user2.address)).to.equal(
      ethers.parseEther("95")
    );

    // Check user2 USDT balance before cash out
    const initialUser2Balance = await mockUSDT.balanceOf(user2.address);

    // User2 (creator) cashes out
    await konekProtocol.connect(user2).cashOut();

    // Check creator earnings after cash out (should be 0)
    expect(await konekProtocol.creatorEarnings(user2.address)).to.equal(0);
    expect(await konekProtocol.creatorGifts(user2.address)).to.equal(0);

    // Check user2 USDT balance after cash out
    expect(await mockUSDT.balanceOf(user2.address)).to.equal(
      initialUser2Balance + ethers.parseEther("95")
    );
  });

  it("should handle superchat + gift + treasury fee collection", async function () {
    const treasuryAddress = "0xCad18c76AC676Bf813dC7CB8F3152647740AC537";

    // Create a gift first
    await konekProtocol
      .connect(deployer)
      .createGift(
        "Virtual Rose",
        ethers.parseEther("10"),
        "https://example.com/rose.png"
      );

    // Mint USDT to user1 for testing
    await mockUSDT
      .connect(deployer)
      .mint(user1.address, ethers.parseEther("1000"));

    const initialTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);
    const initialUser1Balance = await mockUSDT.balanceOf(user1.address);

    // User1 sends superchat to user2 (100 USDT)
    await mockUSDT
      .connect(user1)
      .approve(await konekProtocol.getAddress(), ethers.parseEther("150")); // 100 + 50 for gifts

    await konekProtocol
      .connect(user1)
      .sendSuperchat(user2.address, ethers.parseEther("100"), "Hello Creator!");

    // User1 sends gifts to user2 (5 gifts * 10 USDT = 50 USDT)
    await konekProtocol.connect(user1).sendGift(user2.address, 0, 5);

    // Check treasury received total fees (5% of 150 USDT = 7.5 USDT)
    const finalTreasuryBalance = await mockUSDT.balanceOf(treasuryAddress);
    expect(finalTreasuryBalance).to.equal(
      initialTreasuryBalance + ethers.parseEther("7.5")
    );

    // Check user1 balance decreased by total amount (150 USDT)
    expect(await mockUSDT.balanceOf(user1.address)).to.equal(
      initialUser1Balance - ethers.parseEther("150")
    );

    // Check creator earnings from superchat (95% of 100 USDT = 95 USDT)
    expect(await konekProtocol.creatorEarnings(user2.address)).to.equal(
      ethers.parseEther("95")
    );

    // Check creator gift earnings (95% of 50 USDT = 47.5 USDT)
    expect(await konekProtocol.creatorGifts(user2.address)).to.equal(
      ethers.parseEther("47.5")
    );

    // Check gift count for creator
    expect(await konekProtocol.creatorGiftCounts(user2.address, 0)).to.equal(5);

    // Test combined cash out
    const initialUser2Balance = await mockUSDT.balanceOf(user2.address);

    await konekProtocol.connect(user2).cashOut();

    // Check all earnings were cashed out (95 + 47.5 = 142.5 USDT)
    expect(await konekProtocol.creatorEarnings(user2.address)).to.equal(0);
    expect(await konekProtocol.creatorGifts(user2.address)).to.equal(0);
    expect(await mockUSDT.balanceOf(user2.address)).to.equal(
      initialUser2Balance + ethers.parseEther("142.5")
    );
  });
});
