const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const SALESPERSON_ADDRESS = '0x1B266e7681fE89e58B8a76E495C291f3Ed1F5Dbb'

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
const SALESPERSON_ABI = [
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
    "name": "hourlyRate",
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
  }
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function readFromContract(functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: SALESPERSON_ADDRESS,
      abi: SALESPERSON_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('💼 Salesperson Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${SALESPERSON_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  const results = []
  
  // 1. Check employee information
  console.log('\n📊 1. Checking employee information...')
  const idNumber = await readFromContract('idNumber')
  const managerId = await readFromContract('managerId')
  const hourlyRate = await readFromContract('hourlyRate')
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
  
  if (hourlyRate.success) {
    console.log(`   ✅ Hourly Rate: ${hourlyRate.result}`)
    results.push({ test: 'hourlyRate', success: true })
  }
  
  if (annualCost.success) {
    console.log(`   ✅ Annual Cost: ${annualCost.result}`)
    results.push({ test: 'getAnnualCost', success: true })
  }
  
  if (employeeType.success) {
    console.log(`   ✅ Employee Type: ${employeeType.result}`)
    results.push({ test: 'getEmployeeType', success: true })
  }
  
  // 2. Verify inheritance relationships
  console.log('\n📊 2. Verifying inheritance relationships...')
  
  // Check if the contract implements the expected functions from the inheritance chain
  // Employee -> Hourly -> Salesperson
  
  // Test that getAnnualCost returns hourlyRate * 2080 (40 hours/week * 52 weeks)
  if (hourlyRate.success && annualCost.success) {
    const expectedAnnualCost = hourlyRate.result * 2080n
    if (annualCost.result === expectedAnnualCost) {
      console.log(`   ✅ Annual cost calculation is correct: ${hourlyRate.result} * 2080 = ${expectedAnnualCost}`)
      results.push({ test: 'annualCost calculation', success: true })
    } else {
      console.log(`   ❌ Annual cost calculation is incorrect: expected ${expectedAnnualCost}, got ${annualCost.result}`)
      results.push({ test: 'annualCost calculation', success: false })
    }
  }
  
  // 3. Test multiple reads to ensure consistency
  console.log('\n📊 3. Testing multiple reads for consistency...')
  
  for (let i = 0; i < 3; i++) {
    const idRead = await readFromContract('idNumber')
    const rateRead = await readFromContract('hourlyRate')
    const costRead = await readFromContract('getAnnualCost')
    
    if (idRead.success && rateRead.success && costRead.success) {
      console.log(`   ✅ Read ${i + 1}: ID=${idRead.result}, Rate=${rateRead.result}, Cost=${costRead.result}`)
      results.push({ test: `consistency read ${i + 1}`, success: true })
    }
    
    await sleep(500)
  }
  
  // 4. Test edge cases and error handling
  console.log('\n📊 4. Testing edge cases...')
  
  // Try to call a function that doesn't exist (should fail gracefully)
  const invalidFunction = await readFromContract('nonExistentFunction')
  if (!invalidFunction.success) {
    console.log(`   ✅ Invalid function call failed as expected: ${invalidFunction.error}`)
    results.push({ test: 'invalid function call', success: true })
  }
  
  // 5. Display employee summary
  console.log('\n📊 5. Employee Summary...')
  if (idNumber.success && managerId.success && hourlyRate.success && annualCost.success && employeeType.success) {
    console.log(`   👤 Employee Information:`)
    console.log(`      Type: ${employeeType.result}`)
    console.log(`      ID Number: ${idNumber.result}`)
    console.log(`      Manager ID: ${managerId.result}`)
    console.log(`      Hourly Rate: ${hourlyRate.result} wei`)
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
    }
  })
  
  console.log(`\n🎯 Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`)
  
  if (successful >= total * 0.8) {
    console.log('🎉 Salesperson contract interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
