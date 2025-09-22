// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {UnburnableToken} from "../src/UnburnableToken.sol";

contract UnburnableTokenTest is Test {
    UnburnableToken public token;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public zeroAddress = address(0);

    function setUp() public {
        token = new UnburnableToken();
        
        // Give test addresses some ETH for safeTransfer tests
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
    }

    function testInitialState() public {
        assertEq(token.totalSupply(), 100_000_000);
        assertEq(token.totalClaimed(), 0);
        assertEq(token.CLAIM_AMOUNT(), 1000);
        assertEq(token.balanceOf(user1), 0);
        assertFalse(token.hasClaimedTokens(user1));
    }

    function testSuccessfulClaim() public {
        vm.prank(user1);
        token.claim();
        
        assertEq(token.balanceOf(user1), 1000);
        assertEq(token.totalClaimed(), 1000);
        assertTrue(token.hasClaimedTokens(user1));
        assertEq(token.totalClaimers(), 1);
        assertEq(token.remainingTokens(), 100_000_000 - 1000);
    }

    function testMultipleClaims() public {
        vm.prank(user1);
        token.claim();
        
        vm.prank(user2);
        token.claim();
        
        vm.prank(user3);
        token.claim();
        
        assertEq(token.balanceOf(user1), 1000);
        assertEq(token.balanceOf(user2), 1000);
        assertEq(token.balanceOf(user3), 1000);
        assertEq(token.totalClaimed(), 3000);
        assertEq(token.totalClaimers(), 3);
    }

    function testDoubleClaimReverts() public {
        vm.prank(user1);
        token.claim();
        
        vm.prank(user1);
        vm.expectRevert(UnburnableToken.TokensClaimed.selector);
        token.claim();
    }

    function testSuccessfulSafeTransfer() public {
        // First, user1 claims tokens
        vm.prank(user1);
        token.claim();
        
        assertEq(token.balanceOf(user1), 1000);
        assertEq(token.balanceOf(user2), 0);
        
        // Then transfers to user2
        vm.prank(user1);
        token.safeTransfer(user2, 500);
        
        assertEq(token.balanceOf(user1), 500);
        assertEq(token.balanceOf(user2), 500);
    }

    function testSafeTransferToZeroAddressReverts() public {
        vm.prank(user1);
        token.claim();
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(UnburnableToken.UnsafeTransfer.selector, zeroAddress));
        token.safeTransfer(zeroAddress, 100);
    }

    function testSafeTransferToAddressWithoutEthReverts() public {
        address noEthAddress = address(0x999);
        // Ensure this address has no ETH
        assertEq(noEthAddress.balance, 0);
        
        vm.prank(user1);
        token.claim();
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(UnburnableToken.UnsafeTransfer.selector, noEthAddress));
        token.safeTransfer(noEthAddress, 100);
    }

    function testSafeTransferInsufficientBalance() public {
        vm.prank(user1);
        token.claim();
        
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        token.safeTransfer(user2, 1001); // More than claimed amount
    }

    function testSafeTransferWithoutClaiming() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        token.safeTransfer(user2, 100);
    }

    function testRemainingTokensCalculation() public {
        assertEq(token.remainingTokens(), 100_000_000);
        
        vm.prank(user1);
        token.claim();
        assertEq(token.remainingTokens(), 100_000_000 - 1000);
        
        vm.prank(user2);
        token.claim();
        assertEq(token.remainingTokens(), 100_000_000 - 2000);
    }

    function testTotalClaimersCount() public {
        assertEq(token.totalClaimers(), 0);
        
        vm.prank(user1);
        token.claim();
        assertEq(token.totalClaimers(), 1);
        
        vm.prank(user2);
        token.claim();
        assertEq(token.totalClaimers(), 2);
        
        vm.prank(user3);
        token.claim();
        assertEq(token.totalClaimers(), 3);
    }

    function testHasClaimedTokensTracking() public {
        assertFalse(token.hasClaimedTokens(user1));
        assertFalse(token.hasClaimedTokens(user2));
        
        vm.prank(user1);
        token.claim();
        
        assertTrue(token.hasClaimedTokens(user1));
        assertFalse(token.hasClaimedTokens(user2));
        
        vm.prank(user2);
        token.claim();
        
        assertTrue(token.hasClaimedTokens(user1));
        assertTrue(token.hasClaimedTokens(user2));
    }

    // Note: Testing AllTokensClaimed would require 100,000 transactions which is impractical
    // but the logic is there for when totalClaimed approaches totalSupply
}
