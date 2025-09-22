'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const UNBURNABLE_TOKEN_ADDRESS = '0x27c6Cb9a4a71f12cd0305300c98ED023592b0DD6' as const
const UNBURNABLE_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function UnburnableTokenCard() {
  const { isConnected, address } = useAccount()
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleMint = async () => {
    if (!amount || !isConnected || !address) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: UNBURNABLE_TOKEN_ADDRESS,
          abi: UNBURNABLE_TOKEN_ABI,
          functionName: 'mint',
          args: [address, BigInt(amount).toString()]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Minted ${amount} tokens`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">UnburnableToken</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to mint"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleMint}
              disabled={!amount || isLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
            >
              Mint
            </button>
          </div>

          {result && (
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p className="font-medium">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}