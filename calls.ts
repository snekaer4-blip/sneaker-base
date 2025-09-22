// Base Sepolia Testnet Contract Addresses
export const contractAddresses = {
  BasicMath: '0x1b335d6ad354483740E28C319CE52604ce73bD31',
  ControlStructures: '0xD6607992571D646d79227A5F9bbA4bD4c89E7168',
  ArraysExercise: '0x071C54043779528877De19be19328E34032938e6',
  EmployeeStorage: '0xbEAc0e609fb4489bd87D9d3BD7114a2CB05F6848',
  UnburnableToken: '0x1d42524EB801462001930547E7b28A1656d9771D',
  AddressBookFactory: '0x06084bF69FeB8Ee5c09a2e37e86C0F23970dc1ED',
  FavoriteRecords: '0x53fe4255A8a76c151f0db920d0Bc061C4A671988',
  HaikuNFT: '0xaAbb52B66f60b4aFfe9a910FBbFf5Ff1814088dD',
  WeightedVoting: '0x1DAe8e73dfE92AECf65B8E57aDe8f1506631D558',
  GarageManager: '0x12C79363f9ADFf9d0a093b65827c2794BcfE7b4a',
  ErrorTriageExercise: '0x33C80dF4c691d8d7f75Af41194604c2F90103398',
  ImportsExercise: '0x9B3Dc98DeE8AD3Af953631eB6EBea41F74A6228A',
  Salesperson: '0x95b4374897314D05dC4EB0910d79bf0fE1eEF947',
  EngineeringManager: '0xbCe28F3A252AA6956aD7D9d5454c0A0C4c9835d5',
  InheritanceSubmission: '0x2C6d13ddeb620312ed903C3765F8294576cb03AF',
} as const;

// Basic contract ABI for testing
export const basicContractAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

import type { ContractFunctionParameters } from 'viem';

export const calls: ContractFunctionParameters[] = [
  {
    address: contractAddresses.BasicMath,
    abi: basicContractAbi,
    functionName: 'increment',
    args: [],
  },
];


