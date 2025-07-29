// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract KonekProtocol is Ownable {
    address public konekNFT;
    address public usdtToken;
    address public treasury;
    mapping(address => uint256) public creatorEarnings;
    mapping(address => uint256) public creatorGifts;
    uint256 public nextGiftId;
    uint256 public treasuryFee; // 5% in basis points (500/10000)

    struct Gift {
        string name;
        uint256 price;
        string imageUrl;
        bool active;
    }

    mapping(uint256 => Gift) public gifts;
    mapping(address => mapping(uint256 => uint256)) public creatorGiftCounts;

    event SuperchatSent(
        address indexed from,
        address indexed creator,
        uint256 amount,
        string message
    );
    event GiftSent(
        address indexed from,
        address indexed creator,
        uint256 giftId,
        uint256 quantity
    );
    event GiftCreated(uint256 indexed giftId, string name, uint256 price);

    constructor(
        address _konekNFT,
        address _usdtToken,
        address _treasury,
        uint256 _treasuryFee
    ) Ownable(msg.sender) {
        konekNFT = _konekNFT;
        usdtToken = _usdtToken;
        treasury = _treasury;
        treasuryFee = _treasuryFee;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setTreasuryFee(uint256 _treasuryFee) external onlyOwner {
        require(msg.sender == treasury, "Only treasury can set treasury fee");
        treasuryFee = _treasuryFee;
    }

    function getKonekNftTokenIdsOfAddress(
        address player
    ) public view returns (uint256[] memory) {
        uint256 currentBalance = NFT(konekNFT).balanceOf(player);
        uint256[] memory tokens = new uint256[](currentBalance);
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i] = NFT(konekNFT).tokenOfOwnerByIndex(player, i);
        }
        return (tokens);
    }

    function sendSuperchat(
        address creator,
        uint256 amount,
        string memory message
    ) external {
        require(
            IERC20(usdtToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        uint256 treasuryFee_ = (amount * treasuryFee) / 10000;
        uint256 creatorAmount = amount - treasuryFee_;

        creatorEarnings[creator] += creatorAmount;

        require(
            IERC20(usdtToken).transfer(treasury, treasuryFee_),
            "Treasury transfer failed"
        );

        emit SuperchatSent(msg.sender, creator, amount, message);
    }

    function cashOut() external {
        uint256 totalAmount = creatorEarnings[msg.sender] +
            creatorGifts[msg.sender];

        require(totalAmount > 0, "No earnings to cash out");

        creatorEarnings[msg.sender] = 0;
        creatorGifts[msg.sender] = 0;

        require(
            IERC20(usdtToken).transfer(msg.sender, totalAmount),
            "Transfer failed"
        );
    }

    function createGift(
        string memory name,
        uint256 price,
        string memory imageUrl
    ) external onlyOwner {
        gifts[nextGiftId] = Gift(name, price, imageUrl, true);
        emit GiftCreated(nextGiftId, name, price);
        nextGiftId++;
    }

    function sendGift(
        address creator,
        uint256 giftId,
        uint256 quantity
    ) external {
        require(gifts[giftId].active, "Gift not available");
        uint256 totalCost = gifts[giftId].price * quantity;

        require(
            IERC20(usdtToken).transferFrom(
                msg.sender,
                address(this),
                totalCost
            ),
            "Transfer failed"
        );

        uint256 treasuryFee_ = (totalCost * treasuryFee) / 10000;
        uint256 creatorAmount = totalCost - treasuryFee_;

        creatorGifts[creator] += creatorAmount;
        creatorGiftCounts[creator][giftId] += quantity;

        require(
            IERC20(usdtToken).transfer(treasury, treasuryFee_),
            "Treasury transfer failed"
        );

        emit GiftSent(msg.sender, creator, giftId, quantity);
    }

    function getTotalEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator] + creatorGifts[creator];
    }
}
