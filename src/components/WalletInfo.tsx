import { useWallet } from '@lazorkit/wallet';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config';
import { ConnectButton } from './ConnectButton';

/**
 * WalletInfo Props
 * Type definition for the wallet information display
 */
interface WalletInfoProps {
  wallet: {
    smartWallet: string;
    credentialId: string;
  };
}

/**
 * WalletInfo Component
 * 
 * Displays detailed information about the connected wallet:
 * - Smart wallet address (the on-chain PDA)
 * - Credential ID (the passkey identifier)
 * - Current SOL balance
 * - Links to the block explorer
 * 
 * This demonstrates how to access wallet data after connection.
 */
export function WalletInfo({ wallet }: WalletInfoProps) {
  const { smartWalletPubkey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch the wallet's SOL balance
   * Uses the Solana RPC to get the current balance
   */
  useEffect(() => {
    async function fetchBalance() {
      if (!smartWalletPubkey) return;

      try {
        setIsLoading(true);
        // Create a connection to fetch balance
        const response = await fetch(
          `https://api.devnet.solana.com`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBalance',
              params: [smartWalletPubkey.toBase58()],
            }),
          }
        );
        const data = await response.json();
        const lamports = data.result?.value ?? 0;
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [smartWalletPubkey]);

  /**
   * Format address for display
   * Shows first 6 and last 4 characters
   */
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /**
   * Copy address to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Generate Solana Explorer link
   */
  const getExplorerLink = (address: string) => {
    return `${NETWORK_CONFIG.explorerUrl}/address/${address}?cluster=${NETWORK_CONFIG.cluster}`;
  };

  return (
    <div className="wallet-info">
      {/* Connection Status */}
      <div className="status-bar">
        <span className="status-connected">
          <span className="status-dot connected"></span>
          Connected
        </span>
        <ConnectButton />
      </div>

      {/* Wallet Details */}
      <div className="wallet-details">
        {/* Smart Wallet Address */}
        <div className="detail-row">
          <label>Smart Wallet Address</label>
          <div className="address-display">
            <code title={wallet.smartWallet}>
              {formatAddress(wallet.smartWallet)}
            </code>
            <button 
              className="btn-icon" 
              onClick={() => copyToClipboard(wallet.smartWallet)}
              title="Copy address"
            >
              📋
            </button>
            <a 
              href={getExplorerLink(wallet.smartWallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="View on Explorer"
            >
              🔗
            </a>
          </div>
        </div>

        {/* Credential ID */}
        <div className="detail-row">
          <label>Passkey Credential ID</label>
          <code className="credential-id" title={wallet.credentialId}>
            {formatAddress(wallet.credentialId)}
          </code>
        </div>

        {/* SOL Balance */}
        <div className="detail-row">
          <label>Balance</label>
          <div className="balance-display">
            {isLoading ? (
              <span className="loading-text">Loading...</span>
            ) : (
              <span className="balance-amount">
                {balance?.toFixed(4)} SOL
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Airdrop Hint for Devnet */}
      {balance !== null && balance < 0.1 && (
        <div className="info-box">
          <p>
            💡 Need test SOL? Visit the{' '}
            <a 
              href="https://faucet.solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Solana Faucet
            </a>
            {' '}and enter your wallet address to get free devnet SOL.
          </p>
        </div>
      )}
    </div>
  );
}
