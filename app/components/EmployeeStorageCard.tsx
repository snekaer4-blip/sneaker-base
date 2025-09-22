'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

const EMPLOYEE_STORAGE_ADDRESS = '0xb15DFAce780Ad3698Af7FCa43efb7088081F57AC' as const
const EMPLOYEE_STORAGE_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "idNumber",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewSalary",
    "outputs": [{"internalType": "uint32", "name": "", "type": "uint32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
    "name": "setName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_idNumber", "type": "uint256"}],
    "name": "setIdNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint32", "name": "_salary", "type": "uint32"}],
    "name": "setSalary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export default function EmployeeStorageCard() {
  const { isConnected } = useAccount()
  const [name, setName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [salary, setSalary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSetName = async () => {
    if (!name || !isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: EMPLOYEE_STORAGE_ADDRESS,
          abi: EMPLOYEE_STORAGE_ABI,
          functionName: 'setName',
          args: [name]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Name set to: ${name}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetIdNumber = async () => {
    if (!idNumber || !isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: EMPLOYEE_STORAGE_ADDRESS,
          abi: EMPLOYEE_STORAGE_ABI,
          functionName: 'setIdNumber',
          args: [BigInt(idNumber).toString()]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`ID set to: ${idNumber}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetSalary = async () => {
    if (!salary || !isConnected) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: EMPLOYEE_STORAGE_ADDRESS,
          abi: EMPLOYEE_STORAGE_ABI,
          functionName: 'setSalary',
          args: [BigInt(salary).toString()]
        })
      })
      const data = await response.json()
      if (data.success) {
        setResult(`Salary set to: ${salary}`)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">EmployeeStorage</h2>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Connect wallet to interact</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Employee name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSetName}
                disabled={!name || isLoading}
                className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
              >
                Set Name
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="ID number"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSetIdNumber}
                disabled={!idNumber || isLoading}
                className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
              >
                Set ID
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Salary"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSetSalary}
                disabled={!salary || isLoading}
                className="w-full py-2 bg-gray-900 text-white rounded text-sm disabled:opacity-50"
              >
                Set Salary
              </button>
            </div>
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