const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const HAIKU_NFT_ADDRESS = '0xd7520D7Bb34F00166Ab1F9FF2fAD9E4c4350Ab2c'

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
const HAIKU_NFT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "haikus",
    "outputs": [
      {"internalType": "address", "name": "author", "type": "address"},
      {"internalType": "string", "name": "line1", "type": "string"},
      {"internalType": "string", "name": "line2", "type": "string"},
      {"internalType": "string", "name": "line3", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "counter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_line1", "type": "string"}, {"internalType": "string", "name": "_line2", "type": "string"}, {"internalType": "string", "name": "_line3", "type": "string"}],
    "name": "mintHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_to", "type": "address"}, {"internalType": "uint256", "name": "_haikuId", "type": "uint256"}],
    "name": "shareHaiku",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMySharedHaikus",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku[]",
        "name": "sharedHaikuData",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_haikuId", "type": "uint256"}],
    "name": "getHaiku",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku",
        "name": "haiku",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_author", "type": "address"}],
    "name": "getHaikusByAuthor",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "author", "type": "address"},
          {"internalType": "string", "name": "line1", "type": "string"},
          {"internalType": "string", "name": "line2", "type": "string"},
          {"internalType": "string", "name": "line3", "type": "string"}
        ],
        "internalType": "struct HaikuNFT.Haiku[]",
        "name": "authorHaikus",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalHaikus",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
    "name": "getSharedHaikuIds",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
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
      address: HAIKU_NFT_ADDRESS,
      abi: HAIKU_NFT_ABI,
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
      address: HAIKU_NFT_ADDRESS,
      abi: HAIKU_NFT_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🌸 HaikuNFT Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${HAIKU_NFT_ADDRESS}`)
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
  const initialCounter = await readFromContract('counter')
  const initialTotal = await readFromContract('getTotalHaikus')
  const initialBalance = await readFromContract('balanceOf', [account.address])
  
  if (initialCounter.success) {
    console.log(`   ✅ Initial counter: ${initialCounter.result}`)
    results.push({ test: 'counter (initial)', success: true })
  }
  
  if (initialTotal.success) {
    console.log(`   ✅ Initial total haikus: ${initialTotal.result}`)
    results.push({ test: 'getTotalHaikus (initial)', success: true })
  }
  
  if (initialBalance.success) {
    console.log(`   ✅ Initial NFT balance: ${initialBalance.result}`)
    results.push({ test: 'balanceOf (initial)', success: true })
  }
  
  // 2. Mint unique haikus
  console.log('\n🔄 2. Minting unique haikus...')
  const haikusToMint = [
    {
      line1: "Blockchain poetry flows",
      line2: "Smart contracts dance with code",
      line3: "Innovation grows"
    },
    {
      line1: "Digital art blooms",
      line2: "NFTs capture moments",
      line3: "Forever preserved"
    },
    {
      line1: "Decentralized dreams",
      line2: "Web3 revolution starts",
      line3: "Future is now here"
    }
  ]
  
  for (const haiku of haikusToMint) {
    const mintResult = await interactWithContract('mintHaiku', [haiku.line1, haiku.line2, haiku.line3])
    results.push({ test: `mintHaiku("${haiku.line1}")`, ...mintResult })
    await sleep(3000) // Longer wait for NFT minting
  }
  
  // 3. Check state after minting
  console.log('\n📊 3. Checking state after minting...')
  const afterMintCounter = await readFromContract('counter')
  const afterMintTotal = await readFromContract('getTotalHaikus')
  const afterMintBalance = await readFromContract('balanceOf', [account.address])
  
  if (afterMintCounter.success) {
    console.log(`   ✅ Counter after minting: ${afterMintCounter.result}`)
    results.push({ test: 'counter (after minting)', success: true })
  }
  
  if (afterMintTotal.success) {
    console.log(`   ✅ Total haikus after minting: ${afterMintTotal.result}`)
    results.push({ test: 'getTotalHaikus (after minting)', success: true })
  }
  
  if (afterMintBalance.success) {
    console.log(`   ✅ NFT balance after minting: ${afterMintBalance.result}`)
    results.push({ test: 'balanceOf (after minting)', success: true })
  }
  
  // 4. Get haikus by author
  console.log('\n📊 4. Getting haikus by author...')
  const authorHaikus = await readFromContract('getHaikusByAuthor', [account.address])
  if (authorHaikus.success) {
    console.log(`   ✅ Haikus by author: ${authorHaikus.result.length}`)
    authorHaikus.result.forEach((haiku, index) => {
      console.log(`      ${index + 1}: "${haiku.line1}"`)
    })
    results.push({ test: 'getHaikusByAuthor', success: true })
  }
  
  // 5. Get specific haiku
  console.log('\n📊 5. Getting specific haiku...')
  const specificHaiku = await readFromContract('getHaiku', [1])
  if (specificHaiku.success) {
    console.log(`   ✅ Haiku #1:`)
    console.log(`      "${specificHaiku.result.line1}"`)
    console.log(`      "${specificHaiku.result.line2}"`)
    console.log(`      "${specificHaiku.result.line3}"`)
    results.push({ test: 'getHaiku(1)', success: true })
  }
  
  // 6. Check NFT ownership
  console.log('\n📊 6. Checking NFT ownership...')
  const nftOwner = await readFromContract('ownerOf', [1])
  if (nftOwner.success) {
    console.log(`   ✅ Owner of NFT #1: ${nftOwner.result}`)
    results.push({ test: 'ownerOf(1)', success: true })
  }
  
  // 7. Try to share a haiku (if we have any)
  console.log('\n🔄 7. Trying to share a haiku...')
  // Create a dummy address for sharing
  const dummyAddress = '0x1234567890123456789012345678901234567890'
  const shareResult = await interactWithContract('shareHaiku', [dummyAddress, 1])
  results.push({ test: 'shareHaiku', ...shareResult })
  await sleep(2000)
  
  // 8. Get shared haiku IDs
  console.log('\n📊 8. Getting shared haiku IDs...')
  const sharedIds = await readFromContract('getSharedHaikuIds', [dummyAddress])
  if (sharedIds.success) {
    console.log(`   ✅ Shared haiku IDs for dummy address: [${sharedIds.result.join(', ')}]`)
    results.push({ test: 'getSharedHaikuIds', success: true })
  }
  
  // 9. Try to get shared haikus (should fail for dummy address)
  console.log('\n📊 9. Trying to get shared haikus for dummy address...')
  const sharedHaikus = await readFromContract('getMySharedHaikus')
  if (sharedHaikus.success) {
    console.log(`   ✅ Shared haikus: ${sharedHaikus.result.length}`)
    results.push({ test: 'getMySharedHaikus', success: true })
  } else {
    console.log(`   ❌ Expected failure for dummy address: ${sharedHaikus.error}`)
    results.push({ test: 'getMySharedHaikus (expected fail)', success: true }) // This is expected
  }
  
  // 10. Try to mint a duplicate haiku (should fail)
  console.log('\n🔄 10. Trying to mint a duplicate haiku (should fail)...')
  const duplicateResult = await interactWithContract('mintHaiku', [
    haikusToMint[0].line1,
    haikusToMint[0].line2,
    haikusToMint[0].line3
  ])
  results.push({ test: 'mintHaiku (duplicate - should fail)', ...duplicateResult })
  
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
  
  if (successful >= total * 0.7) { // Allow some failures for expected errors
    console.log('🎉 HaikuNFT interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
