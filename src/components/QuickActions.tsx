import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config';

/**
 * QuickActions Component
 * 
 * Demonstrates one-click gasless transactions.
 * Shows how simple it is to integrate LazorKit for common actions.
 */
export function QuickActions() {
  const { isConnected, signAndSendTransaction, smartWalletPubkey } = useWallet();
  
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string; signature?: string } | null>(null);

  // Demo recipient for quick actions
  const DEMO_RECIPIENT = new PublicKey('GQVbE8ZqMqH3xRAqYsxoKQ6NNQeR4sE7ApCHsVWGvUzY');

  const actions = [
    { id: 'tip', label: 'Send 0.001 SOL', amount: 0.001, description: 'Quick tip' },
    { id: 'micro', label: 'Send 0.0001 SOL', amount: 0.0001, description: 'Micro payment' },
  ];

  const handleQuickAction = async (actionId: string, amount: number) => {
    if (!smartWalletPubkey) return;

    setActiveAction(actionId);
    setResult(null);

    try {
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: DEMO_RECIPIENT,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      setResult({
        type: 'success',
        message: `Sent ${amount} SOL`,
        signature,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setResult({
        type: 'error',
        message: message.includes('insufficient') 
          ? 'Insufficient balance' 
          : message.includes('rejected') 
            ? 'Cancelled' 
            : 'Failed',
      });
    } finally {
      setActiveAction(null);
    }
  };

  if (!isConnected) {
    return (
      <section className="card card-disabled">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="disabled-overlay">
          <span>Connect wallet to unlock</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Quick Actions</h2>
      </div>

      <p className="card-description">
        One-click gasless transactions. You pay $0.00 in network fees.
      </p>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id, action.amount)}
            disabled={activeAction !== null}
            className={`quick-action-btn ${activeAction === action.id ? 'loading' : ''}`}
          >
            {activeAction === action.id ? (
              <span className="spinner-small"></span>
            ) : (
              <>
                <span className="action-label">{action.label}</span>
                <span className="action-desc">{action.description}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {result && (
        <div className={`result-banner ${result.type}`}>
          <span>{result.message}</span>
          {result.signature && (
            <a
              href={`${NETWORK_CONFIG.explorerUrl}/tx/${result.signature}?cluster=${NETWORK_CONFIG.cluster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link"
            >
              View →
            </a>
          )}
        </div>
      )}
    </section>
  );
}
