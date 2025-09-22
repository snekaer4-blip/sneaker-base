'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'

const BASIC_MATH_ADDRESS = '0x2a50A417ee05D7527787C9f5ED7657CF9DaD3BFB' as const
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
] as const

export default function BasicMathCard() {
  const { isConnected } = useAccount()
  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [result, setResult] = useState<{ value: string; error: boolean; operation: string } | null>(null)
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [shouldCalculate, setShouldCalculate] = useState(false)

  // Use wagmi's useReadContract hook for better performance and rate limiting
  const { data: contractData, isLoading: isCalculating, error: contractError } = useReadContract({
    address: shouldCalculate && inputA && inputB ? BASIC_MATH_ADDRESS : undefined,
    abi: BASIC_MATH_ABI,
    functionName: operation === 'add' ? 'adder' : 'subtractor',
    args: shouldCalculate && inputA && inputB ? [BigInt(inputA), BigInt(inputB)] : undefined,
    query: {
      enabled: shouldCalculate && !!inputA && !!inputB && isConnected,
    }
  })

  // Update result when contract data changes
  useEffect(() => {
    if (contractData && shouldCalculate) {
      const [value, error] = contractData as [bigint, boolean]
      setResult({ 
        value: value.toString(), 
        error: error, 
        operation: operation === 'add' ? 'Addition' : 'Subtraction'
      })
      setShouldCalculate(false)
    }
  }, [contractData, shouldCalculate, operation])

  // Handle contract errors
  useEffect(() => {
    if (contractError && shouldCalculate) {
      console.error('Contract call error:', contractError)
      setResult({ value: '0', error: true, operation: operation === 'add' ? 'Addition' : 'Subtraction' })
      setShouldCalculate(false)
    }
  }, [contractError, shouldCalculate, operation])

  const handleCalculate = () => {
    if (!inputA || !inputB || !isConnected) return
    setShouldCalculate(true)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">BasicMath</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              placeholder="Value A"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isCalculating}
            />
            <input
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              placeholder="Value B"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isCalculating}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOperation('add')}
              disabled={isCalculating}
              className={`px-3 py-1 text-sm rounded ${
                operation === 'add' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Add
            </button>
            <button
              onClick={() => setOperation('subtract')}
              disabled={isCalculating}
              className={`px-3 py-1 text-sm rounded ${
                operation === 'subtract' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Subtract
            </button>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!inputA || !inputB || isCalculating}
            className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>

          {result && (
            <div className={`p-3 rounded text-sm ${
              result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              <p className="font-medium">
                {result.operation}: {result.value}
              </p>
              {result.error && (
                <p className="text-xs mt-1">
                  {operation === 'add' ? 'Overflow' : 'Underflow'} detected
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
