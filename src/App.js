import logo from './logo.svg';
import './App.css';
import Casino from "./Casino.js"


import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import {WagmiProvider} from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// 1. Your WalletConnect Cloud project ID
const projectId = '8749ac23bcd4cebb9c43c21fdc3bf39f'

// 2. Create wagmiConfig
const metadata = {
  name: 'casino',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [sepolia]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Casino></Casino>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
