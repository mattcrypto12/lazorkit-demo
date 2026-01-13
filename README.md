# 🔐 LazorKit Passkey Demo

A comprehensive demo showcasing **LazorKit SDK** integration for passkey-based Solana wallets with gasless transactions. This project demonstrates how to build a modern Solana dApp that eliminates the need for browser extensions and seed phrases.

![LazorKit Demo](https://img.shields.io/badge/Solana-Devnet-green) ![Framework](https://img.shields.io/badge/Framework-Vite%20%2B%20React-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Live Demo

**[https://lazorkit-demo-two.vercel.app](https://lazorkit-demo-two.vercel.app)**

## ✨ Features

- **🔐 Passkey Authentication**: Use fingerprint, Face ID, or Windows Hello instead of seed phrases
- **⚡ Gasless Transactions**: Users don't need SOL for gas fees - the paymaster sponsors them
- **🔒 Smart Wallet**: On-chain PDA-based accounts with built-in security features
- **📱 Cross-Device Sessions**: Passkeys sync across devices automatically
- **🎨 Modern UI**: Clean, responsive interface built with React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A browser that supports WebAuthn (Chrome, Safari, Edge, Firefox)

### Installation

```bash
# Clone the repository
git clone https://github.com/mattcrypto12/lazorkit-demo.git
cd lazorkit-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will open at `http://localhost:3000`

### Environment Setup

This demo comes pre-configured for **Solana Devnet**. The default configuration in `src/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  PORTAL_URL: 'https://portal.lazor.sh',
  PAYMASTER: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};
```

For production, replace `RPC_URL` with a dedicated RPC provider (Helius, QuickNode, etc.).

---

## 📚 Tutorial 1: Creating a Passkey-Based Wallet

This tutorial explains how passkey authentication works in LazorKit and how to implement it in your app.

### What are Passkeys?

Passkeys are a modern authentication standard (WebAuthn) that replaces passwords and seed phrases with biometric authentication:

- **Fingerprint** (Touch ID, Windows Hello)
- **Face recognition** (Face ID)
- **Device PIN** (fallback)

The private key material never leaves your device's secure enclave (TPM/Secure Enclave), making it extremely secure.

### Step 1: Install LazorKit

```bash
npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js
```

### Step 2: Configure Polyfills

LazorKit requires Node.js polyfills. For Vite:

```typescript
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Required for Buffer and other Node.js globals
  ],
});
```

### Step 3: Wrap Your App with LazorkitProvider

The provider initializes the SDK and provides wallet context to all components:

```tsx
// App.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

function App() {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://kora.devnet.lazorkit.com"
      }}
    >
      <YourApp />
    </LazorkitProvider>
  );
}
```

### Step 4: Create a Connect Button

Use the `useWallet` hook to access wallet state and methods:

```tsx
// ConnectButton.tsx
import { useWallet } from '@lazorkit/wallet';

export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      // Connect with paymaster mode for gasless transactions
      await connect({ feeMode: 'paymaster' });
      console.log('Connected!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  if (isConnected) {
    return <button onClick={() => disconnect()}>Disconnect</button>;
  }

  return (
    <button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect with Passkey'}
    </button>
  );
}
```

### What Happens When Users Connect?

1. **First-time users**: 
   - LazorKit opens the authentication portal
   - User creates a new passkey with biometric confirmation
   - A smart wallet (PDA) is created on-chain
   - Session is cached for future visits

2. **Returning users**:
   - Session is restored automatically (no popup)
   - If session expired, user re-authenticates with their passkey

### Accessing Wallet Information

Once connected, you can access wallet details:

```tsx
import { useWallet } from '@lazorkit/wallet';

function WalletDisplay() {
  const { wallet, smartWalletPubkey, isConnected } = useWallet();

  if (!isConnected || !wallet) return null;

  return (
    <div>
      <p>Smart Wallet: {wallet.smartWallet}</p>
      <p>Credential ID: {wallet.credentialId}</p>
      <p>PublicKey: {smartWalletPubkey?.toBase58()}</p>
    </div>
  );
}
```

---

## 📚 Tutorial 2: Sending Gasless Transactions

This tutorial shows how to send SOL transfers without users needing to pay gas fees.

### How Gasless Transactions Work

1. **User creates instructions**: Standard Solana instructions
2. **LazorKit packages the transaction**: Adds paymaster sponsorship data
3. **User signs with passkey**: Biometric prompt appears
4. **Paymaster submits transaction**: Pays network fees on behalf of user
5. **Transaction confirmed**: SOL transferred, user paid no gas

### Step 1: Create Transfer Instructions

Use standard Solana instructions - nothing special needed:

```tsx
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';

function TransferButton() {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handleTransfer = async () => {
    if (!smartWalletPubkey) return;

    // Create a standard SOL transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('RECIPIENT_ADDRESS'),
      lamports: 0.001 * LAMPORTS_PER_SOL,
    });

    // Sign and send - paymaster handles gas!
    const signature = await signAndSendTransaction({
      instructions: [instruction],
    });

    console.log('Transaction confirmed:', signature);
  };

  return <button onClick={handleTransfer}>Send 0.001 SOL</button>;
}
```

### Step 2: Handle Transaction Options

You can customize transaction behavior:

```tsx
const signature = await signAndSendTransaction({
  instructions: [instruction1, instruction2], // Multiple instructions
  transactionOptions: {
    // Pay gas in USDC instead of SOL (if supported)
    feeToken: 'USDC',
    
    // Set compute unit limit for complex transactions
    computeUnitLimit: 500_000,
    
    // Use address lookup tables for v0 transactions
    addressLookupTableAccounts: [...],
    
    // Simulate on specific network
    clusterSimulation: 'devnet',
  },
});
```

### Step 3: Error Handling

Always wrap transactions in try-catch:

```tsx
const handleTransfer = async () => {
  try {
    const signature = await signAndSendTransaction({
      instructions: [instruction],
    });
    console.log('Success:', signature);
  } catch (error) {
    if (error.message.includes('User rejected')) {
      console.log('User cancelled the transaction');
    } else if (error.message.includes('insufficient')) {
      console.log('Insufficient balance');
    } else {
      console.error('Transaction failed:', error);
    }
  }
};
```

### Complete Transaction Component

Here's a full example with form inputs and status handling:

```tsx
import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function TransferForm() {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txSignature, setTxSignature] = useState('');

  const handleTransfer = async () => {
    if (!smartWalletPubkey || !isConnected) return;

    setStatus('loading');
    
    try {
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: new PublicKey(recipient),
        lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
      });

      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      setTxSignature(signature);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in SOL"
      />
      <button onClick={handleTransfer} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send SOL'}
      </button>
      
      {status === 'success' && (
        <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}>
          View on Explorer
        </a>
      )}
    </div>
  );
}
```

---

## 📚 Tutorial 3: Message Signing for Authentication

Sign messages to prove wallet ownership without creating transactions.

### Use Cases

- **Sign-in to dApps**: Similar to "Sign-In with Ethereum" (SIWE)
- **Verify ownership**: Prove you control a wallet off-chain
- **Create attestations**: Sign documents or agreements

### Implementation

```tsx
import { useWallet } from '@lazorkit/wallet';

function SignMessage() {
  const { signMessage, isConnected } = useWallet();

  const handleSign = async () => {
    if (!isConnected) return;

    const message = 'Sign this message to verify your wallet ownership';
    
    try {
      const { signature, signedPayload } = await signMessage(message);
      
      console.log('Signature:', signature);
      console.log('Signed payload:', signedPayload);
      
      // Send signature to your backend for verification
    } catch (error) {
      console.error('Signing cancelled or failed:', error);
    }
  };

  return <button onClick={handleSign}>Sign Message</button>;
}
```

---

## 🏗️ Project Structure

```
lazorkit-demo/
├── public/
│   └── lazorkit.svg          # App icon
├── src/
│   ├── components/           # React components
│   │   ├── Header.tsx        # App header with logo
│   │   ├── Footer.tsx        # Footer with links
│   │   ├── ConnectButton.tsx # Passkey connect button
│   │   ├── WalletInfo.tsx    # Wallet details display
│   │   ├── WalletSection.tsx # Wallet connection section
│   │   ├── TransactionSection.tsx  # SOL transfer demo
│   │   └── MessageSection.tsx      # Message signing demo
│   ├── config/
│   │   └── lazorkit.ts       # SDK configuration
│   ├── styles/
│   │   └── index.css         # Global styles
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🔧 Configuration Reference

### LazorkitProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `rpcUrl` | `string` | Yes | Solana RPC endpoint URL |
| `portalUrl` | `string` | No | LazorKit auth portal (default: `https://portal.lazor.sh`) |
| `paymasterConfig` | `object` | No | Paymaster settings for gasless txns |

### useWallet Hook

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `connect(options?)` | `function` | Trigger passkey authentication |
| `disconnect()` | `function` | Sign out and clear session |
| `signMessage(message)` | `function` | Sign a text message |
| `signAndSendTransaction(payload)` | `function` | Sign and submit a transaction |
| `isConnected` | `boolean` | Connection status |
| `isConnecting` | `boolean` | Loading state during connection |
| `wallet` | `object \| null` | Wallet info (smartWallet, credentialId) |
| `smartWalletPubkey` | `PublicKey \| null` | Wallet address as PublicKey |

---

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

---

## 🤝 Resources

- **LazorKit Documentation**: https://docs.lazorkit.com
- **LazorKit GitHub**: https://github.com/lazor-kit/lazor-kit
- **LazorKit Telegram**: https://t.me/lazorkit
- **Solana Developer Docs**: https://solana.com/docs
- **WebAuthn Guide**: https://webauthn.guide

---

## 📄 License

MIT License - feel free to use this code in your projects!

---

## 🙏 Acknowledgments

- Built for the [Superteam Vietnam LazorKit Bounty](https://earn.superteam.fun/listing/integrate-passkey-technology-with-lazorkit-to-10x-solana-ux)
- Powered by [LazorKit SDK](https://lazorkit.com)
- Built on [Solana](https://solana.com)
