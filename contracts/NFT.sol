// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Common as ERC721CommonExtension} from "./contract-template/ERC721Common.sol";
import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

contract NFT is AccessControlEnumerable, ERC721CommonExtension {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721CommonExtension(name, symbol, baseURI) {
        address sender = _msgSender();
        // Revokes all roles from the deployer
        _revokeRole(MINTER_ROLE, sender);
        _revokeRole(PAUSER_ROLE, sender);
        _revokeRole(DEFAULT_ADMIN_ROLE, sender);

        // Grants the owner all roles
        _grantRole(MINTER_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    /**
     * @dev See {ERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721CommonExtension)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
