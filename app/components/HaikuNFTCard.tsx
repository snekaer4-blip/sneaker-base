'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function HaikuNFTCard() {
  const { isConnected } = useAccount()
  const [haiku, setHaiku] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleMint = async () => {
    if (!haiku || !isConnected) return
    setIsLoading(true)
    try {
      // Simulate minting
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResult(`Minted NFT: ${haiku}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">HaikuNFT</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={haiku}
            onChange={(e) => setHaiku(e.target.value)}
            placeholder="Enter your haiku..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
            disabled={isLoading}
          />
          <button
            onClick={handleMint}
            disabled={!haiku || isLoading}
            className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
          >
            Mint NFT
          </button>

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