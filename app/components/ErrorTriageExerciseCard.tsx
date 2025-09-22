'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const ERROR_TRIAGE_ADDRESS = '0xF7bfD650d7A02F05D2cfEfa31AA6106969b3899B' as const
const ERROR_TRIAGE_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_num", "type": "uint256"}],
    "name": "addToArr",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getArr",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetArr",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "popWithReturn",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export default function ErrorTriageExerciseCard() {
  const { isConnected } = useAccount()
  const [number, setNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAddToArray = async () => {
    if (!number || !isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ERROR_TRIAGE_ADDRESS,
          abi: ERROR_TRIAGE_ABI,
          functionName: 'addToArr',
          args: [BigInt(number).toString()]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Added ${number} to array`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePop = async () => {
    if (!isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ERROR_TRIAGE_ADDRESS,
          abi: ERROR_TRIAGE_ABI,
          functionName: 'popWithReturn',
          args: []
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Popped: ${data.result}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (!isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ERROR_TRIAGE_ADDRESS,
          abi: ERROR_TRIAGE_ABI,
          functionName: 'resetArr',
          args: []
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult('Array reset')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">ErrorTriageExercise</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleAddToArray}
              disabled={!number || isLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={handlePop}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm disabled:opacity-50"
            >
              Pop
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm disabled:opacity-50"
            >
              Reset
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