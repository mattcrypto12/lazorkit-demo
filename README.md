# LazorKit Passkey Demo

Solana wallet demo using passkeys (WebAuthn) instead of seed phrases. Built with LazorKit SDK.

**Live Demo:** https://lazorkit-demo-two.vercel.app

## What's in here

- Passkey login (fingerprint/Face ID)
- Gasless transactions (paymaster covers fees)
- SOL + token balances (USDC, USDT, BONK)
- Quick actions for one-click sends
- Message signing
- Transaction history

## Quick Start

```bash
git clone https://github.com/mattcrypto12/lazorkit-demo.git
cd lazorkit-demo
npm install
npm run dev
```

Opens at http://localhost:3000

## Configuration

Edit `src/config/lazorkit.ts`:

```typescript
export const LAZORKIT_CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  PORTAL_URL: 'https://portal.lazor.sh',
  PAYMASTER: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
};
```

## Docs

- [TUTORIALS.md](./TUTORIALS.md) - Step-by-step integration guides
- [ARCHITECTURE.md](./ARCHITECTURE.md) - How it all fits together

## How Passkeys Work

1. User clicks "Connect"
2. LazorKit opens auth portal
3. User creates/uses passkey via biometrics
4. Smart wallet (PDA) is created on-chain
5. Session saved locally for next time

## How Gasless Works

You create a transaction → Paymaster wraps it → User signs with passkey → Paymaster pays the fee and submits.

The user never pays SOL for gas. The paymaster sponsors it.

## Stack

- Vite + React + TypeScript
- @lazorkit/wallet
- @solana/web3.js

## License

MIT
