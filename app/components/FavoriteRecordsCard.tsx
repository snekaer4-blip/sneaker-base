'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function FavoriteRecordsCard() {
  const { isConnected } = useAccount()
  const [record, setRecord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAddRecord = async () => {
    if (!record || !isConnected) return
    setIsLoading(true)
    try {
      // Simulate adding record
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResult(`Added record: ${record}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">FavoriteRecords</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={record}
              onChange={(e) => setRecord(e.target.value)}
              placeholder="Record name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleAddRecord}
              disabled={!record || isLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
            >
              Add
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