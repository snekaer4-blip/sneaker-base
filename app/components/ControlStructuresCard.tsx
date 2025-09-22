'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const CONTROL_STRUCTURES_ADDRESS = '0xaB6B6c13Fd72A92D27096d779F8188F85F4bb5Be' as const
const CONTROL_STRUCTURES_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_number", "type": "uint256"}],
    "name": "fizzBuzz",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_time", "type": "uint256"}],
    "name": "doNotDisturb",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  }
] as const

export default function ControlStructuresCard() {
  const { isConnected } = useAccount()
  const [fizzBuzzInput, setFizzBuzzInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [fizzBuzzResult, setFizzBuzzResult] = useState<string | null>(null)
  const [doNotDisturbResult, setDoNotDisturbResult] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState<'fizzbuzz' | 'time' | null>(null)

  const handleFizzBuzz = async () => {
    if (!fizzBuzzInput || !isConnected) return

    setIsCalculating('fizzbuzz')
    try {
      const number = BigInt(fizzBuzzInput)
      
      const contractResult = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: CONTROL_STRUCTURES_ADDRESS,
          abi: CONTROL_STRUCTURES_ABI,
          functionName: 'fizzBuzz',
          args: [number.toString()]
        })
      })
      
      const data = await contractResult.json()
      
      if (data.success) {
        setFizzBuzzResult(data.result)
      }
    } catch (error) {
      console.error('FizzBuzz error:', error)
    } finally {
      setIsCalculating(null)
    }
  }

  const handleDoNotDisturb = async () => {
    if (!timeInput || !isConnected) return

    setIsCalculating('time')
    try {
      const time = BigInt(timeInput)
      
      const contractResult = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: CONTROL_STRUCTURES_ADDRESS,
          abi: CONTROL_STRUCTURES_ABI,
          functionName: 'doNotDisturb',
          args: [time.toString()]
        })
      })
      
      const data = await contractResult.json()
      
      if (data.success) {
        setDoNotDisturbResult(data.result)
      } else {
        if (data.error.includes('AfterHours')) {
          setDoNotDisturbResult(`After Hours (${timeInput})`)
        } else if (data.error.includes('At lunch!')) {
          setDoNotDisturbResult('At lunch!')
        } else if (data.error.includes('Panic')) {
          setDoNotDisturbResult('Invalid time (≥2400)')
        }
      }
    } catch (error) {
      console.error('DoNotDisturb error:', error)
    } finally {
      setIsCalculating(null)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">ControlStructures</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-3">FizzBuzz</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={fizzBuzzInput}
                  onChange={(e) => setFizzBuzzInput(e.target.value)}
                  placeholder="Enter number"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  disabled={isCalculating === 'fizzbuzz'}
                />
                <button
                  onClick={handleFizzBuzz}
                  disabled={!fizzBuzzInput || isCalculating === 'fizzbuzz'}
                  className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
                >
                  {isCalculating === 'fizzbuzz' ? 'Calculating...' : 'Calculate'}
                </button>
                {fizzBuzzResult && (
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Result: {fizzBuzzResult}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-medium mb-3">Do Not Disturb</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="Enter time (e.g., 1430)"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  disabled={isCalculating === 'time'}
                />
                <button
                  onClick={handleDoNotDisturb}
                  disabled={!timeInput || isCalculating === 'time'}
                  className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
                >
                  {isCalculating === 'time' ? 'Calculating...' : 'Check'}
                </button>
                {doNotDisturbResult && (
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Status: {doNotDisturbResult}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}