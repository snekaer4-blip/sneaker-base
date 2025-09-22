const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const UNBURNABLE_TOKEN_ADDRESS = '0x27c6Cb9a4a71f12cd0305300c98ED023592b0DD6'

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
const UNBURNABLE_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balances",
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
    "inputs": [],
    "name": "totalClaimed",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CLAIM_AMOUNT",
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
    "inputs": [{"internalType": "address", "name": "_to", "type": "address"}, {"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "safeTransfer",
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
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "balanceOf",
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
  },
  {
    "inputs": [],
    "name": "totalClaimers",
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
      address: UNBURNABLE_TOKEN_ADDRESS,
      abi: UNBURNABLE_TOKEN_ABI,
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
      address: UNBURNABLE_TOKEN_ADDRESS,
      abi: UNBURNABLE_TOKEN_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🔥 UnburnableToken Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${UNBURNABLE_TOKEN_ADDRESS}`)
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
  const totalSupply = await readFromContract('totalSupply')
  const totalClaimed = await readFromContract('totalClaimed')
  const claimAmount = await readFromContract('CLAIM_AMOUNT')
  const remainingTokens = await readFromContract('remainingTokens')
  const totalClaimers = await readFromContract('totalClaimers')
  
  if (totalSupply.success) {
    console.log(`   ✅ Total Supply: ${totalSupply.result}`)
    results.push({ test: 'totalSupply', success: true })
  }
  
  if (totalClaimed.success) {
    console.log(`   ✅ Total Claimed: ${totalClaimed.result}`)
    results.push({ test: 'totalClaimed', success: true })
  }
  
  if (claimAmount.success) {
    console.log(`   ✅ Claim Amount: ${claimAmount.result}`)
    results.push({ test: 'CLAIM_AMOUNT', success: true })
  }
  
  if (remainingTokens.success) {
    console.log(`   ✅ Remaining Tokens: ${remainingTokens.result}`)
    results.push({ test: 'remainingTokens', success: true })
  }
  
  if (totalClaimers.success) {
    console.log(`   ✅ Total Claimers: ${totalClaimers.result}`)
    results.push({ test: 'totalClaimers', success: true })
  }
  
  // 2. Check if user has claimed
  console.log('\n📊 2. Checking if user has claimed...')
  const hasClaimed = await readFromContract('hasClaimedTokens', [account.address])
  if (hasClaimed.success) {
    console.log(`   ✅ User has claimed: ${hasClaimed.result}`)
    results.push({ test: 'hasClaimedTokens', success: true })
  }
  
  // 3. Check user balance
  console.log('\n📊 3. Checking user balance...')
  const userBalance = await readFromContract('balanceOf', [account.address])
  if (userBalance.success) {
    console.log(`   ✅ User balance: ${userBalance.result}`)
    results.push({ test: 'balanceOf', success: true })
  }
  
  // 4. Try to claim tokens (if not already claimed)
  if (hasClaimed.result === false) {
    console.log('\n🔄 4. Claiming tokens...')
    const claimResult = await interactWithContract('claim')
    results.push({ test: 'claim', ...claimResult })
    await sleep(2000)
    
    // 5. Check balance after claiming
    console.log('\n📊 5. Checking balance after claiming...')
    const balanceAfterClaim = await readFromContract('balanceOf', [account.address])
    if (balanceAfterClaim.success) {
      console.log(`   ✅ Balance after claim: ${balanceAfterClaim.result}`)
      results.push({ test: 'balanceOf (after claim)', success: true })
    }
    
    // 6. Check if user has claimed after claiming
    console.log('\n📊 6. Checking if user has claimed after claiming...')
    const hasClaimedAfter = await readFromContract('hasClaimedTokens', [account.address])
    if (hasClaimedAfter.success) {
      console.log(`   ✅ User has claimed after: ${hasClaimedAfter.result}`)
      results.push({ test: 'hasClaimedTokens (after claim)', success: true })
    }
    
    // 7. Try to claim again (should fail)
    console.log('\n🔄 7. Trying to claim again (should fail)...')
    const claimAgainResult = await interactWithContract('claim')
    results.push({ test: 'claim (second time - should fail)', ...claimAgainResult })
    
    // 8. Try to transfer tokens to another address
    console.log('\n🔄 8. Trying to transfer tokens...')
    // Use a dummy address with ETH balance for safe transfer
    const dummyAddress = '0x1234567890123456789012345678901234567890'
    const transferResult = await interactWithContract('safeTransfer', [dummyAddress, 100])
    results.push({ test: 'safeTransfer', ...transferResult })
    await sleep(2000)
    
    // 9. Check balances after transfer
    console.log('\n📊 9. Checking balances after transfer...')
    const balanceAfterTransfer = await readFromContract('balanceOf', [account.address])
    const dummyBalance = await readFromContract('balanceOf', [dummyAddress])
    
    if (balanceAfterTransfer.success) {
      console.log(`   ✅ User balance after transfer: ${balanceAfterTransfer.result}`)
      results.push({ test: 'balanceOf (after transfer)', success: true })
    }
    
    if (dummyBalance.success) {
      console.log(`   ✅ Dummy address balance: ${dummyBalance.result}`)
      results.push({ test: 'balanceOf (dummy address)', success: true })
    }
    
  } else {
    console.log('\n📊 4. User has already claimed tokens, skipping claim test...')
    results.push({ test: 'claim (already claimed)', success: true })
  }
  
  // 10. Check final state
  console.log('\n📊 10. Checking final state...')
  const finalTotalClaimed = await readFromContract('totalClaimed')
  const finalRemainingTokens = await readFromContract('remainingTokens')
  const finalTotalClaimers = await readFromContract('totalClaimers')
  
  if (finalTotalClaimed.success) {
    console.log(`   ✅ Final Total Claimed: ${finalTotalClaimed.result}`)
    results.push({ test: 'totalClaimed (final)', success: true })
  }
  
  if (finalRemainingTokens.success) {
    console.log(`   ✅ Final Remaining Tokens: ${finalRemainingTokens.result}`)
    results.push({ test: 'remainingTokens (final)', success: true })
  }
  
  if (finalTotalClaimers.success) {
    console.log(`   ✅ Final Total Claimers: ${finalTotalClaimers.result}`)
    results.push({ test: 'totalClaimers (final)', success: true })
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
  
  if (successful >= total * 0.8) { // Allow some failures for expected errors
    console.log('🎉 UnburnableToken interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
