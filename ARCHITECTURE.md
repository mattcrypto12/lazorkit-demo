# LazorKit Demo - Architecture

This document explains the architecture and design decisions of the LazorKit demo application.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React Application                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Wallet     │  │ Transaction │  │  Message    │  │   │
│  │  │  Section    │  │  Section    │  │  Section    │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │   │
│  │         │                │                │          │   │
│  │         └────────────────┼────────────────┘          │   │
│  │                          │                            │   │
│  │                   ┌──────┴──────┐                    │   │
│  │                   │ LazorkitProvider │                │   │
│  │                   │  (useWallet)     │                │   │
│  │                   └──────┬──────┘                    │   │
│  └──────────────────────────┼───────────────────────────┘   │
│                              │                               │
│  ┌───────────────────────────┼───────────────────────────┐  │
│  │                    WebAuthn API                        │  │
│  │              (Passkey Authentication)                  │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     LazorKit Portal                           │
│                  (portal.lazor.sh)                            │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │ Passkey Manager │  │ Session Manager │                    │
│  └────────┬────────┘  └────────┬────────┘                    │
└───────────┼─────────────────────┼────────────────────────────┘
            │                     │
            ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     Solana Network                            │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │  Smart Wallet   │  │    Paymaster    │                    │
│  │     (PDA)       │  │ (Gas Sponsor)   │                    │
│  └─────────────────┘  └─────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── components/           # React UI components
│   ├── Header.tsx       # App header with logo
│   ├── Footer.tsx       # Footer with links
│   ├── ConnectButton.tsx # Passkey connection logic
│   ├── WalletInfo.tsx   # Wallet details display
│   ├── WalletSection.tsx # Wallet container
│   ├── QuickActions.tsx  # One-click transactions
│   ├── TransactionSection.tsx # Custom transfers
│   ├── MessageSection.tsx # Message signing
│   └── RecentActivity.tsx # Transaction history
│
├── hooks/               # Custom React hooks
│   ├── index.ts         # Hook exports
│   ├── useBalance.ts    # Balance fetching hook
│   └── useGaslessTransaction.ts # Transaction hook
│
├── config/              # Configuration
│   ├── index.ts         # Config exports
│   └── lazorkit.ts      # SDK configuration
│
├── styles/              # Global styles
│   └── index.css        # CSS with design tokens
│
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## Key Concepts

### 1. LazorkitProvider

The `LazorkitProvider` wraps your application and provides wallet context to all child components.

```tsx
<LazorkitProvider
  rpcUrl="https://api.devnet.solana.com"
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{ paymasterUrl: "https://kora.devnet.lazorkit.com" }}
>
  <App />
</LazorkitProvider>
```

### 2. Smart Wallet (PDA)

LazorKit creates a Program Derived Address (PDA) for each user. This PDA:
- Is controlled by the user's passkey
- Holds the user's assets
- Can execute transactions when signed with the passkey

### 3. Paymaster

The paymaster is a service that sponsors gas fees:
1. User creates a transaction
2. Paymaster wraps the transaction with sponsorship
3. User signs with passkey
4. Paymaster submits and pays the fee

### 4. Session Management

LazorKit stores session data in `localStorage`:
- `lazorkit-session`: Current wallet session
- Sessions persist across page refreshes
- Users can disconnect to clear the session

## Data Flow

### Connection Flow
```
1. User clicks "Connect"
2. LazorKit opens portal (popup/iframe)
3. User creates/selects passkey
4. Browser prompts for biometric
5. Portal returns credentials
6. SDK stores session
7. App receives wallet info
```

### Transaction Flow
```
1. App creates instruction(s)
2. SDK packages into transaction
3. User signs with passkey (biometric prompt)
4. Paymaster wraps and submits
5. App receives signature
```

## Custom Hooks

### useBalance
Fetches and tracks SOL balance with automatic polling and rate limiting.

### useGaslessTransaction
Handles transaction lifecycle with status tracking and error parsing.

## Security Considerations

1. **Private keys never leave the device** - Passkeys use the device's secure enclave
2. **No seed phrases** - Nothing to lose or expose
3. **Biometric required** - Each transaction requires user confirmation
4. **Session timeout** - Sessions expire for security

## Configuration

All configuration is centralized in `src/config/lazorkit.ts`:

| Setting | Description |
|---------|-------------|
| `RPC_URL` | Solana RPC endpoint |
| `PORTAL_URL` | LazorKit authentication portal |
| `PAYMASTER.paymasterUrl` | Gasless transaction sponsor |
