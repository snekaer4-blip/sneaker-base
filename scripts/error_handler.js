const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const ERROR_TRIAGE_ADDRESS = '0xF7bfD650d7A02F05D2cfEfa31AA6106969b3899B'

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
const ERROR_TRIAGE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_a", "type": "uint256"},
      {"internalType": "uint256", "name": "_b", "type": "uint256"},
      {"internalType": "uint256", "name": "_c", "type": "uint256"},
      {"internalType": "uint256", "name": "_d", "type": "uint256"}
    ],
    "name": "diffWithNeighbor",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_base", "type": "uint256"},
      {"internalType": "int256", "name": "_modifier", "type": "int256"}
    ],
    "name": "applyModifier",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "popWithReturn",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_num", "type": "uint256"}],
    "name": "addToArr",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getArr",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetArr",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      address: ERROR_TRIAGE_ADDRESS,
      abi: ERROR_TRIAGE_ABI,
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
      address: ERROR_TRIAGE_ADDRESS,
      abi: ERROR_TRIAGE_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🛡️ ErrorTriageExercise Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${ERROR_TRIAGE_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Test diffWithNeighbor (pure function - read-only)
  console.log('\n📊 1. Testing diffWithNeighbor function...')
  const diffTests = [
    { name: 'diffWithNeighbor(10, 5, 8, 3)', args: [10, 5, 8, 3] },
    { name: 'diffWithNeighbor(100, 50, 75, 25)', args: [100, 50, 75, 25] },
    { name: 'diffWithNeighbor(1, 10, 5, 15)', args: [1, 10, 5, 15] }
  ]
  
  for (const test of diffTests) {
    const diffResult = await readFromContract('diffWithNeighbor', test.args)
    if (diffResult.success) {
      console.log(`   ✅ ${test.name}: [${diffResult.result.join(', ')}]`)
      results.push({ test: test.name, success: true })
    } else {
      console.log(`   ❌ ${test.name}: ${diffResult.error}`)
      results.push({ test: test.name, success: false })
    }
  }
  
  // 2. Test applyModifier (pure function - read-only)
  console.log('\n📊 2. Testing applyModifier function...')
  const modifierTests = [
    { name: 'applyModifier(1000, 50)', args: [1000, 50] },
    { name: 'applyModifier(1000, -50)', args: [1000, -50] },
    { name: 'applyModifier(1000, 0)', args: [1000, 0] },
    { name: 'applyModifier(1000, -100)', args: [1000, -100] }
  ]
  
  for (const test of modifierTests) {
    const modifierResult = await readFromContract('applyModifier', test.args)
    if (modifierResult.success) {
      console.log(`   ✅ ${test.name}: ${modifierResult.result}`)
      results.push({ test: test.name, success: true })
    } else {
      console.log(`   ❌ ${test.name}: ${modifierResult.error}`)
      results.push({ test: test.name, success: false })
    }
  }
  
  // 3. Reset array and add some numbers
  console.log('\n🔄 3. Resetting array...')
  const resetResult = await interactWithContract('resetArr')
  results.push({ test: 'resetArr', ...resetResult })
  await sleep(2000)
  
  // 4. Add numbers to array
  console.log('\n🔄 4. Adding numbers [10, 20, 30, 40, 50] to array...')
  const addNumbers = [10, 20, 30, 40, 50]
  const addResults = []
  
  for (const num of addNumbers) {
    const addResult = await interactWithContract('addToArr', [num])
    addResults.push({ test: `addToArr(${num})`, ...addResult })
    await sleep(1000)
  }
  results.push(...addResults)
  
  // 5. Read array
  console.log('\n📊 5. Reading array contents...')
  const getArrResult = await readFromContract('getArr')
  if (getArrResult.success) {
    console.log(`   ✅ Array contents: [${getArrResult.result.join(', ')}]`)
    results.push({ test: 'getArr', success: true })
  }
  
  // 6. Test popWithReturn function
  console.log('\n🔄 6. Testing popWithReturn function...')
  const popResult = await interactWithContract('popWithReturn')
  results.push({ test: 'popWithReturn', ...popResult })
  await sleep(2000)
  
  // 7. Read array after pop
  console.log('\n📊 7. Reading array after pop...')
  const getArrAfterPop = await readFromContract('getArr')
  if (getArrAfterPop.success) {
    console.log(`   ✅ Array after pop: [${getArrAfterPop.result.join(', ')}]`)
    results.push({ test: 'getArr (after pop)', success: true })
  }
  
  // 8. Test multiple pops
  console.log('\n🔄 8. Testing multiple pops...')
  for (let i = 0; i < 3; i++) {
    const popResult = await interactWithContract('popWithReturn')
    results.push({ test: `popWithReturn (${i + 2})`, ...popResult })
    await sleep(1000)
  }
  
  // 9. Final array state
  console.log('\n📊 9. Final array state...')
  const finalArr = await readFromContract('getArr')
  if (finalArr.success) {
    console.log(`   ✅ Final array: [${finalArr.result.join(', ')}]`)
    results.push({ test: 'getArr (final)', success: true })
  }
  
  // 10. Test edge case - try to pop from empty array (should fail)
  console.log('\n🔄 10. Testing pop from empty array (should fail)...')
  const emptyPopResult = await interactWithContract('popWithReturn')
  results.push({ test: 'popWithReturn (empty array)', ...emptyPopResult })
  
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
  
  if (successful >= total * 0.8) { // Allow some failures for edge cases
    console.log('🎉 ErrorTriageExercise interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
