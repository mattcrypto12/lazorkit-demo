import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORK_CONFIG, DEMO_CONFIG } from '../config';

/**
 * TransactionSection Component
 * Demonstrates gasless SOL transfers using LazorKit paymaster
 */
export function TransactionSection() {
  const { isConnected, signAndSendTransaction, smartWalletPubkey } = useWallet();
  
  const [recipient, setRecipient] = useState<string>(DEMO_CONFIG.defaultRecipient);
  const [amount, setAmount] = useState<string>(DEMO_CONFIG.defaultTransferAmount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!smartWalletPubkey) {
      setError('Please connect your wallet first');
      return;
    }

    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      setError('Invalid recipient address');
      return;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: recipientPubkey,
        lamports: amountNumber * LAMPORTS_PER_SOL,
      });

      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      setTxSignature(signature);
    } catch (err) {
      console.error('Transfer failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      
      // Parse common errors into user-friendly messages
      if (errorMessage.includes('insufficient lamports')) {
        setError('Insufficient balance. Get devnet SOL from faucet.solana.com');
      } else if (errorMessage.includes('User rejected')) {
        setError('Transaction cancelled by user');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerTxLink = (signature: string) => 
    `${NETWORK_CONFIG.explorerUrl}/tx/${signature}?cluster=${NETWORK_CONFIG.cluster}`;

  if (!isConnected) {
    return (
      <section className="card card-disabled">
        <div className="card-header">
          <h2 className="card-title">Transfer</h2>
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
        <h2 className="card-title">Transfer</h2>
      </div>

      <div className="transaction-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="recipient">Recipient</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Solana address"
              className="input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount (SOL)</label>
            <input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={handleTransfer}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {txSignature && (
        <div className="alert alert-success">
          Transaction confirmed.{' '}
          <a href={getExplorerTxLink(txSignature)} target="_blank" rel="noopener noreferrer">
            View on Explorer
          </a>
        </div>
      )}
    </section>
  );
}
