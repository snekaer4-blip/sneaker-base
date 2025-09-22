const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const ARRAYS_EXERCISE_ADDRESS = '0xbE04F0E14f34bcc1169013d3738b7FA7c543062F'

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
const ARRAYS_EXERCISE_ABI = [
  {
    "inputs": [],
    "name": "getNumbers",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetNumbers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256[]", "name": "_toAppend", "type": "uint256[]"}],
    "name": "appendToNumbers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_unixTimestamp", "type": "uint256"}],
    "name": "saveTimestamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "afterY2K",
    "outputs": [
      {"internalType": "uint256[]", "name": "recentTimestamps", "type": "uint256[]"},
      {"internalType": "address[]", "name": "recentSenders", "type": "address[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSenders",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimestamps",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNumbersLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSendersLength",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimestampsLength",
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
      address: ARRAYS_EXERCISE_ADDRESS,
      abi: ARRAYS_EXERCISE_ABI,
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
      address: ARRAYS_EXERCISE_ADDRESS,
      abi: ARRAYS_EXERCISE_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🎯 ArraysExercise Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${ARRAYS_EXERCISE_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Read initial numbers array
  console.log('\n📊 1. Reading initial numbers array...')
  const initialNumbers = await readFromContract('getNumbers')
  if (initialNumbers.success) {
    console.log(`   ✅ Initial numbers: [${initialNumbers.result.join(', ')}]`)
    results.push({ test: 'getNumbers (initial)', success: true })
  }
  
  // 2. Get array length
  console.log('\n📊 2. Getting numbers array length...')
  const length = await readFromContract('getNumbersLength')
  if (length.success) {
    console.log(`   ✅ Numbers length: ${length.result}`)
    results.push({ test: 'getNumbersLength', success: true })
  }
  
  // 3. Append new numbers to the array
  console.log('\n🔄 3. Appending numbers [11, 12, 13] to array...')
  const appendResult = await interactWithContract('appendToNumbers', [[11, 12, 13]])
  results.push({ test: 'appendToNumbers', ...appendResult })
  await sleep(2000)
  
  // 4. Read updated numbers array
  console.log('\n📊 4. Reading updated numbers array...')
  const updatedNumbers = await readFromContract('getNumbers')
  if (updatedNumbers.success) {
    console.log(`   ✅ Updated numbers: [${updatedNumbers.result.join(', ')}]`)
    results.push({ test: 'getNumbers (after append)', success: true })
  }
  
  // 5. Save a timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000)
  console.log(`\n🔄 5. Saving timestamp ${currentTimestamp}...`)
  const timestampResult = await interactWithContract('saveTimestamp', [currentTimestamp])
  results.push({ test: 'saveTimestamp', ...timestampResult })
  await sleep(2000)
  
  // 6. Get senders and timestamps
  console.log('\n📊 6. Reading senders and timestamps...')
  const senders = await readFromContract('getSenders')
  const timestamps = await readFromContract('getTimestamps')
  
  if (senders.success && timestamps.success) {
    console.log(`   ✅ Senders: [${senders.result.join(', ')}]`)
    console.log(`   ✅ Timestamps: [${timestamps.result.join(', ')}]`)
    results.push({ test: 'getSenders/getTimestamps', success: true })
  }
  
  // 7. Test afterY2K function
  console.log('\n📊 7. Testing afterY2K function...')
  const afterY2K = await readFromContract('afterY2K')
  if (afterY2K.success) {
    const [recentTimestamps, recentSenders] = afterY2K.result
    console.log(`   ✅ After Y2K timestamps: [${recentTimestamps.join(', ')}]`)
    console.log(`   ✅ After Y2K senders: [${recentSenders.join(', ')}]`)
    results.push({ test: 'afterY2K', success: true })
  }
  
  // 8. Reset numbers array
  console.log('\n🔄 8. Resetting numbers array...')
  const resetResult = await interactWithContract('resetNumbers')
  results.push({ test: 'resetNumbers', ...resetResult })
  await sleep(2000)
  
  // 9. Verify reset
  console.log('\n📊 9. Verifying numbers array reset...')
  const resetNumbers = await readFromContract('getNumbers')
  if (resetNumbers.success) {
    console.log(`   ✅ Reset numbers: [${resetNumbers.result.join(', ')}]`)
    results.push({ test: 'getNumbers (after reset)', success: true })
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
  
  if (successful === total) {
    console.log('🎉 All ArraysExercise interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
