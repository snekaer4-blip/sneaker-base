import WalletConnection from './components/WalletConnection'
import BasicMathCard from './components/BasicMathCard'
import ControlStructuresCard from './components/ControlStructuresCard'
import EmployeeStorageCard from './components/EmployeeStorageCard'
import ArraysExerciseCard from './components/ArraysExerciseCard'
import ErrorTriageExerciseCard from './components/ErrorTriageExerciseCard'
import AddressBookCard from './components/AddressBookCard'
import UnburnableTokenCard from './components/UnburnableTokenCard'
import WeightedVotingCard from './components/WeightedVotingCard'
import HaikuNFTCard from './components/HaikuNFTCard'
import FavoriteRecordsCard from './components/FavoriteRecordsCard'
import GarageManagerCard from './components/GarageManagerCard'
import InheritanceCard from './components/InheritanceCard'
import ImportsExerciseCard from './components/ImportsExerciseCard'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Smart Contracts
          </h1>
          <p className="text-gray-600">
            Interact with contracts on Base
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-12">
          <WalletConnection />
        </div>

        {/* Contract Cards */}
        <div className="space-y-6">
          <BasicMathCard />
          <ControlStructuresCard />
          <EmployeeStorageCard />
          <ArraysExerciseCard />
          <ErrorTriageExerciseCard />
          <AddressBookCard />
          <UnburnableTokenCard />
          <WeightedVotingCard />
          <HaikuNFTCard />
          <FavoriteRecordsCard />
          <GarageManagerCard />
          <InheritanceCard />
          <ImportsExerciseCard />
        </div>
      </main>
    </div>
  )
}