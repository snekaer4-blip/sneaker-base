// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {WeightedVoting} from "../src/WeightedVoting.sol";

contract WeightedVotingTest is Test {
    WeightedVoting public voting;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    address public user4 = address(0x4);

    function setUp() public {
        voting = new WeightedVoting();
    }

    function testInitialState() public {
        assertEq(voting.name(), "WeightedVoting");
        assertEq(voting.symbol(), "WV");
        assertEq(voting.maxSupply(), 1_000_000);
        assertEq(voting.totalSupply(), 0);
        assertEq(voting.getIssueCount(), 1); // Burned zeroeth element
        assertFalse(voting.hasClaimedTokens(user1));
        assertEq(voting.remainingTokens(), 1_000_000);
    }

    function testSuccessfulClaim() public {
        vm.prank(user1);
        voting.claim();
        
        assertEq(voting.balanceOf(user1), 100);
        assertEq(voting.totalSupply(), 100);
        assertTrue(voting.hasClaimedTokens(user1));
        assertEq(voting.remainingTokens(), 1_000_000 - 100);
    }

    function testMultipleClaims() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user3);
        voting.claim();
        
        assertEq(voting.balanceOf(user1), 100);
        assertEq(voting.balanceOf(user2), 100);
        assertEq(voting.balanceOf(user3), 100);
        assertEq(voting.totalSupply(), 300);
    }

    function testDoubleClaimReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        vm.expectRevert(WeightedVoting.TokensClaimed.selector);
        voting.claim();
    }

    function testCreateIssueWithoutTokensReverts() public {
        vm.prank(user1);
        vm.expectRevert(WeightedVoting.NoTokensHeld.selector);
        voting.createIssue("Test Issue", 50);
    }

    function testCreateIssueWithHighQuorumReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(WeightedVoting.QuorumTooHigh.selector, 1000));
        voting.createIssue("Test Issue", 1000);
    }

    function testSuccessfulCreateIssue() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Should we upgrade the protocol?", 50);
        
        assertEq(issueId, 1); // First real issue (0 is burned)
        assertEq(voting.getIssueCount(), 2);
        
        WeightedVoting.IssueView memory issue = voting.getIssue(issueId);
        assertEq(issue.issueDesc, "Should we upgrade the protocol?");
        assertEq(issue.quorum, 50);
        assertEq(issue.votesFor, 0);
        assertEq(issue.votesAgainst, 0);
        assertEq(issue.votesAbstain, 0);
        assertEq(issue.totalVotes, 0);
        assertFalse(issue.passed);
        assertFalse(issue.closed);
        assertEq(issue.voters.length, 0);
    }

    function testVoteOnClosedIssueReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Test Issue", 50);
        
        vm.prank(user1);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        // Issue should be closed since user1 has 100 tokens and quorum is 50
        WeightedVoting.IssueView memory issue = voting.getIssue(issueId);
        assertTrue(issue.closed);
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user2);
        vm.expectRevert(WeightedVoting.VotingClosed.selector);
        voting.vote(issueId, WeightedVoting.Vote.AGAINST);
    }

    function testDoubleVoteReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Test Issue", 150);
        
        vm.prank(user1);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        vm.prank(user1);
        vm.expectRevert(WeightedVoting.AlreadyVoted.selector);
        voting.vote(issueId, WeightedVoting.Vote.AGAINST);
    }

    function testSuccessfulVoting() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user3);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Test Issue", 300);
        
        vm.prank(user1);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        WeightedVoting.IssueView memory issue = voting.getIssue(issueId);
        assertEq(issue.votesFor, 100);
        assertEq(issue.votesAgainst, 0);
        assertEq(issue.totalVotes, 100);
        assertEq(issue.voters.length, 1);
        assertFalse(issue.closed); // Not enough votes yet (100 < 300)
        
        vm.prank(user2);
        voting.vote(issueId, WeightedVoting.Vote.AGAINST);
        
        issue = voting.getIssue(issueId);
        assertEq(issue.votesFor, 100);
        assertEq(issue.votesAgainst, 100);
        assertEq(issue.totalVotes, 200);
        assertEq(issue.voters.length, 2);
        assertFalse(issue.closed); // Still not enough votes (200 < 300)
        
        vm.prank(user3);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        issue = voting.getIssue(issueId);
        assertEq(issue.votesFor, 200);
        assertEq(issue.votesAgainst, 100);
        assertEq(issue.totalVotes, 300);
        assertTrue(issue.closed); // Should be closed now (300 >= 300)
        assertTrue(issue.passed); // Should pass (200 > 100)
    }

    function testAbstainVoting() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Test Issue", 150);
        
        vm.prank(user1);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        vm.prank(user2);
        voting.vote(issueId, WeightedVoting.Vote.ABSTAIN);
        
        WeightedVoting.IssueView memory issue = voting.getIssue(issueId);
        assertEq(issue.votesFor, 100);
        assertEq(issue.votesAgainst, 0);
        assertEq(issue.votesAbstain, 100);
        assertEq(issue.totalVotes, 200);
        assertTrue(issue.closed);
        assertTrue(issue.passed); // Should pass (100 > 0)
    }

    function testIssueFailsWhenAgainstWins() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user2);
        voting.claim();
        
        vm.prank(user3);
        voting.claim();
        
        vm.prank(user1);
        uint256 issueId = voting.createIssue("Test Issue", 300);
        
        vm.prank(user1);
        voting.vote(issueId, WeightedVoting.Vote.FOR);
        
        vm.prank(user2);
        voting.vote(issueId, WeightedVoting.Vote.AGAINST);
        
        vm.prank(user3);
        voting.vote(issueId, WeightedVoting.Vote.AGAINST);
        
        WeightedVoting.IssueView memory issue = voting.getIssue(issueId);
        assertEq(issue.votesFor, 100);
        assertEq(issue.votesAgainst, 200);
        assertEq(issue.totalVotes, 300);
        assertTrue(issue.closed);
        assertFalse(issue.passed); // Should fail (100 < 200)
    }

    function testGetNonExistentIssueReverts() public {
        vm.expectRevert("Issue does not exist");
        voting.getIssue(999);
    }

    function testGetBurnedIssueReverts() public {
        vm.expectRevert("Cannot access burned issue");
        voting.getIssue(0);
    }

    function testVoteOnNonExistentIssueReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        vm.expectRevert("Issue does not exist");
        voting.vote(999, WeightedVoting.Vote.FOR);
    }

    function testVoteOnBurnedIssueReverts() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        vm.expectRevert("Cannot vote on burned issue");
        voting.vote(0, WeightedVoting.Vote.FOR);
    }

    function testMultipleIssues() public {
        vm.prank(user1);
        voting.claim();
        
        vm.prank(user1);
        uint256 issue1 = voting.createIssue("Issue 1", 50);
        
        vm.prank(user1);
        uint256 issue2 = voting.createIssue("Issue 2", 80);
        
        assertEq(issue1, 1);
        assertEq(issue2, 2);
        assertEq(voting.getIssueCount(), 3);
        
        WeightedVoting.IssueView memory issueView1 = voting.getIssue(issue1);
        WeightedVoting.IssueView memory issueView2 = voting.getIssue(issue2);
        
        assertEq(issueView1.issueDesc, "Issue 1");
        assertEq(issueView1.quorum, 50);
        
        assertEq(issueView2.issueDesc, "Issue 2");
        assertEq(issueView2.quorum, 80);
    }
}
