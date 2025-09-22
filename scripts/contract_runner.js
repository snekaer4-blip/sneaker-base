const { createWalletClient, createPublicClient, http, parseEther, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')
require('dotenv').config()

// Your private key and account setup - now from environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY
if (!PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY environment variable is not set!')
  console.error('Please create a .env file with your private key:')
  console.error('Please set PRIVATE_KEY environment variable')
  process.exit(1)
}
const account = privateKeyToAccount(PRIVATE_KEY)

// RPC endpoints for Base mainnet
const rpcEndpoints = [
  'https://mainnet.base.org',
  'https://base-mainnet.g.alchemy.com/v2/demo',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.drpc.org'
]

// Create clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcEndpoints[0])
})

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpcEndpoints[0])
})

// Contract addresses
const CONTRACTS = {
  BASIC_MATH: '0x3f55F8c46f495e80E8e6C59CdD8eF47550D988b4',
  CONTROL_STRUCTURES: '0x0a0799a356BC487E080b5c269C78B55D7229300f',
  ARRAYS_EXERCISE: '0xbE04F0E14f34bcc1169013d3738b7FA7c543062F',
  EMPLOYEE_STORAGE: '0x0ba31bFD495143b065f4E18167a31999F0d80371',
  UNBURNABLE_TOKEN: '0x27c6Cb9a4a71f12cd0305300c98ED023592b0DD6',
  ADDRESS_BOOK_FACTORY: '0x3A9AA368b91FdF34F14629bfbFe1F4f89deD1c68',
  FAVORITE_RECORDS: '0x7C1E43CbC487F2F77Ed67ba40B4340F64c247F63',
  HAIKU_NFT: '0xd7520D7Bb34F00166Ab1F9FF2fAD9E4c4350Ab2c',
  WEIGHTED_VOTING: '0x89e88bF7c2230ab07CbEa6Ee80d3c333Be26Ca41',
  GARAGE_MANAGER: '0xFb484606d2F8A7d7bC8eA36Dce9B2Ed3444c3eD8',
  ERROR_TRIAGE_EXERCISE: '0xF7bfD650d7A02F05D2cfEfa31AA6106969b3899B',
  IMPORTS_EXERCISE: '0x1BB9C507651614f4C173D021A90EF3045901720b',
  SALESPERSON: '0x1B266e7681fE89e58B8a76E495C291f3Ed1F5Dbb',
  ENGINEERING_MANAGER: '0x36f890Ba1d975A04b4e46D9a6Da6Eb0894dBdF4d',
  INHERITANCE_SUBMISSION: '0xBf363bc8132cdB12ddA72aBf541f58F02faf19e2'
}

// ABIs for contract interactions
const ABIS = {
  BASIC_MATH: [
    {
      "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
      "name": "adder",
      "outputs": [{"internalType": "uint256", "name": "sum", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_a", "type": "uint256"}, {"internalType": "uint256", "name": "_b", "type": "uint256"}],
      "name": "subtractor",
      "outputs": [{"internalType": "uint256", "name": "difference", "type": "uint256"}, {"internalType": "bool", "name": "error", "type": "bool"}],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  CONTROL_STRUCTURES: [
    {
      "inputs": [{"internalType": "uint256", "name": "_number", "type": "uint256"}],
      "name": "fizzBuzz",
      "outputs": [{"internalType": "string", "name": "", "type": "string"}],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  IMPORTS_EXERCISE: [
    {
      "inputs": [
        {"internalType": "string", "name": "_line1", "type": "string"},
        {"internalType": "string", "name": "_line2", "type": "string"},
        {"internalType": "string", "name": "_line3", "type": "string"}
      ],
      "name": "saveHaiku",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  ADDRESS_BOOK_FACTORY: [
    {
      "inputs": [],
      "name": "deploy",
      "outputs": [{"internalType": "address", "name": "addressBookAddress", "type": "address"}],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function interactWithContract(contractName, contractAddress, abi, functionName, args = []) {
  try {
    console.log(`\n🔄 Interacting with ${contractName}...`)
    console.log(`   Address: ${contractAddress}`)
    console.log(`   Function: ${functionName}`)
    console.log(`   Args: ${JSON.stringify(args)}`)
    
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
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

async function readFromContract(contractAddress, abi, functionName, args = []) {
  try {
    const result = await publicClient.readContract({
      address: contractAddress,
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
  console.log('🚀 Starting contract interactions on Base Mainnet...')
  console.log(`📝 Account: ${account.address}`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. BasicMath - Test both adder and subtractor functions (read-only)
  console.log('\n📊 Testing BasicMath (read-only)...')
  
  // Test adder function
  const adderResult = await readFromContract(
    CONTRACTS.BASIC_MATH,
    ABIS.BASIC_MATH,
    'adder',
    [15, 25]
  )
  if (adderResult.success) {
    console.log(`   ✅ Adder Result: ${adderResult.result}`)
    results.push({ contract: 'BasicMath (adder)', success: true, type: 'read' })
  }
  
  // Test subtractor function
  const subtractorResult = await readFromContract(
    CONTRACTS.BASIC_MATH,
    ABIS.BASIC_MATH,
    'subtractor',
    [50, 25]
  )
  if (subtractorResult.success) {
    console.log(`   ✅ Subtractor Result: ${subtractorResult.result}`)
    results.push({ contract: 'BasicMath (subtractor)', success: true, type: 'read' })
  }
  
  // 2. ControlStructures - Test FizzBuzz function (read-only)
  console.log('\n📊 Testing ControlStructures (read-only)...')
  const controlResult = await readFromContract(
    CONTRACTS.CONTROL_STRUCTURES,
    ABIS.CONTROL_STRUCTURES,
    'fizzBuzz',
    [15]
  )
  if (controlResult.success) {
    console.log(`   ✅ FizzBuzz Result: ${controlResult.result}`)
    results.push({ contract: 'ControlStructures', success: true, type: 'read' })
  }
  
  // 3. ImportsExercise - Save a haiku (write transaction)
  console.log('\n🔄 Testing ImportsExercise (write transaction)...')
  const importsResult = await interactWithContract(
    'ImportsExercise',
    CONTRACTS.IMPORTS_EXERCISE,
    ABIS.IMPORTS_EXERCISE,
    'saveHaiku',
    ['DeFi protocols flow', 'Like rivers of digital gold', 'Innovation grows']
  )
  results.push({ contract: 'ImportsExercise', ...importsResult })
  await sleep(2000)
  
  // 4. AddressBook Factory - Deploy a new address book (write transaction)
  console.log('\n🔄 Testing AddressBook Factory (write transaction)...')
  const addressBookResult = await interactWithContract(
    'AddressBook Factory',
    CONTRACTS.ADDRESS_BOOK_FACTORY,
    ABIS.ADDRESS_BOOK_FACTORY,
    'deploy',
    []
  )
  results.push({ contract: 'AddressBook Factory', ...addressBookResult })
  
  // Summary
  console.log('\n📊 INTERACTION SUMMARY:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    const type = result.type || 'write'
    console.log(`${status} ${result.contract} (${type})`)
    if (!result.success) {
      console.log(`   Error: ${result.error}`)
    } else if (result.hash) {
      console.log(`   Tx: ${result.hash}`)
    }
  })
  
  console.log(`\n🎯 Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`)
  
  if (successful === total) {
    console.log('🎉 All contract interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

// Run the script
main().catch(console.error)
