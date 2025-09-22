const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const EMPLOYEE_STORAGE_ADDRESS = '0x0ba31bFD495143b065f4E18167a31999F0d80371'

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
const EMPLOYEE_STORAGE_ABI = [
  {
    "inputs": [],
    "name": "idNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewSalary",
    "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewShares",
    "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint16", "name": "_newShares", "type": "uint16"}],
    "name": "grantShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_slot", "type": "uint256"}],
    "name": "checkForPacking",
    "outputs": [{"internalType": "uint256", "name": "r", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "debugResetShares",
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
      address: EMPLOYEE_STORAGE_ADDRESS,
      abi: EMPLOYEE_STORAGE_ABI,
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
      address: EMPLOYEE_STORAGE_ADDRESS,
      abi: EMPLOYEE_STORAGE_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('👤 EmployeeStorage Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${EMPLOYEE_STORAGE_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Read employee data (set during deployment)
  console.log('\n📊 1. Reading employee data...')
  
  const employeeName = await readFromContract('name')
  const employeeId = await readFromContract('idNumber')
  const employeeSalary = await readFromContract('viewSalary')
  const employeeShares = await readFromContract('viewShares')
  
  if (employeeName.success) {
    console.log(`   ✅ Employee Name: "${employeeName.result}"`)
    results.push({ test: 'name', success: true })
  }
  
  if (employeeId.success) {
    console.log(`   ✅ Employee ID: ${employeeId.result}`)
    results.push({ test: 'idNumber', success: true })
  }
  
  if (employeeSalary.success) {
    console.log(`   ✅ Employee Salary: $${employeeSalary.result}`)
    results.push({ test: 'viewSalary', success: true })
  }
  
  if (employeeShares.success) {
    console.log(`   ✅ Employee Shares: ${employeeShares.result}`)
    results.push({ test: 'viewShares (initial)', success: true })
  }
  
  // 2. Grant additional shares (safe amount)
  console.log('\n🔄 2. Granting 500 additional shares...')
  const grantSharesResult = await interactWithContract('grantShares', [500])
  results.push({ test: 'grantShares (500)', ...grantSharesResult })
  await sleep(2000)
  
  // 3. Check updated shares
  console.log('\n📊 3. Checking updated shares...')
  const updatedShares = await readFromContract('viewShares')
  if (updatedShares.success) {
    console.log(`   ✅ Updated Shares: ${updatedShares.result}`)
    results.push({ test: 'viewShares (after grant)', success: true })
  }
  
  // 4. Try to grant more shares (should work if under 5000 limit)
  console.log('\n🔄 4. Granting 1000 more shares...')
  const grantMoreSharesResult = await interactWithContract('grantShares', [1000])
  results.push({ test: 'grantShares (1000)', ...grantMoreSharesResult })
  await sleep(2000)
  
  // 5. Check final shares
  console.log('\n📊 5. Checking final shares...')
  const finalShares = await readFromContract('viewShares')
  if (finalShares.success) {
    console.log(`   ✅ Final Shares: ${finalShares.result}`)
    results.push({ test: 'viewShares (final)', success: true })
  }
  
  // 6. Test debug reset function
  console.log('\n🔄 6. Testing debug reset shares function...')
  const resetResult = await interactWithContract('debugResetShares')
  results.push({ test: 'debugResetShares', ...resetResult })
  await sleep(2000)
  
  // 7. Check shares after reset
  console.log('\n📊 7. Checking shares after reset...')
  const resetShares = await readFromContract('viewShares')
  if (resetShares.success) {
    console.log(`   ✅ Shares after reset: ${resetShares.result}`)
    results.push({ test: 'viewShares (after reset)', success: true })
  }
  
  // 8. Test storage packing (check slot 0)
  console.log('\n📊 8. Testing storage packing...')
  const slot0 = await readFromContract('checkForPacking', [0])
  if (slot0.success) {
    console.log(`   ✅ Slot 0 value: ${slot0.result}`)
    console.log(`   ✅ Slot 0 hex: 0x${slot0.result.toString(16)}`)
    results.push({ test: 'checkForPacking (slot 0)', success: true })
  }
  
  // 9. Test storage packing (check slot 1)
  console.log('\n📊 9. Testing storage packing (slot 1)...')
  const slot1 = await readFromContract('checkForPacking', [1])
  if (slot1.success) {
    console.log(`   ✅ Slot 1 value: ${slot1.result}`)
    results.push({ test: 'checkForPacking (slot 1)', success: true })
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
    console.log('🎉 All EmployeeStorage interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
