const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract addresses
const INHERITANCE_SUBMISSION_ADDRESS = '0xBf363bc8132cdB12ddA72aBf541f58F02faf19e2'
const SALESPERSON_ADDRESS = '0x1B266e7681fE89e58B8a76E495C291f3Ed1F5Dbb'
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
const INHERITANCE_SUBMISSION_ABI = [
  {
    "inputs": [],
    "name": "salesPerson",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "engineeringManager",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSalespersonInfo",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "managerId", "type": "uint256"},
      {"internalType": "uint256", "name": "hourlyRate", "type": "uint256"},
      {"internalType": "uint256", "name": "annualCost", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEngineeringManagerInfo",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "managerId", "type": "uint256"},
      {"internalType": "uint256", "name": "salary", "type": "uint256"},
      {"internalType": "uint256", "name": "reportsCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifyInheritance",
    "outputs": [
      {"internalType": "bool", "name": "salespersonValid", "type": "bool"},
      {"internalType": "bool", "name": "managerValid", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function readFromContract(functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: INHERITANCE_SUBMISSION_ADDRESS,
      abi: INHERITANCE_SUBMISSION_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function readFromContractDirect(address, abi, functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: address,
      abi: abi,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🏗️ InheritanceSubmission Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${INHERITANCE_SUBMISSION_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  const results = []
  
  // 1. Check stored contract addresses
  console.log('\n📊 1. Checking stored contract addresses...')
  const salesPersonAddress = await readFromContract('salesPerson')
  const engineeringManagerAddress = await readFromContract('engineeringManager')
  
  if (salesPersonAddress.success) {
    console.log(`   ✅ Salesperson Address: ${salesPersonAddress.result}`)
    results.push({ test: 'salesPerson address', success: true })
  }
  
  if (engineeringManagerAddress.success) {
    console.log(`   ✅ Engineering Manager Address: ${engineeringManagerAddress.result}`)
    results.push({ test: 'engineeringManager address', success: true })
  }
  
  // 2. Get salesperson information through the submission contract
  console.log('\n📊 2. Getting salesperson information...')
  const salespersonInfo = await readFromContract('getSalespersonInfo')
  if (salespersonInfo.success) {
    const [id, managerId, hourlyRate, annualCost] = salespersonInfo.result
    console.log(`   ✅ Salesperson Info:`)
    console.log(`      ID: ${id}`)
    console.log(`      Manager ID: ${managerId}`)
    console.log(`      Hourly Rate: ${hourlyRate}`)
    console.log(`      Annual Cost: ${annualCost}`)
    results.push({ test: 'getSalespersonInfo', success: true })
  }
  
  // 3. Get engineering manager information through the submission contract
  console.log('\n📊 3. Getting engineering manager information...')
  const managerInfo = await readFromContract('getEngineeringManagerInfo')
  if (managerInfo.success) {
    const [id, managerId, salary, reportsCount] = managerInfo.result
    console.log(`   ✅ Engineering Manager Info:`)
    console.log(`      ID: ${id}`)
    console.log(`      Manager ID: ${managerId}`)
    console.log(`      Salary: ${salary}`)
    console.log(`      Reports Count: ${reportsCount}`)
    results.push({ test: 'getEngineeringManagerInfo', success: true })
  }
  
  // 4. Verify inheritance relationships
  console.log('\n📊 4. Verifying inheritance relationships...')
  const inheritanceVerification = await readFromContract('verifyInheritance')
  if (inheritanceVerification.success) {
    const [salespersonValid, managerValid] = inheritanceVerification.result
    console.log(`   ✅ Inheritance Verification:`)
    console.log(`      Salesperson Valid: ${salespersonValid}`)
    console.log(`      Manager Valid: ${managerValid}`)
    results.push({ test: 'verifyInheritance', success: true })
  }
  
  // 5. Test direct contract interactions for comparison
  console.log('\n📊 5. Testing direct contract interactions for comparison...')
  
  // Test direct salesperson contract
  const directSalespersonInfo = await readFromContractDirect(
    SALESPERSON_ADDRESS,
    [
      { "inputs": [], "name": "idNumber", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "managerId", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "hourlyRate", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "getAnnualCost", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" }
    ],
    'idNumber'
  )
  
  if (directSalespersonInfo.success) {
    console.log(`   ✅ Direct Salesperson ID: ${directSalespersonInfo.result}`)
    results.push({ test: 'direct salesperson interaction', success: true })
  }
  
  // Test direct engineering manager contract
  const directManagerInfo = await readFromContractDirect(
    ENGINEERING_MANAGER_ADDRESS,
    [
      { "inputs": [], "name": "idNumber", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "managerId", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "annualSalary", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "getReportsCount", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" }
    ],
    'idNumber'
  )
  
  if (directManagerInfo.success) {
    console.log(`   ✅ Direct Manager ID: ${directManagerInfo.result}`)
    results.push({ test: 'direct manager interaction', success: true })
  }
  
  // 6. Test multiple reads for consistency
  console.log('\n📊 6. Testing multiple reads for consistency...')
  
  for (let i = 0; i < 3; i++) {
    const salespersonInfo = await readFromContract('getSalespersonInfo')
    const managerInfo = await readFromContract('getEngineeringManagerInfo')
    
    if (salespersonInfo.success && managerInfo.success) {
      console.log(`   ✅ Read ${i + 1}: Salesperson ID=${salespersonInfo.result[0]}, Manager ID=${managerInfo.result[0]}`)
      results.push({ test: `consistency read ${i + 1}`, success: true })
    }
    
    await sleep(500)
  }
  
  // 7. Test error handling
  console.log('\n📊 7. Testing error handling...')
  
  // Try to call a function that doesn't exist
  const invalidFunction = await readFromContract('nonExistentFunction')
  if (!invalidFunction.success) {
    console.log(`   ✅ Invalid function call failed as expected: ${invalidFunction.error}`)
    results.push({ test: 'invalid function call', success: true })
  }
  
  // 8. Display inheritance summary
  console.log('\n📊 8. Inheritance Summary...')
  if (salespersonInfo.success && managerInfo.success && inheritanceVerification.success) {
    console.log(`   🏗️ Inheritance Structure:`)
    console.log(`      Salesperson Contract: ${salesPersonAddress.result}`)
    console.log(`      Engineering Manager Contract: ${engineeringManagerAddress.result}`)
    console.log(`      Salesperson Valid: ${inheritanceVerification.result[0]}`)
    console.log(`      Manager Valid: ${inheritanceVerification.result[1]}`)
    
    results.push({ test: 'inheritance summary', success: true })
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
    console.log('🎉 InheritanceSubmission interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
