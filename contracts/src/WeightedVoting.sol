// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract WeightedVoting is ERC20 {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Maximum supply of tokens
    uint256 public constant maxSupply = 1_000_000;
    
    // Track claimed addresses
    mapping(address => bool) private hasClaimed;

    // Custom errors
    error TokensClaimed();
    error AllTokensClaimed();
    error NoTokensHeld();
    error QuorumTooHigh(uint256 quorum);
    error AlreadyVoted();
    error VotingClosed();

    // Vote enum
    enum Vote {
        AGAINST,
        FOR,
        ABSTAIN
    }

    // Issue struct - order is important for unit tests
    struct Issue {
        EnumerableSet.AddressSet voters;
        string issueDesc;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVotes;
        uint256 quorum;
        bool passed;
        bool closed;
    }

    // Return struct for getIssue (without EnumerableSet)
    struct IssueView {
        address[] voters;
        string issueDesc;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVotes;
        uint256 quorum;
        bool passed;
        bool closed;
    }

    // Array of issues
    Issue[] private issues;

    // Events
    event IssueClaimed(address indexed claimer, uint256 amount);
    event IssueCreated(uint256 indexed issueId, string description, uint256 quorum);
    event VoteCast(uint256 indexed issueId, address indexed voter, Vote vote, uint256 weight);
    event IssueResolved(uint256 indexed issueId, bool passed);

    /**
     * @dev Constructor initializes ERC-20 token and burns the zeroeth element
     */
    constructor() ERC20("WeightedVoting", "WV") {
        // Create and "burn" the zeroeth element of issues
        issues.push();
        // The zeroeth issue is now initialized with default values and effectively "burned"
    }

    /**
     * @dev Allows eligible wallets to claim 100 tokens once
     */
    function claim() public {
        // Check if all tokens have been claimed
        if (totalSupply() >= maxSupply) {
            revert AllTokensClaimed();
        }

        // Check if this wallet has already claimed
        if (hasClaimed[msg.sender]) {
            revert TokensClaimed();
        }

        // Check if there are enough tokens left to claim
        if (totalSupply() + 100 > maxSupply) {
            revert AllTokensClaimed();
        }

        // Mark as claimed and mint tokens
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, 100);

        emit IssueClaimed(msg.sender, 100);
    }

    /**
     * @dev Create a new issue for voting
     * @param _description Description of the issue
     * @param _quorum Number of votes needed to close the issue
     * @return issueId The index of the newly created issue
     */
    function createIssue(string memory _description, uint256 _quorum) external returns (uint256 issueId) {
        // Check if the caller holds tokens first (as per warning)
        if (balanceOf(msg.sender) == 0) {
            revert NoTokensHeld();
        }

        // Check if quorum is not greater than total supply
        if (_quorum > totalSupply()) {
            revert QuorumTooHigh(_quorum);
        }

        // Create new issue
        issues.push();
        issueId = issues.length - 1;
        
        Issue storage newIssue = issues[issueId];
        newIssue.issueDesc = _description;
        newIssue.quorum = _quorum;
        newIssue.votesFor = 0;
        newIssue.votesAgainst = 0;
        newIssue.votesAbstain = 0;
        newIssue.totalVotes = 0;
        newIssue.passed = false;
        newIssue.closed = false;

        emit IssueCreated(issueId, _description, _quorum);
        
        return issueId;
    }

    /**
     * @dev Get all data for an issue
     * @param _id The issue ID
     * @return issueView The issue data without EnumerableSet
     */
    function getIssue(uint256 _id) external view returns (IssueView memory issueView) {
        require(_id < issues.length, "Issue does not exist");
        require(_id > 0, "Cannot access burned issue");
        
        Issue storage issue = issues[_id];
        
        // Convert EnumerableSet to array
        address[] memory votersList = new address[](issue.voters.length());
        for (uint256 i = 0; i < issue.voters.length(); i++) {
            votersList[i] = issue.voters.at(i);
        }
        
        issueView = IssueView({
            voters: votersList,
            issueDesc: issue.issueDesc,
            votesFor: issue.votesFor,
            votesAgainst: issue.votesAgainst,
            votesAbstain: issue.votesAbstain,
            totalVotes: issue.totalVotes,
            quorum: issue.quorum,
            passed: issue.passed,
            closed: issue.closed
        });
        
        return issueView;
    }

    /**
     * @dev Vote on an issue with all of the caller's tokens
     * @param _issueId The issue to vote on
     * @param _vote The vote choice (AGAINST, FOR, ABSTAIN)
     */
    function vote(uint256 _issueId, Vote _vote) public {
        require(_issueId < issues.length, "Issue does not exist");
        require(_issueId > 0, "Cannot vote on burned issue");
        
        Issue storage issue = issues[_issueId];
        
        // Check if voting is still open
        if (issue.closed) {
            revert VotingClosed();
        }
        
        // Check if the voter has already voted
        if (issue.voters.contains(msg.sender)) {
            revert AlreadyVoted();
        }
        
        // Get the voter's token balance
        uint256 voterWeight = balanceOf(msg.sender);
        require(voterWeight > 0, "No tokens to vote with");
        
        // Add voter to the set
        issue.voters.add(msg.sender);
        
        // Record the vote
        if (_vote == Vote.FOR) {
            issue.votesFor += voterWeight;
        } else if (_vote == Vote.AGAINST) {
            issue.votesAgainst += voterWeight;
        } else if (_vote == Vote.ABSTAIN) {
            issue.votesAbstain += voterWeight;
        }
        
        issue.totalVotes += voterWeight;
        
        emit VoteCast(_issueId, msg.sender, _vote, voterWeight);
        
        // Check if quorum is reached
        if (issue.totalVotes >= issue.quorum) {
            issue.closed = true;
            
            // Check if more votes for than against
            if (issue.votesFor > issue.votesAgainst) {
                issue.passed = true;
            }
            
            emit IssueResolved(_issueId, issue.passed);
        }
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
     * @dev Get the number of issues (including burned zeroeth)
     * @return uint256 Number of issues
     */
    function getIssueCount() public view returns (uint256) {
        return issues.length;
    }

    /**
     * @dev Get remaining tokens available for claiming
     * @return uint256 Remaining claimable tokens
     */
    function remainingTokens() public view returns (uint256) {
        return maxSupply - totalSupply();
    }
}
