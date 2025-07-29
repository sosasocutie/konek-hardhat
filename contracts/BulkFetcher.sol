// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./interfaces/IERC721Fetcher.sol";

contract BulkFetcher {
    IERC721Fetcher public konekNFT;

    constructor(address _konekNFT) {
        konekNFT = IERC721Fetcher(_konekNFT);
    }

    function getKonekTokenIdsOfAddress(
        address player
    ) public view returns (uint256[] memory) {
        uint256 currentBalance = konekNFT.balanceOf(player);
        uint256[] memory tokens = new uint256[](currentBalance);
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i] = konekNFT.tokenOfOwnerByIndex(player, i);
        }
        return (tokens);
    }
}
