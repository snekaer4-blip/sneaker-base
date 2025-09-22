# 🚀 Base Smart Contracts

A minimal, clean interface for interacting with smart contracts deployed on **Base Mainnet**. Built with Next.js, Wagmi, and Reown AppKit for seamless wallet connectivity.

## ✨ Features

- **🔗 Wallet Connection**: One-click wallet connection using Reown AppKit
- **⚡ Base Integration**: Deployed contracts on Base Mainnet
- **🎯 Contract Interactions**: Direct interaction with 13+ smart contracts
- **📱 Responsive Design**: Clean, minimal UI that works on all devices
- **🔒 Secure**: Environment-based private key management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain**: Wagmi, Viem, Reown AppKit
- **Network**: Base Mainnet
- **Styling**: Tailwind CSS
- **Deployment**: Smart contracts deployed on Base

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A Base-compatible wallet (MetaMask, Coinbase Wallet, etc.)
- Base ETH for gas fees

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sneaker_contracts
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Add your WalletConnect Project ID to `.env.local`:
   ```env
   NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔗 Wallet Connection

### Supported Wallets

- **MetaMask** - Browser extension and mobile app
- **Coinbase Wallet** - Browser extension and mobile app  
- **WalletConnect** - Connect any WalletConnect-compatible wallet
- **Rainbow** - Mobile-first wallet
- **Trust Wallet** - Multi-chain wallet
- **And many more...**

### How to Connect

1. Click the **"Connect Wallet"** button
2. Select your preferred wallet from the modal
3. Approve the connection in your wallet
4. Start interacting with smart contracts!

## 📋 Smart Contracts

The app includes interactions with 13+ deployed smart contracts:

| Contract | Description | Functions |
|----------|-------------|-----------|
| **BasicMath** | Safe arithmetic operations | Addition, Subtraction with overflow protection |
| **ControlStructures** | Conditional logic examples | FizzBuzz, Do Not Disturb time checker |
| **EmployeeStorage** | Employee data management | Set name, ID, salary |
| **ArraysExercise** | Array manipulation | Add, reset, manage arrays |
| **ErrorTriageExercise** | Error handling examples | Array operations with error handling |
| **AddressBook** | Contact management | Add contacts, retrieve addresses |
| **UnburnableToken** | ERC-20 token | Mint tokens, check balances |
| **WeightedVoting** | Governance system | Create proposals, vote |
| **HaikuNFT** | NFT creation | Mint haiku NFTs |
| **FavoriteRecords** | Music preferences | Add favorite records |
| **GarageManager** | Vehicle management | Add cars to garage |
| **Inheritance** | Contract inheritance | Set names, demonstrate inheritance |
| **ImportsExercise** | Library imports | Use external libraries |

## 🌐 Base Network

### Why Base?

- **Low Gas Fees**: Significantly cheaper than Ethereum mainnet
- **Fast Transactions**: Quick confirmation times
- **EVM Compatible**: Works with existing Ethereum tools
- **Coinbase Backed**: Built by Coinbase for mainstream adoption
- **Growing Ecosystem**: Expanding DeFi and NFT ecosystem

### Network Details

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Bridge**: https://bridge.base.org

## 🔧 Development

### Project Structure

```
├── app/
│   ├── components/          # React components
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── config/                 # Wagmi configuration
├── context/                # React context providers
├── contracts/              # Smart contract files
├── scripts/                # Interaction scripts
└── README.md
```

### Key Files

- `config/index.ts` - Wagmi and Reown AppKit configuration
- `context/index.tsx` - React context for wallet state
- `app/components/` - UI components for each contract
- `scripts/` - Node.js scripts for contract interactions

### Adding New Contracts

1. Deploy your contract to Base Mainnet
2. Create a new component in `app/components/`
3. Add the contract address and ABI
4. Implement interaction functions
5. Import and add to `app/page.tsx`

## 🔒 Security

### Environment Variables

Never commit private keys or sensitive data:

```env
# .env.local (not committed)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
PRIVATE_KEY=your_private_key_for_scripts
```

### Best Practices

- ✅ Use environment variables for sensitive data
- ✅ Never hardcode private keys
- ✅ Test on testnets before mainnet
- ✅ Verify contract addresses
- ✅ Use proper error handling

## 📱 Mobile Support

The app is fully responsive and works on mobile devices:

- **Mobile Wallets**: Connect via WalletConnect
- **Responsive Design**: Optimized for all screen sizes
- **Touch Friendly**: Easy interaction on mobile

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open an issue on GitHub
- **Base Docs**: https://docs.base.org
- **Reown AppKit**: https://docs.reown.com/appkit

## 🙏 Acknowledgments

- **Base Team** - For building an amazing L2
- **Reown** - For the excellent wallet connection toolkit
- **Wagmi Team** - For the powerful React hooks
- **Viem** - For the lightweight Ethereum library

---

**Built with ❤️ for the Base ecosystem**# sneaker-base
