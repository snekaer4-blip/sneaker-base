const { createWalletClient, createPublicClient, http, formatEther } = require('viem')
const { base } = require('viem/chains')
const { privateKeyToAccount } = require('viem/accounts')

// Your private key and account setup
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(PRIVATE_KEY)

// Contract address
const GARAGE_MANAGER_ADDRESS = '0xFb484606d2F8A7d7bC8eA36Dce9B2Ed3444c3eD8'

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
const GARAGE_MANAGER_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_make", "type": "string"}, {"internalType": "string", "name": "_model", "type": "string"}, {"internalType": "string", "name": "_color", "type": "string"}, {"internalType": "uint256", "name": "_numberOfDoors", "type": "uint256"}],
    "name": "addCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCars",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "make", "type": "string"},
          {"internalType": "string", "name": "model", "type": "string"},
          {"internalType": "string", "name": "color", "type": "string"},
          {"internalType": "uint256", "name": "numberOfDoors", "type": "uint256"}
        ],
        "internalType": "struct GarageManager.Car[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCars",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "make", "type": "string"},
          {"internalType": "string", "name": "model", "type": "string"},
          {"internalType": "string", "name": "color", "type": "string"},
          {"internalType": "uint256", "name": "numberOfDoors", "type": "uint256"}
        ],
        "internalType": "struct GarageManager.Car[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}, {"internalType": "string", "name": "_make", "type": "string"}, {"internalType": "string", "name": "_model", "type": "string"}, {"internalType": "string", "name": "_color", "type": "string"}, {"internalType": "uint256", "name": "_numberOfDoors", "type": "uint256"}],
    "name": "updateCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetMyGarage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCarCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyCarCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "uint256", "name": "_index", "type": "uint256"}],
    "name": "getUserCar",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "make", "type": "string"},
          {"internalType": "string", "name": "model", "type": "string"},
          {"internalType": "string", "name": "color", "type": "string"},
          {"internalType": "uint256", "name": "numberOfDoors", "type": "uint256"}
        ],
        "internalType": "struct GarageManager.Car",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}],
    "name": "getMyCar",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "make", "type": "string"},
          {"internalType": "string", "name": "model", "type": "string"},
          {"internalType": "string", "name": "color", "type": "string"},
          {"internalType": "uint256", "name": "numberOfDoors", "type": "uint256"}
        ],
        "internalType": "struct GarageManager.Car",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_index", "type": "uint256"}],
    "name": "removeCar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "hasAnyCars",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserCarMakes",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}, {"internalType": "string", "name": "_make", "type": "string"}],
    "name": "getCarsByMake",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "make", "type": "string"},
          {"internalType": "string", "name": "model", "type": "string"},
          {"internalType": "string", "name": "color", "type": "string"},
          {"internalType": "uint256", "name": "numberOfDoors", "type": "uint256"}
        ],
        "internalType": "struct GarageManager.Car[]",
        "name": "matchingCars",
        "type": "tuple[]"
      },
      {"internalType": "uint256[]", "name": "indices", "type": "uint256[]"}
    ],
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
      address: GARAGE_MANAGER_ADDRESS,
      abi: GARAGE_MANAGER_ABI,
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
      address: GARAGE_MANAGER_ADDRESS,
      abi: GARAGE_MANAGER_ABI,
      functionName: functionName,
      args: args
    })
    return { success: true, result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚗 GarageManager Contract Interaction')
  console.log('='.repeat(50))
  console.log(`📝 Account: ${account.address}`)
  console.log(`📝 Contract: ${GARAGE_MANAGER_ADDRESS}`)
  console.log(`🌐 Network: Base Mainnet (Chain ID: ${base.id})`)
  
  // Check account balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`💰 Balance: ${formatEther(balance)} ETH`)
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance to perform transactions')
    return
  }
  
  const results = []
  
  // 1. Check initial car count
  console.log('\n📊 1. Checking initial car count...')
  const initialCount = await readFromContract('getMyCarCount')
  if (initialCount.success) {
    console.log(`   ✅ Initial car count: ${initialCount.result}`)
    results.push({ test: 'getMyCarCount (initial)', success: true })
  }
  
  // 2. Check if user has any cars
  console.log('\n📊 2. Checking if user has any cars...')
  const hasCars = await readFromContract('hasAnyCars', [account.address])
  if (hasCars.success) {
    console.log(`   ✅ User has cars: ${hasCars.result}`)
    results.push({ test: 'hasAnyCars', success: true })
  }
  
  // 3. Add cars to garage
  console.log('\n🔄 3. Adding cars to garage...')
  const carsToAdd = [
    { make: 'Tesla', model: 'Model S', color: 'Red', doors: 4 },
    { make: 'BMW', model: 'M3', color: 'Blue', doors: 4 },
    { make: 'Audi', model: 'A4', color: 'Black', doors: 4 },
    { make: 'Tesla', model: 'Model 3', color: 'White', doors: 4 }
  ]
  
  for (const car of carsToAdd) {
    const addResult = await interactWithContract('addCar', [car.make, car.model, car.color, car.doors])
    results.push({ test: `addCar("${car.make}", "${car.model}")`, ...addResult })
    await sleep(2000)
  }
  
  // 4. Get my cars
  console.log('\n📊 4. Getting my cars...')
  const myCars = await readFromContract('getMyCars')
  if (myCars.success) {
    console.log(`   ✅ My cars:`)
    myCars.result.forEach((car, index) => {
      console.log(`      ${index}: ${car.make} ${car.model} (${car.color}, ${car.numberOfDoors} doors)`)
    })
    results.push({ test: 'getMyCars', success: true })
  }
  
  // 5. Get car count after adding
  console.log('\n📊 5. Getting car count after adding...')
  const countAfterAdd = await readFromContract('getMyCarCount')
  if (countAfterAdd.success) {
    console.log(`   ✅ Car count after adding: ${countAfterAdd.result}`)
    results.push({ test: 'getMyCarCount (after add)', success: true })
  }
  
  // 6. Get specific car by index
  console.log('\n📊 6. Getting specific car by index...')
  const specificCar = await readFromContract('getMyCar', [0])
  if (specificCar.success) {
    console.log(`   ✅ Car at index 0: ${specificCar.result.make} ${specificCar.result.model}`)
    results.push({ test: 'getMyCar(0)', success: true })
  }
  
  // 7. Update a car
  console.log('\n🔄 7. Updating car at index 1...')
  const updateResult = await interactWithContract('updateCar', [1, 'BMW', 'M4', 'Silver', 2])
  results.push({ test: 'updateCar(1)', ...updateResult })
  await sleep(2000)
  
  // 8. Check updated car
  console.log('\n📊 8. Checking updated car...')
  const updatedCar = await readFromContract('getMyCar', [1])
  if (updatedCar.success) {
    console.log(`   ✅ Updated car: ${updatedCar.result.make} ${updatedCar.result.model} (${updatedCar.result.color}, ${updatedCar.result.numberOfDoors} doors)`)
    results.push({ test: 'getMyCar(1) after update', success: true })
  }
  
  // 9. Get car makes
  console.log('\n📊 9. Getting car makes...')
  const carMakes = await readFromContract('getUserCarMakes', [account.address])
  if (carMakes.success) {
    console.log(`   ✅ Car makes: [${carMakes.result.join(', ')}]`)
    results.push({ test: 'getUserCarMakes', success: true })
  }
  
  // 10. Get cars by make
  console.log('\n📊 10. Getting cars by make (Tesla)...')
  const teslaCars = await readFromContract('getCarsByMake', [account.address, 'Tesla'])
  if (teslaCars.success) {
    const [matchingCars, indices] = teslaCars.result
    console.log(`   ✅ Tesla cars found: ${matchingCars.length}`)
    matchingCars.forEach((car, index) => {
      console.log(`      ${indices[index]}: ${car.make} ${car.model}`)
    })
    results.push({ test: 'getCarsByMake(Tesla)', success: true })
  }
  
  // 11. Remove a car
  console.log('\n🔄 11. Removing car at index 2...')
  const removeResult = await interactWithContract('removeCar', [2])
  results.push({ test: 'removeCar(2)', ...removeResult })
  await sleep(2000)
  
  // 12. Check cars after removal
  console.log('\n📊 12. Checking cars after removal...')
  const carsAfterRemoval = await readFromContract('getMyCars')
  if (carsAfterRemoval.success) {
    console.log(`   ✅ Cars after removal:`)
    carsAfterRemoval.result.forEach((car, index) => {
      console.log(`      ${index}: ${car.make} ${car.model}`)
    })
    results.push({ test: 'getMyCars (after removal)', success: true })
  }
  
  // 13. Reset garage
  console.log('\n🔄 13. Resetting garage...')
  const resetResult = await interactWithContract('resetMyGarage')
  results.push({ test: 'resetMyGarage', ...resetResult })
  await sleep(2000)
  
  // 14. Check cars after reset
  console.log('\n📊 14. Checking cars after reset...')
  const carsAfterReset = await readFromContract('getMyCars')
  if (carsAfterReset.success) {
    console.log(`   ✅ Cars after reset: ${carsAfterReset.result.length}`)
    results.push({ test: 'getMyCars (after reset)', success: true })
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
    console.log('🎉 GarageManager interactions completed successfully!')
  } else {
    console.log('⚠️  Some interactions failed. Check the errors above.')
  }
}

main().catch(console.error)
