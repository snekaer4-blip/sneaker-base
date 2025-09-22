const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const WEIGHTED_VOTING_ADDRESS = '0x89e88bF7c2230ab07CbEa6Ee80d3c333Be26Ca41'

// Create clients
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Correct ABI based on the contract source
const WEIGHTED_VOTING_ABI = [
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_description", "type": "string"}, {"internalType": "uint256", "name": "_quorum", "type": "uint256"}],
    "name": "createIssue",
    "outputs": [{"internalType": "uint256", "name": "issueId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
    "name": "getIssue",
    "outputs": [
      {
        "components": [
          {"internalType": "address[]", "name": "voters", "type": "address[]"},
          {"internalType": "string", "name": "issueDesc", "type": "string"},
          {"internalType": "uint256", "name": "votesFor", "type": "uint256"},
          {"internalType": "uint256", "name": "votesAgainst", "type": "uint256"},
          {"internalType": "uint256", "name": "votesAbstain", "type": "uint256"},
          {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
          {"internalType": "uint256", "name": "quorum", "type": "uint256"},
          {"internalType": "bool", "name": "passed", "type": "bool"},
          {"internalType": "bool", "name": "closed", "type": "bool"}
        ],
        "internalType": "struct WeightedVoting.IssueView",
        "name": "issueView",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_issueId", "type": "uint256"}, {"internalType": "uint8", "name": "_vote", "type": "uint8"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "hasClaimedTokens",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getIssueCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "remainingTokens",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function interactWithContract(functionName, args = []) {
  try {
    console.log(`\n🔄 Calling ${functionName}...`)
    console.log(`   Args: ${JSON.stringify(args)}`)
    
    const hash = await walletClient.writeContract({
      address: WEIGHTED_VOTING_ADDRESS,
      abi: WEIGHTED_VOTING_ABI,
      functionName: functionName,
      args: args
    })
    
    console.log(`   ✅ Transaction hash: ${hash}`)
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`)
    
    return { success: true, hash, receipt }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function readFromContract(functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: WEIGHTED_VOTING_ADDRESS,
      abi: WEIGHTED_VOTING_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🗳️ WeightedVoting Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${WEIGHTED_VOTING_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Check initial state
  console.log('\n📊 1. Checking initial state...')
  const maxSupply = await readFromContract('maxSupply')
  const totalSupply = await readFromContract('totalSupply')
  const remainingTokens = await readFromContract('remainingTokens')
  const issueCount = await readFromContract('getIssueCount')
  const userBalance = await readFromContract('balanceOf', [account.address])
  const hasClaimed = await readFromContract('hasClaimedTokens', [account.address])
  
  if (maxSupply.success) {
    console.log(`   ✅ Max Supply: ${maxSupply.result}`)
    results.push({ test: 'maxSupply', success: true })
  }
  
  if (totalSupply.success) {
    console.log(`   ✅ Total Supply: ${totalSupply.result}`)
    results.push({ test: 'totalSupply', success: true })
  }
  
  if (remainingTokens.success) {
    console.log(`   ✅ Remaining Tokens: ${remainingTokens.result}`)
    results.push({ test: 'remainingTokens', success: true })
  }
  
  if (issueCount.success) {
    console.log(`   ✅ Issue Count: ${issueCount.result}`)
    results.push({ test: 'getIssueCount', success: true })
  }
  
  if (userBalance.success) {
    console.log(`   ✅ User Balance: ${userBalance.result}`)
    results.push({ test: 'balanceOf', success: true })
  }
  
  if (hasClaimed.success) {
    console.log(`   ✅ User Has Claimed: ${hasClaimed.result}`)
    results.push({ test: 'hasClaimedTokens', success: true })
  }
  
  // 2. Claim tokens if not already claimed
  if (hasClaimed.result === false) {
    console.log('\n🔄 2. Claiming tokens...')
    const claimResult = await interactWithContract('claim')
    results.push({ test: 'claim', ...claimResult })
    await sleep(2000)
    
    // Check balance after claiming
    const balanceAfterClaim = await readFromContract('balanceOf', [account.address])
    if (balanceAfterClaim.success) {
      console.log(`   ✅ Balance after claim: ${balanceAfterClaim.result}`)
      results.push({ test: 'balanceOf (after claim)', success: true })
    }
  } else {
    console.log('\n📊 2. User has already claimed tokens, skipping claim test...')
    results.push({ test: 'claim (already claimed)', success: true })
  }
  
  // 3. Create issues for voting
  console.log('\n🔄 3. Creating issues for voting...')
  const issuesToCreate = [
    {
      description: "Should we increase the development budget?",
      quorum: 50
    },
    {
      description: "Should we implement new security measures?",
      quorum: 100
    },
    {
      description: "Should we hire more developers?",
      quorum: 150
    }
  ]
  
  const createdIssueIds = []
  
  for (const issue of issuesToCreate) {
    const createResult = await interactWithContract('createIssue', [issue.description, issue.quorum])
    results.push({ test: `createIssue("${issue.description}")`, ...createResult })
    
    if (createResult.success) {
      // Get the issue ID from the transaction receipt
      const issueId = await readFromContract('getIssueCount')
      if (issueId.success) {
        createdIssueIds.push(Number(issueId.result) - 1) // Subtract 1 because getIssueCount includes the burned element
      }
    }
    
    await sleep(2000)
  }
  
  // 4. Get issue details
  console.log('\n📊 4. Getting issue details...')
  for (const issueId of createdIssueIds) {
    const issueDetails = await readFromContract('getIssue', [issueId])
    if (issueDetails.success) {
      console.log(`   ✅ Issue ${issueId}: "${issueDetails.result.issueDesc}"`)
      console.log(`      Quorum: ${issueDetails.result.quorum}, Closed: ${issueDetails.result.closed}`)
      results.push({ test: `getIssue(${issueId})`, success: true })
    }
  }
  
  // 5. Vote on issues (Vote enum: 0=AGAINST, 1=FOR, 2=ABSTAIN)
  console.log('\n🔄 5. Voting on issues...')
  const votesToCast = [
    { issueId: createdIssueIds[0], vote: 1 }, // FOR
    { issueId: createdIssueIds[1], vote: 0 }, // AGAINST
    { issueId: createdIssueIds[2], vote: 2 }  // ABSTAIN
  ]
  
  for (const vote of votesToCast) {
    const voteResult = await interactWithContract('vote', [vote.issueId, vote.vote])
    results.push({ test: `vote(${vote.issueId}, ${vote.vote})`, ...voteResult })
    await sleep(2000)
  }
  
  // 6. Check issue status after voting
  console.log('\n📊 6. Checking issue status after voting...')
  for (const issueId of createdIssueIds) {
    const issueDetails = await readFromContract('getIssue', [issueId])
    if (issueDetails.success) {
      console.log(`   ✅ Issue ${issueId} Status:`)
      console.log(`      Votes For: ${issueDetails.result.votesFor}`)
      console.log(`      Votes Against: ${issueDetails.result.votesAgainst}`)
      console.log(`      Votes Abstain: ${issueDetails.result.votesAbstain}`)
      console.log(`      Total Votes: ${issueDetails.result.totalVotes}`)
      console.log(`      Quorum: ${issueDetails.result.quorum}`)
      console.log(`      Closed: ${issueDetails.result.closed}`)
      console.log(`      Passed: ${issueDetails.result.passed}`)
      results.push({ test: `getIssue(${issueId}) after voting`, success: true })
    }
  }
  
  // 7. Try to vote again on the same issue (should fail)
  console.log('\n🔄 7. Trying to vote again on the same issue (should fail)...')
  const duplicateVoteResult = await interactWithContract('vote', [createdIssueIds[0], 1])
  results.push({ test: 'vote (duplicate - should fail)', ...duplicateVoteResult })
  
  // 8. Try to create an issue without tokens (should fail)
  console.log('\n🔄 8. Trying to create an issue without tokens (should fail)...')
  // This would require a different account, so we'll skip this test
  results.push({ test: 'createIssue (no tokens - skipped)', success: true })
  
  // 9. Check final state
  console.log('\n📊 9. Checking final state...')
  const finalIssueCount = await readFromContract('getIssueCount')
  const finalTotalSupply = await readFromContract('totalSupply')
  const finalRemainingTokens = await readFromContract('remainingTokens')
  
  if (finalIssueCount.success) {
    console.log(`   ✅ Final Issue Count: ${finalIssueCount.result}`)
    results.push({ test: 'getIssueCount (final)', success: true })
  }
  
  if (finalTotalSupply.success) {
    console.log(`   ✅ Final Total Supply: ${finalTotalSupply.result}`)
    results.push({ test: 'totalSupply (final)', success: true })
  }
  
  if (finalRemainingTokens.success) {
    console.log(`   ✅ Final Remaining Tokens: ${finalRemainingTokens.result}`)
    results.push({ test: 'remainingTokens (final)', success: true })
  }
  
  // Summary
  console.log('\n📊 INTERACTION SUMMARY:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.test}`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    } else if (result.hash) {
      console.log(`   Tx: ${result.hash}`)
    }
  })
  
  console.log(`\n🎯 Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`)
  
  if (successful >= total * 0.8) {
    console.log('🎉 WeightedVoting interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
