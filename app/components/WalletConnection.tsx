'use client';

import { useAccount, useDisconnect } from 'wagmi';

export default function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to interact with contracts</p>
          <appkit-button />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Connected</p>
            <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
          <button
            onClick={() => disconnect()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
