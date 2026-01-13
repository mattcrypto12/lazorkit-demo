/**
 * LazorKit Configuration
 * 
 * This file contains the configuration settings for connecting to the LazorKit SDK.
 * LazorKit enables passkey-based authentication and gasless transactions on Solana.
 * 
 * For production use:
 * - Replace RPC_URL with your preferred RPC provider (Helius, QuickNode, etc.)
 * - The paymaster handles gas fees on devnet automatically
 */

export const LAZORKIT_CONFIG = {
  /**
   * Solana RPC URL
   * Using Devnet for this demo. For mainnet, use a paid RPC provider.
   */
  RPC_URL: 'https://api.devnet.solana.com',

  /**
   * LazorKit Portal URL
   * The authentication portal that handles passkey operations.
   * Generally, you don't need to change this unless self-hosting.
   */
  PORTAL_URL: 'https://portal.lazor.sh',

  /**
   * Paymaster Configuration
   * The paymaster sponsors gas fees, enabling gasless transactions.
   */
  PAYMASTER: {
    paymasterUrl: 'https://kora.devnet.lazorkit.com',
  },
} as const;

/**
 * Network Configuration
 * Additional Solana network settings
 */
export const NETWORK_CONFIG = {
  /**
   * Network name for display purposes
   */
  networkName: 'Devnet',

  /**
   * Solana Explorer base URL
   */
  explorerUrl: 'https://explorer.solana.com',

  /**
   * Cluster parameter for explorer links
   */
  cluster: 'devnet',
} as const;

/**
 * Demo Configuration
 * Settings specific to this demo application
 */
export const DEMO_CONFIG = {
  /**
   * Default transfer amount in SOL for the demo
   */
  defaultTransferAmount: 0.001,

  /**
   * Demo recipient address (a random devnet address for testing)
   * In a real app, this would be user-provided
   */
  defaultRecipient: 'GQVbE8ZqMqH3xRAqYsxoKQ6NNQeR4sE7ApCHsVWGvUzY',
} as const;
