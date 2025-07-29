// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20Common is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControlEnumerable,
    ERC20Permit
{
    error BurnDisabled();

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint8 private _decimals;
    bool private _allowBurn;

    modifier whenBurnEnabled() {
        require(_allowBurn, BurnDisabled());
        _;
    }

    constructor(
        address admin,
        address pauser,
        address minter,
        bool allowBurn,
        string memory name_,
        string memory symbol_,
        uint8 decimal
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        _decimals = decimal;
        _allowBurn = allowBurn;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
    }

    /**
     * @dev Overrides {ERC20Burnable-_burn}.
     */
    function burn(uint256 amount) public virtual override whenBurnEnabled {
        super.burn(amount);
    }

    /**
     * @dev Overrides {ERC20Burnable-_burn}.
     */
    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override whenBurnEnabled {
        super.burnFrom(account, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    /**
     * @dev See {ERC20-decimals}.
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
