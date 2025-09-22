const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const ENGINEERING_MANAGER_ADDRESS = '0x36f890Ba1d975A04b4e46D9a6Da6Eb0894dBdF4d'

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
const ENGINEERING_MANAGER_ABI = [
  {
    "inputs": [],
    "name": "idNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "managerId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "annualSalary",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAnnualCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmployeeType",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReports",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReportsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_employeeId", "type": "uint256"}],
    "name": "isReport",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_employeeId", "type": "uint256"}],
    "name": "addReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_engineerId", "type": "uint256"}],
    "name": "addEngineerReport",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalReportsCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetReports",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_employeeId", "type": "uint256"}],
    "name": "removeReport",
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
      address: ENGINEERING_MANAGER_ADDRESS,
      abi: ENGINEERING_MANAGER_ABI,
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
      address: ENGINEERING_MANAGER_ADDRESS,
      abi: ENGINEERING_MANAGER_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🔧 EngineeringManager Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${ENGINEERING_MANAGER_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Check employee information
  console.log('\n📊 1. Checking employee information...')
  const idNumber = await readFromContract('idNumber')
  const managerId = await readFromContract('managerId')
  const annualSalary = await readFromContract('annualSalary')
  const annualCost = await readFromContract('getAnnualCost')
  const employeeType = await readFromContract('getEmployeeType')
  
  if (idNumber.success) {
    console.log(`   ✅ ID Number: ${idNumber.result}`)
    results.push({ test: 'idNumber', success: true })
  }
  
  if (managerId.success) {
    console.log(`   ✅ Manager ID: ${managerId.result}`)
    results.push({ test: 'managerId', success: true })
  }
  
  if (annualSalary.success) {
    console.log(`   ✅ Annual Salary: ${annualSalary.result}`)
    results.push({ test: 'annualSalary', success: true })
  }
  
  if (annualCost.success) {
    console.log(`   ✅ Annual Cost: ${annualCost.result}`)
    results.push({ test: 'getAnnualCost', success: true })
  }
  
  if (employeeType.success) {
    console.log(`   ✅ Employee Type: ${employeeType.result}`)
    results.push({ test: 'getEmployeeType', success: true })
  }
  
  // 2. Check initial reports state
  console.log('\n📊 2. Checking initial reports state...')
  const initialReports = await readFromContract('getReports')
  const initialReportsCount = await readFromContract('getReportsCount')
  const initialTotalCost = await readFromContract('getTotalReportsCost')
  
  if (initialReports.success) {
    console.log(`   ✅ Initial Reports: [${initialReports.result.join(', ')}]`)
    results.push({ test: 'getReports (initial)', success: true })
  }
  
  if (initialReportsCount.success) {
    console.log(`   ✅ Initial Reports Count: ${initialReportsCount.result}`)
    results.push({ test: 'getReportsCount (initial)', success: true })
  }
  
  if (initialTotalCost.success) {
    console.log(`   ✅ Initial Total Reports Cost: ${initialTotalCost.result}`)
    results.push({ test: 'getTotalReportsCost (initial)', success: true })
  }
  
  // 3. Add reports
  console.log('\n🔄 3. Adding reports...')
  const reportsToAdd = [101, 102, 103, 104, 105]
  
  for (const reportId of reportsToAdd) {
    const addResult = await interactWithContract('addReport', [reportId])
    results.push({ test: `addReport(${reportId})`, ...addResult })
    await sleep(2000)
  }
  
  // 4. Check reports after adding
  console.log('\n📊 4. Checking reports after adding...')
  const reportsAfterAdd = await readFromContract('getReports')
  const reportsCountAfterAdd = await readFromContract('getReportsCount')
  const totalCostAfterAdd = await readFromContract('getTotalReportsCost')
  
  if (reportsAfterAdd.success) {
    console.log(`   ✅ Reports after adding: [${reportsAfterAdd.result.join(', ')}]`)
    results.push({ test: 'getReports (after add)', success: true })
  }
  
  if (reportsCountAfterAdd.success) {
    console.log(`   ✅ Reports count after adding: ${reportsCountAfterAdd.result}`)
    results.push({ test: 'getReportsCount (after add)', success: true })
  }
  
  if (totalCostAfterAdd.success) {
    console.log(`   ✅ Total cost after adding: ${totalCostAfterAdd.result}`)
    results.push({ test: 'getTotalReportsCost (after add)', success: true })
  }
  
  // 5. Check if specific reports exist
  console.log('\n📊 5. Checking if specific reports exist...')
  for (const reportId of reportsToAdd) {
    const isReport = await readFromContract('isReport', [reportId])
    if (isReport.success) {
      console.log(`   ✅ Report ${reportId} exists: ${isReport.result}`)
      results.push({ test: `isReport(${reportId})`, success: true })
    }
  }
  
  // 6. Add engineer reports using the specialized function
  console.log('\n🔄 6. Adding engineer reports...')
  const engineerReports = [201, 202, 203]
  
  for (const engineerId of engineerReports) {
    const addEngineerResult = await interactWithContract('addEngineerReport', [engineerId])
    results.push({ test: `addEngineerReport(${engineerId})`, ...addEngineerResult })
    await sleep(2000)
  }
  
  // 7. Check reports after adding engineers
  console.log('\n📊 7. Checking reports after adding engineers...')
  const reportsAfterEngineers = await readFromContract('getReports')
  const reportsCountAfterEngineers = await readFromContract('getReportsCount')
  const totalCostAfterEngineers = await readFromContract('getTotalReportsCost')
  
  if (reportsAfterEngineers.success) {
    console.log(`   ✅ Reports after adding engineers: [${reportsAfterEngineers.result.join(', ')}]`)
    results.push({ test: 'getReports (after engineers)', success: true })
  }
  
  if (reportsCountAfterEngineers.success) {
    console.log(`   ✅ Reports count after adding engineers: ${reportsCountAfterEngineers.result}`)
    results.push({ test: 'getReportsCount (after engineers)', success: true })
  }
  
  if (totalCostAfterEngineers.success) {
    console.log(`   ✅ Total cost after adding engineers: ${totalCostAfterEngineers.result}`)
    results.push({ test: 'getTotalReportsCost (after engineers)', success: true })
  }
  
  // 8. Remove a report
  console.log('\n🔄 8. Removing a report...')
  const removeResult = await interactWithContract('removeReport', [101])
  results.push({ test: 'removeReport(101)', ...removeResult })
  await sleep(2000)
  
  // 9. Check reports after removal
  console.log('\n📊 9. Checking reports after removal...')
  const reportsAfterRemoval = await readFromContract('getReports')
  const reportsCountAfterRemoval = await readFromContract('getReportsCount')
  
  if (reportsAfterRemoval.success) {
    console.log(`   ✅ Reports after removal: [${reportsAfterRemoval.result.join(', ')}]`)
    results.push({ test: 'getReports (after removal)', success: true })
  }
  
  if (reportsCountAfterRemoval.success) {
    console.log(`   ✅ Reports count after removal: ${reportsCountAfterRemoval.result}`)
    results.push({ test: 'getReportsCount (after removal)', success: true })
  }
  
  // 10. Reset reports
  console.log('\n🔄 10. Resetting reports...')
  const resetResult = await interactWithContract('resetReports')
  results.push({ test: 'resetReports', ...resetResult })
  await sleep(2000)
  
  // 11. Check reports after reset
  console.log('\n📊 11. Checking reports after reset...')
  const reportsAfterReset = await readFromContract('getReports')
  const reportsCountAfterReset = await readFromContract('getReportsCount')
  const totalCostAfterReset = await readFromContract('getTotalReportsCost')
  
  if (reportsAfterReset.success) {
    console.log(`   ✅ Reports after reset: [${reportsAfterReset.result.join(', ')}]`)
    results.push({ test: 'getReports (after reset)', success: true })
  }
  
  if (reportsCountAfterReset.success) {
    console.log(`   ✅ Reports count after reset: ${reportsCountAfterReset.result}`)
    results.push({ test: 'getReportsCount (after reset)', success: true })
  }
  
  if (totalCostAfterReset.success) {
    console.log(`   ✅ Total cost after reset: ${totalCostAfterReset.result}`)
    results.push({ test: 'getTotalReportsCost (after reset)', success: true })
  }
  
  // 12. Display employee summary
  console.log('\n📊 12. Employee Summary...')
  if (idNumber.success && managerId.success && annualSalary.success && annualCost.success && employeeType.success) {
    console.log(`   👤 Employee Information:`)
    console.log(`      Type: ${employeeType.result}`)
    console.log(`      ID Number: ${idNumber.result}`)
    console.log(`      Manager ID: ${managerId.result}`)
    console.log(`      Annual Salary: ${annualSalary.result} wei`)
    console.log(`      Annual Cost: ${annualCost.result} wei`)
    console.log(`      Annual Cost (ETH): ${formatEther(annualCost.result)} ETH`)
    
    results.push({ test: 'employee summary', success: true })
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
    console.log('🎉 EngineeringManager interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
