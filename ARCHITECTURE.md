# Architecture

## Flow

```
User → React App → LazorkitProvider → WebAuthn → LazorKit Portal → Solana
```

### Connect
1. User clicks connect
2. LazorKit opens portal (popup or iframe)
3. User authenticates with passkey (biometrics)
4. Portal returns wallet credentials
5. App stores session in localStorage

### Transaction
1. App creates instruction(s)
2. SDK wraps into transaction
3. User signs with passkey
4. Paymaster sponsors fee and submits
5. App gets signature back

## Files

```
src/
├── components/
│   ├── ConnectButton.tsx    # Passkey auth
│   ├── WalletInfo.tsx       # Address, balance display
│   ├── TokenBalances.tsx    # USDC, USDT, BONK
│   ├── QuickActions.tsx     # One-click sends
│   ├── TransactionSection.tsx
│   ├── MessageSection.tsx
│   └── RecentActivity.tsx
├── hooks/
│   ├── useBalance.ts        # SOL balance with polling
│   └── useGaslessTransaction.ts
├── config/
│   └── lazorkit.ts          # RPC, portal, paymaster URLs
└── styles/
    └── index.css
```

## Config

All in `src/config/lazorkit.ts`:

| Key | What it does |
|-----|--------------|
| RPC_URL | Solana endpoint |
| PORTAL_URL | LazorKit auth UI |
| PAYMASTER.paymasterUrl | Gas sponsor service |

## Smart Wallet

LazorKit creates a PDA (Program Derived Address) for each user. This is their on-chain wallet, controlled by their passkey.

## Paymaster

Pays transaction fees so users don't need SOL for gas. On devnet it's free. On mainnet, sponsors can cover fees or charge users in stablecoins.

## Session

Stored in localStorage. Auto-restores on page load. Call `disconnect()` to clear.
