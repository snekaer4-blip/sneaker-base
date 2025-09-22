'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function ImportsExerciseCard() {
  const { isConnected } = useAccount()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleProcess = async () => {
    if (!input || !isConnected) return
    setIsLoading(true)
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResult(`Processed: ${input}`)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">ImportsExercise</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleProcess}
              disabled={!input || isLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
            >
              Process
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