// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

/**
 * @title IReferral
 * @dev Interface for the ReferralUpgradeable contract
 * @notice Defines the external functions and events for managing referral codes
 */
interface IReferral {
    /**
     * @notice Emitted when a new referral code is registered
     * @param code The referral code that was registered
     * @param owner The address that owns the referral code
     */
    event ReferralCodeRegistered(string code, address indexed owner);

    /**
     * @notice Emitted when the referral reward percentage is updated
     * @param newPercentage The new reward percentage (in basis points)
     */
    event ReferralRewardPercentageUpdated(uint256 newPercentage);

    /**
     * @notice Sets the referral reward percentage
     * @param _percentage The new percentage in basis points (e.g., 500 = 5%)
     * @dev Only callable by accounts with CONFIG_SETTER role
     */
    function setReferralRewardPercentage(uint256 _percentage) external;

    /**
     * @notice Registers a new referral code for the caller
     * @param code The referral code to register (will be converted to lowercase)
     * @dev Only callable by accounts with CONFIG_SETTER role
     * @dev Code must be between 1-20 characters
     */
    function registerReferralCode(string calldata code) external;

    /**
     * @notice Gets the referral code for an address
     * @param owner The address to check
     * @return The referral code or empty string if none exists
     */
    function getReferralCode(
        address owner
    ) external view returns (string memory);

    /**
     * @notice Gets the owner of a referral code
     * @param code The code to check (case-insensitive)
     * @return The owner's address or zero address if not registered
     */
    function getCodeOwner(string calldata code) external view returns (address);

    /**
     * @notice Gets the current referral reward percentage
     * @return The reward percentage in basis points (e.g., 500 = 5%)
     */
    function getRewardPercentage() external view returns (uint256);
}
