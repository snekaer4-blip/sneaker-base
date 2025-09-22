import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Multiple RPC endpoints for fallback
const rpcEndpoints = [
  'https://mainnet.base.org',
  'https://base-mainnet.g.alchemy.com/v2/demo',
  'https://base.blockpi.network/v1/rpc/public',
  'https://base.drpc.org'
]

const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcEndpoints[0])
})

// Simple rate limiting - add a small delay to prevent overwhelming the RPC
let lastRequestTime = 0
const minRequestInterval = 100 // 100ms between requests

export async function POST(request: NextRequest) {
  try {
    // Add rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime
    if (timeSinceLastRequest < minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeSinceLastRequest))
    }
    lastRequestTime = Date.now()

    const { address, abi, functionName, args } = await request.json()

    // Convert string arguments back to BigInt for contract calls
    const processedArgs = args.map((arg: any) => {
      if (typeof arg === 'string' && /^\d+$/.test(arg)) {
        return BigInt(arg)
      }
      return arg
    })

    // Add retry logic with different RPC endpoints
    let result
    let attempts = 0
    const maxAttempts = rpcEndpoints.length
    
    while (attempts < maxAttempts) {
      try {
        // Create a new client with different RPC endpoint for each attempt
        const client = createPublicClient({
          chain: base,
          transport: http(rpcEndpoints[attempts])
        })
        
        result = await client.readContract({
          address,
          abi,
          functionName,
          args: processedArgs
        })
        break
      } catch (error: any) {
        attempts++
        console.log(`RPC attempt ${attempts} failed with endpoint ${rpcEndpoints[attempts - 1]}:`, error.message)
        
        if (attempts < maxAttempts) {
          // Wait before trying next endpoint
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        throw error
      }
    }

    // Convert BigInt results to strings for JSON serialization
    const processResult = (data: any): any => {
      if (typeof data === 'bigint') {
        return data.toString()
      }
      if (Array.isArray(data)) {
        return data.map(processResult)
      }
      if (data && typeof data === 'object') {
        const processed: any = {}
        for (const [key, value] of Object.entries(data)) {
          processed[key] = processResult(value)
        }
        return processed
      }
      return data
    }

    return NextResponse.json({ success: true, result: processResult(result) })
  } catch (error: any) {
    console.error('Contract call error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Contract call failed' 
    }, { status: 500 })
  }
}
