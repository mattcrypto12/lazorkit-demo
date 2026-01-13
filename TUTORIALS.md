# LazorKit Tutorials

Detailed step-by-step tutorials for integrating LazorKit into your Solana applications.

---

## Table of Contents

1. [Tutorial 1: Passkey Wallet Setup](#tutorial-1-passkey-wallet-setup)
2. [Tutorial 2: Gasless Transactions](#tutorial-2-gasless-transactions)
3. [Tutorial 3: Message Signing](#tutorial-3-message-signing)
4. [Tutorial 4: Building Reusable Hooks](#tutorial-4-building-reusable-hooks)

---

## Tutorial 1: Passkey Wallet Setup

Learn how to add passkey authentication to your Solana app in under 10 minutes.

### Prerequisites
- Node.js 18+
- React 18+
- A browser with WebAuthn support (Chrome, Safari, Edge, Firefox)

### Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js
```

For Vite projects, also install polyfills:
```bash
npm install -D vite-plugin-node-polyfills
```

### Step 2: Configure Vite

Add the polyfills plugin to handle Node.js globals:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Required for Buffer, crypto
  ],
  server: {
    port: 3000,
  },
});
```

### Step 3: Create Configuration

Create a config file to centralize settings:

```typescript
// src/config/lazorkit.ts
export const LAZORKIT_CONFIG = {
  // Solana RPC endpoint
  RPC_URL: 'https://api.devnet.solana.com',
  
  // LazorKit authentication portal
  PORTAL_URL: 'https://portal.lazor.sh',
  
  // Paymaster for gasless transactions
  PAYMASTER: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
} as const;
```

### Step 4: Wrap Your App

Add the `LazorkitProvider` to your app:

```tsx
// src/App.tsx
import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from './config/lazorkit';

function App() {
  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.RPC_URL}
      portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
      paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
    >
      <YourApp />
    </LazorkitProvider>
  );
}
```

### Step 5: Create a Connect Button

```tsx
// src/components/ConnectButton.tsx
import { useWallet } from '@lazorkit/wallet';
import { useState } from 'react';

export function ConnectButton() {
  const { connect, disconnect, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect({ feeMode: 'paymaster' });
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return <button onClick={() => disconnect()}>Disconnect</button>;
  }

  return (
    <button onClick={handleConnect} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Connect with Passkey'}
    </button>
  );
}
```

### Step 6: Display Wallet Info

```tsx
// src/components/WalletInfo.tsx
import { useWallet } from '@lazorkit/wallet';

export function WalletInfo() {
  const { wallet, smartWalletPubkey, isConnected } = useWallet();

  if (!isConnected || !wallet) {
    return <p>Not connected</p>;
  }

  return (
    <div>
      <p>Address: {smartWalletPubkey?.toBase58()}</p>
      <p>Status: Connected ✓</p>
    </div>
  );
}
```

### What Happens Under the Hood

1. **First-time users**: LazorKit opens a portal where users create a passkey using biometrics
2. **A smart wallet PDA is created** on-chain, linked to the passkey
3. **Session is cached** in localStorage for future visits
4. **Returning users**: Session restores automatically, or re-authenticate if expired

---

## Tutorial 2: Gasless Transactions

Send SOL without users paying gas fees.

### Understanding the Flow

```
User Action → Create Instructions → Sign with Passkey → Paymaster Sponsors → Transaction Confirmed
```

The paymaster (sponsor) pays the network fee, so users can transact even with 0 SOL for gas.

### Basic Transfer

```tsx
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

function TransferButton() {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();

  const handleTransfer = async () => {
    if (!smartWalletPubkey || !isConnected) return;

    try {
      // 1. Create standard Solana instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: new PublicKey('RECIPIENT_ADDRESS'),
        lamports: 0.001 * LAMPORTS_PER_SOL,
      });

      // 2. Sign and send - paymaster handles gas!
      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      console.log('Success:', signature);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <button onClick={handleTransfer} disabled={!isConnected}>
      Send 0.001 SOL
    </button>
  );
}
```

### Multiple Instructions

You can batch multiple instructions in a single transaction:

```tsx
const instructions = [
  SystemProgram.transfer({
    fromPubkey: smartWalletPubkey,
    toPubkey: recipient1,
    lamports: 0.001 * LAMPORTS_PER_SOL,
  }),
  SystemProgram.transfer({
    fromPubkey: smartWalletPubkey,
    toPubkey: recipient2,
    lamports: 0.002 * LAMPORTS_PER_SOL,
  }),
];

const signature = await signAndSendTransaction({ instructions });
```

### Error Handling

```tsx
try {
  const signature = await signAndSendTransaction({ instructions });
} catch (error) {
  if (error.message.includes('insufficient lamports')) {
    alert('Not enough SOL in your wallet');
  } else if (error.message.includes('User rejected')) {
    alert('You cancelled the transaction');
  } else {
    alert('Transaction failed: ' + error.message);
  }
}
```

---

## Tutorial 3: Message Signing

Sign messages to prove wallet ownership without on-chain transactions.

### Use Cases
- Sign-in authentication (like "Sign in with Ethereum")
- Prove wallet ownership
- Sign off-chain agreements
- Generate verifiable attestations

### Implementation

```tsx
import { useWallet } from '@lazorkit/wallet';
import { useState } from 'react';

function SignMessage() {
  const { signMessage, isConnected } = useWallet();
  const [message, setMessage] = useState('Hello LazorKit!');
  const [signature, setSignature] = useState<string | null>(null);

  const handleSign = async () => {
    if (!isConnected) return;

    try {
      const result = await signMessage(message);
      setSignature(result.signature);
      console.log('Signed payload:', result.signedPayload);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message to sign"
      />
      <button onClick={handleSign}>Sign Message</button>
      
      {signature && (
        <div>
          <p>Signature:</p>
          <code>{signature}</code>
        </div>
      )}
    </div>
  );
}
```

### Backend Verification

The signature can be verified on your backend to authenticate users:

```typescript
// Example: Verify on backend (Node.js)
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = Buffer.from(signature, 'base64');
  const publicKeyBytes = new PublicKey(publicKey).toBytes();
  
  return nacl.sign.detached.verify(
    messageBytes,
    signatureBytes,
    publicKeyBytes
  );
}
```

---

## Tutorial 4: Building Reusable Hooks

Create custom hooks for cleaner code and better reusability.

### useBalance Hook

```typescript
// src/hooks/useBalance.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useBalance(publicKey: PublicKey | null, rpcUrl: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey.toBase58()],
        }),
      });
      
      const data = await response.json();
      setBalance(data.result?.value / LAMPORTS_PER_SOL ?? 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [publicKey, rpcUrl]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, isLoading, refresh: fetchBalance };
}
```

### useGaslessTransaction Hook

```typescript
// src/hooks/useGaslessTransaction.ts
import { useState, useCallback } from 'react';
import { useWallet } from '@lazorkit/wallet';

type Status = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

export function useGaslessTransaction() {
  const { signAndSendTransaction, isConnected } = useWallet();
  const [status, setStatus] = useState<Status>('idle');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (instructions: any[]) => {
    if (!isConnected) {
      setError('Not connected');
      return null;
    }

    setStatus('signing');
    setError(null);

    try {
      setStatus('confirming');
      const sig = await signAndSendTransaction({ instructions });
      setSignature(sig);
      setStatus('success');
      return sig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
      return null;
    }
  }, [signAndSendTransaction, isConnected]);

  const reset = useCallback(() => {
    setStatus('idle');
    setSignature(null);
    setError(null);
  }, []);

  return { send, status, signature, error, reset };
}
```

### Using the Hooks

```tsx
import { useBalance, useGaslessTransaction } from './hooks';

function MyComponent() {
  const { smartWalletPubkey } = useWallet();
  const { balance, isLoading } = useBalance(smartWalletPubkey, RPC_URL);
  const { send, status, signature } = useGaslessTransaction();

  const handleSend = async () => {
    const instruction = SystemProgram.transfer({ ... });
    await send([instruction]);
  };

  return (
    <div>
      <p>Balance: {isLoading ? 'Loading...' : `${balance} SOL`}</p>
      <button onClick={handleSend} disabled={status === 'signing'}>
        {status === 'signing' ? 'Signing...' : 'Send'}
      </button>
      {signature && <p>TX: {signature}</p>}
    </div>
  );
}
```

---

## Next Steps

- Explore the [Architecture Guide](./ARCHITECTURE.md) for deeper understanding
- Check out the [LazorKit Documentation](https://docs.lazorkit.com)
- Join the [LazorKit Telegram](https://t.me/lazorkit) for support
