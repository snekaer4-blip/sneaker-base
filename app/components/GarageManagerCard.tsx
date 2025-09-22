'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function GarageManagerCard() {
  const { isConnected } = useAccount()
  const [car, setCar] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAddCar = async () => {
    if (!car || !isConnected) return
    setIsLoading(true)
    try {
      // Simulate adding car
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResult(`Added car: ${car}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">GarageManager</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={car}
              onChange={(e) => setCar(e.target.value)}
              placeholder="Car model"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleAddCar}
              disabled={!car || isLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
            >
              Add Car
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