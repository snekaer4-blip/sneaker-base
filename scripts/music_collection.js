const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const FAVORITE_RECORDS_ADDRESS = '0x7C1E43CbC487F2F77Ed67ba40B4340F64c247F63'

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
const FAVORITE_RECORDS_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "approvedRecords",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "string", "name": "", "type": "string"}],
    "name": "userFavorites",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getApprovedRecords",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserFavorites",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetUserFavorites",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "isUserFavorite",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserFavoritesCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getApprovedRecordsCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "isApprovedRecord",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_albumName", "type": "string"}],
    "name": "removeRecord",
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
      address: FAVORITE_RECORDS_ADDRESS,
      abi: FAVORITE_RECORDS_ABI,
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
      address: FAVORITE_RECORDS_ADDRESS,
      abi: FAVORITE_RECORDS_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🎵 FavoriteRecords Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${FAVORITE_RECORDS_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Get approved records
  console.log('\n📊 1. Getting approved records...')
  const approvedRecords = await readFromContract('getApprovedRecords')
  if (approvedRecords.success) {
    console.log(`   ✅ Approved records: [${approvedRecords.result.join(', ')}]`)
    results.push({ test: 'getApprovedRecords', success: true })
  }
  
  // 2. Get approved records count
  console.log('\n📊 2. Getting approved records count...')
  const approvedCount = await readFromContract('getApprovedRecordsCount')
  if (approvedCount.success) {
    console.log(`   ✅ Approved records count: ${approvedCount.result}`)
    results.push({ test: 'getApprovedRecordsCount', success: true })
  }
  
  // 3. Check if specific albums are approved
  console.log('\n📊 3. Checking if specific albums are approved...')
  const albumsToCheck = ['Thriller', 'Back in Black', 'The Dark Side of the Moon', 'Invalid Album']
  
  for (const album of albumsToCheck) {
    const isApproved = await readFromContract('isApprovedRecord', [album])
    if (isApproved.success) {
      console.log(`   ✅ "${album}" is approved: ${isApproved.result}`)
      results.push({ test: `isApprovedRecord("${album}")`, success: true })
    }
  }
  
  // 4. Add approved records to favorites
  console.log('\n🔄 4. Adding approved records to favorites...')
  const albumsToAdd = ['Thriller', 'Back in Black', 'Hotel California']
  
  for (const album of albumsToAdd) {
    const addResult = await interactWithContract('addRecord', [album])
    results.push({ test: `addRecord("${album}")`, ...addResult })
    await sleep(2000)
  }
  
  // 5. Check user favorites
  console.log('\n📊 5. Checking user favorites...')
  const userFavorites = await readFromContract('getUserFavorites', [account.address])
  if (userFavorites.success) {
    console.log(`   ✅ User favorites: [${userFavorites.result.join(', ')}]`)
    results.push({ test: 'getUserFavorites', success: true })
  }
  
  // 6. Get user favorites count
  console.log('\n📊 6. Getting user favorites count...')
  const favoritesCount = await readFromContract('getUserFavoritesCount', [account.address])
  if (favoritesCount.success) {
    console.log(`   ✅ User favorites count: ${favoritesCount.result}`)
    results.push({ test: 'getUserFavoritesCount', success: true })
  }
  
  // 7. Check if specific albums are in user favorites
  console.log('\n📊 7. Checking if specific albums are in user favorites...')
  for (const album of albumsToAdd) {
    const isFavorite = await readFromContract('isUserFavorite', [account.address, album])
    if (isFavorite.success) {
      console.log(`   ✅ "${album}" is in user favorites: ${isFavorite.result}`)
      results.push({ test: `isUserFavorite("${album}")`, success: true })
    }
  }
  
  // 8. Try to add an unapproved record (should fail)
  console.log('\n🔄 8. Trying to add an unapproved record (should fail)...')
  const invalidAddResult = await interactWithContract('addRecord', ['Invalid Album Name'])
  results.push({ test: 'addRecord("Invalid Album Name")', ...invalidAddResult })
  await sleep(2000)
  
  // 9. Remove a record from favorites
  console.log('\n🔄 9. Removing a record from favorites...')
  const removeResult = await interactWithContract('removeRecord', ['Thriller'])
  results.push({ test: 'removeRecord("Thriller")', ...removeResult })
  await sleep(2000)
  
  // 10. Check favorites after removal
  console.log('\n📊 10. Checking favorites after removal...')
  const favoritesAfterRemoval = await readFromContract('getUserFavorites', [account.address])
  if (favoritesAfterRemoval.success) {
    console.log(`   ✅ User favorites after removal: [${favoritesAfterRemoval.result.join(', ')}]`)
    results.push({ test: 'getUserFavorites (after removal)', success: true })
  }
  
  // 11. Reset user favorites
  console.log('\n🔄 11. Resetting user favorites...')
  const resetResult = await interactWithContract('resetUserFavorites')
  results.push({ test: 'resetUserFavorites', ...resetResult })
  await sleep(2000)
  
  // 12. Check favorites after reset
  console.log('\n📊 12. Checking favorites after reset...')
  const favoritesAfterReset = await readFromContract('getUserFavorites', [account.address])
  if (favoritesAfterReset.success) {
    console.log(`   ✅ User favorites after reset: [${favoritesAfterReset.result.join(', ')}]`)
    results.push({ test: 'getUserFavorites (after reset)', success: true })
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
    console.log('🎉 FavoriteRecords interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
