'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const ADDRESS_BOOK_ADDRESS = '0x1234567890123456789012345678901234567890' as const
const ADDRESS_BOOK_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "address", "name": "_address", "type": "address"}],
    "name": "addContact",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
    "name": "getAddress",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function AddressBookCard() {
  const { isConnected } = useAccount()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleAddContact = async () => {
    if (!name || !address || !isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: ADDRESS_BOOK_ADDRESS,
          abi: ADDRESS_BOOK_ABI,
          functionName: 'addContact',
          args: [name, address]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Added ${name}: ${address}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">AddressBook</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contact name"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleAddContact}
            disabled={!name || !address || isLoading}
            className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
          >
            Add Contact
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