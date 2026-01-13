import { useWallet } from '@lazorkit/wallet';
import { useEffect, useState, useRef } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LAZORKIT_CONFIG, NETWORK_CONFIG } from '../config';
import { ConnectButton } from './ConnectButton';

interface WalletInfoProps {
  wallet: {
    smartWallet: string;
    credentialId: string;
  };
}

/**
 * WalletInfo Component
 * Displays wallet details: address, credential, and balance
 */
export function WalletInfo({ wallet }: WalletInfoProps) {
  const { smartWalletPubkey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    async function fetchBalance() {
      if (!smartWalletPubkey) return;
      
      // Prevent concurrent fetches and rate limit to once per 10 seconds
      const now = Date.now();
      if (fetchingRef.current || now - lastFetchRef.current < 10000) return;
      
      fetchingRef.current = true;
      lastFetchRef.current = now;

      try {
        setIsLoading(true);
        const response = await fetch(LAZORKIT_CONFIG.RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [smartWalletPubkey.toBase58()],
          }),
        });
        const data = await response.json();
        if (data.error) {
          console.warn('RPC error:', data.error.message);
          return;
        }
        const lamports = data.result?.value ?? 0;
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }

    // Initial fetch after a short delay
    const initialTimeout = setTimeout(fetchBalance, 500);
    
    // Refresh every 30 seconds (not 10) to reduce load
    const interval = setInterval(fetchBalance, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [smartWalletPubkey?.toBase58()]); // Use string to prevent object reference changes

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getExplorerLink = (address: string) => 
    `${NETWORK_CONFIG.explorerUrl}/address/${address}?cluster=${NETWORK_CONFIG.cluster}`;

  return (
    <div className="wallet-info">
      <div className="wallet-header">
        <div className="status-indicator">
          <span className="status-dot"></span>
          Connected
        </div>
        <ConnectButton />
      </div>

      <div className="wallet-grid">
        <div className="wallet-field">
          <span className="wallet-label">Address</span>
          <div className="wallet-value">
            <code title={wallet.smartWallet}>{formatAddress(wallet.smartWallet)}</code>
            <button 
              className="btn-ghost" 
              onClick={() => copyToClipboard(wallet.smartWallet)}
              title="Copy"
            >
              Copy
            </button>
            <a 
              href={getExplorerLink(wallet.smartWallet)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              View
            </a>
          </div>
        </div>

        <div className="wallet-field">
          <span className="wallet-label">Credential ID</span>
          <div className="wallet-value">
            <code title={wallet.credentialId}>{formatAddress(wallet.credentialId)}</code>
          </div>
        </div>

        <div className="wallet-field">
          <span className="wallet-label">Balance</span>
          <div className="balance-value">
            {isLoading ? (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading...</span>
            ) : (
              <>
                {balance?.toFixed(4)}
                <span>SOL</span>
              </>
            )}
          </div>
        </div>
      </div>

      {balance !== null && balance < 0.1 && (
        <div className="info-box">
          <p>
            Need test SOL? Visit the{' '}
            <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
              Solana Faucet
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
