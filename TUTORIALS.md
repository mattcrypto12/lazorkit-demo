# LazorKit Tutorials

## 1. Setting Up Passkey Authentication

Install the SDK:

```bash
npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js
```

For Vite, add polyfills:

```bash
npm install -D vite-plugin-node-polyfills
```

```typescript
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), nodePolyfills()],
});
```

Wrap your app:

```tsx
import { LazorkitProvider } from '@lazorkit/wallet';

function App() {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{ paymasterUrl: "https://kora.devnet.lazorkit.com" }}
    >
      <YourApp />
    </LazorkitProvider>
  );
}
```

Connect button:

```tsx
import { useWallet } from '@lazorkit/wallet';

function ConnectButton() {
  const { connect, disconnect, isConnected } = useWallet();

  if (isConnected) {
    return <button onClick={() => disconnect()}>Disconnect</button>;
  }

  return (
    <button onClick={() => connect({ feeMode: 'paymaster' })}>
      Connect
    </button>
  );
}
```

---

## 2. Gasless Transactions

Send SOL without paying gas:

```tsx
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

function SendButton() {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const send = async () => {
    const ix = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('RECIPIENT'),
      lamports: 0.001 * LAMPORTS_PER_SOL,
    });

    const sig = await signAndSendTransaction({ instructions: [ix] });
    console.log('Done:', sig);
  };

  return <button onClick={send}>Send 0.001 SOL</button>;
}
```

The paymaster pays the network fee. User pays $0.

---

## 3. Message Signing

Prove wallet ownership without a transaction:

```tsx
import { useWallet } from '@lazorkit/wallet';

function SignButton() {
  const { signMessage } = useWallet();

  const sign = async () => {
    const result = await signMessage('Hello');
    console.log(result.signature);
  };

  return <button onClick={sign}>Sign</button>;
}
```

Use this for auth flows, attestations, or off-chain verification.

---

## 4. Fetching Token Balances

Get SPL token balances:

```tsx
const response = await fetch(RPC_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getTokenAccountsByOwner',
    params: [
      walletAddress,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' },
    ],
  }),
});

const data = await response.json();
// data.result.value contains token accounts
```

---

## 5. Error Handling

Common errors:

```tsx
try {
  await signAndSendTransaction({ instructions });
} catch (err) {
  if (err.message.includes('insufficient lamports')) {
    // Not enough SOL
  } else if (err.message.includes('User rejected')) {
    // User cancelled
  }
}
```

---

## Tips

- Sessions persist in localStorage
- Use `disconnect()` to clear session
- Passkeys work across devices (synced via iCloud/Google)
- Test on devnet first, get SOL from faucet.solana.com
