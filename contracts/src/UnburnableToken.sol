// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UnburnableToken {
    // Custom errors
    error TokensClaimed();
    error AllTokensClaimed();
    error UnsafeTransfer(address recipient);

    // Public storage variables
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    uint256 public totalClaimed;

    // Internal tracking for claims
    mapping(address => bool) private hasClaimed;

    // Constants
    uint256 public constant CLAIM_AMOUNT = 1000;

    // Events for transparency
    event ClaimMade(address indexed claimer, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Constructor sets the total supply to 100,000,000 tokens
     */
    constructor() {
        totalSupply = 100_000_000;
        totalClaimed = 0;
    }

    /**
     * @dev Allows eligible wallets to claim 1000 tokens once
     * Reverts if wallet has already claimed or all tokens are distributed
     */
    function claim() public {
        // Check if all tokens have been claimed
        if (totalClaimed >= totalSupply) {
            revert AllTokensClaimed();
        }

        // Check if this wallet has already claimed
        if (hasClaimed[msg.sender]) {
            revert TokensClaimed();
        }

        // Check if there are enough tokens left to claim
        if (totalClaimed + CLAIM_AMOUNT > totalSupply) {
            revert AllTokensClaimed();
        }

        // Mark as claimed and update balances
        hasClaimed[msg.sender] = true;
        balances[msg.sender] += CLAIM_AMOUNT;
        totalClaimed += CLAIM_AMOUNT;

        emit ClaimMade(msg.sender, CLAIM_AMOUNT);
    }

    /**
     * @dev Safely transfer tokens to another address with validation
     * @param _to Recipient address
     * @param _amount Amount of tokens to transfer
     */
    function safeTransfer(address _to, uint256 _amount) public {
        // Check for zero address
        if (_to == address(0)) {
            revert UnsafeTransfer(_to);
        }

        // Check if recipient has ETH balance > 0
        if (_to.balance == 0) {
            revert UnsafeTransfer(_to);
        }

        // Check if sender has enough tokens
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        // Perform the transfer
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit Transfer(msg.sender, _to, _amount);
    }

    /**
     * @dev Check if an address has already claimed tokens
     * @param _address Address to check
     * @return bool Whether the address has claimed
     */
    function hasClaimedTokens(address _address) public view returns (bool) {
        return hasClaimed[_address];
    }

    /**
     * @dev Get the balance of an address
     * @param _address Address to check balance for
     * @return uint256 Token balance
     */
    function balanceOf(address _address) public view returns (uint256) {
        return balances[_address];
    }

    /**
     * @dev Get remaining tokens available for claiming
     * @return uint256 Remaining claimable tokens
     */
    function remainingTokens() public view returns (uint256) {
        return totalSupply - totalClaimed;
    }

    /**
     * @dev Get total number of unique claimers
     * @return uint256 Number of addresses that have claimed (totalClaimed / CLAIM_AMOUNT)
     */
    function totalClaimers() public view returns (uint256) {
        return totalClaimed / CLAIM_AMOUNT;
    }
}
