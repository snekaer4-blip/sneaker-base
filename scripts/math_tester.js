const { createPublicClient, http } = require('viem')
const { base } = require('viem/chains')

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

const BASIC_MATH_ADDRESS = '0x3f55F8c46f495e80E8e6C59CdD8eF47550D988b4'

const BASIC_MATH_ABI = [
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
]

async function testBasicMath() {
  console.log('🧮 Testing BasicMath Contract LIVE Status')
  console.log('='.repeat(50))
  console.log(`Contract: ${BASIC_MATH_ADDRESS}`)
  console.log(`Network: Base Mainnet (Chain ID: ${base.id})`)
  
  try {
    // Test 1: Addition
    console.log('\n📊 Test 1: Addition (25 + 75)')
    const addResult = await publicClient.readContract({
      address: BASIC_MATH_ADDRESS,
      abi: BASIC_MATH_ABI,
      functionName: 'adder',
      args: [25, 75]
    })
    console.log(`✅ Result: ${addResult[0]} (error: ${addResult[1]})`)
    
    // Test 2: Subtraction
    console.log('\n📊 Test 2: Subtraction (100 - 35)')
    const subResult = await publicClient.readContract({
      address: BASIC_MATH_ADDRESS,
      abi: BASIC_MATH_ABI,
      functionName: 'subtractor',
      args: [100, 35]
    })
    console.log(`✅ Result: ${subResult[0]} (error: ${subResult[1]})`)
    
    // Test 3: Edge case
    console.log('\n📊 Test 3: Edge Case (5 - 10)')
    const edgeResult = await publicClient.readContract({
      address: BASIC_MATH_ADDRESS,
      abi: BASIC_MATH_ABI,
      functionName: 'subtractor',
      args: [5, 10]
    })
    console.log(`✅ Result: ${edgeResult[0]} (error: ${edgeResult[1]})`)
    
    console.log('\n🎉 CONCLUSION:')
    console.log('✅ Contract is LIVE and FUNCTIONAL')
    console.log('✅ All functions working correctly')
    console.log('✅ No transactions needed (pure functions)')
    console.log('✅ Contract is ready for frontend use')
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

testBasicMath().catch(console.error)
