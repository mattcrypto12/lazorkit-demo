// LazorKit SDK config

export const LAZORKIT_CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  PORTAL_URL: 'https://portal.lazor.sh',
  PAYMASTER: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
} as const;

// Network settings
export const NETWORK_CONFIG = {
  networkName: 'Devnet',
  explorerUrl: 'https://explorer.solana.com',
  cluster: 'devnet',
} as const;

// Demo defaults
export const DEMO_CONFIG = {
  defaultTransferAmount: 0.001,
  defaultRecipient: 'GQVbE8ZqMqH3xRAqYsxoKQ6NNQeR4sE7ApCHsVWGvUzY',
} as const;
