import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { NETWORK_CONFIG, DEMO_CONFIG } from '../config';

/**
 * TransactionSection Component
 * 
 * Demonstrates gasless SOL transfers using LazorKit.
 * 
 * Key Features:
 * - Gasless transactions: User doesn't need SOL for gas fees
 * - Simple API: Just pass instructions and LazorKit handles the rest
 * - Passkey signing: Transaction is signed using device biometrics
 * 
 * How Gasless Transactions Work:
 * 1. User creates a transfer instruction
 * 2. LazorKit packages it with paymaster sponsorship
 * 3. User signs with their passkey (biometric prompt)
 * 4. Paymaster submits and pays for the transaction
 * 5. SOL is transferred from user's smart wallet
 */
export function TransactionSection() {
  const { isConnected, signAndSendTransaction, smartWalletPubkey } = useWallet();
  
  // Form state
  const [recipient, setRecipient] = useState<string>(DEMO_CONFIG.defaultRecipient);
  const [amount, setAmount] = useState<string>(DEMO_CONFIG.defaultTransferAmount.toString());
  
  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle SOL Transfer
   * 
   * Creates a transfer instruction and sends it via the paymaster.
   * The transaction is gasless - the paymaster pays for fees.
   */
  const handleTransfer = async () => {
    // Validate connection
    if (!smartWalletPubkey) {
      setError('Please connect your wallet first');
      return;
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      setError('Invalid recipient address');
      return;
    }

    // Validate amount
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      // Step 1: Create the transfer instruction
      // This is a standard Solana SystemProgram transfer
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,  // The smart wallet PDA
        toPubkey: recipientPubkey,       // Recipient address
        lamports: amountNumber * LAMPORTS_PER_SOL,  // Amount in lamports
      });

      // Step 2: Sign and send via LazorKit
      // The signAndSendTransaction method:
      // - Wraps the instruction in a transaction
      // - Requests passkey signature (biometric prompt)
      // - Submits via paymaster for gasless execution
      const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          // Optional: You can specify USDC for fee payment
          // feeToken: 'USDC',
        },
      });

      console.log('Transaction confirmed:', signature);
      setTxSignature(signature);
    } catch (err) {
      console.error('Transfer failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate Explorer link for transaction
   */
  const getExplorerTxLink = (signature: string) => {
    return `${NETWORK_CONFIG.explorerUrl}/tx/${signature}?cluster=${NETWORK_CONFIG.cluster}`;
  };

  // Don't show the transaction form if not connected
  if (!isConnected) {
    return (
      <section className="card card-disabled">
        <h2>💸 Gasless Transfer</h2>
        <p className="section-description">
          Connect your wallet to send gasless SOL transfers.
        </p>
        <div className="disabled-overlay">
          <span>🔒 Connect wallet to unlock</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>💸 Gasless Transfer</h2>
      <p className="section-description">
        Send SOL without paying gas fees! The paymaster sponsors your transaction.
      </p>

      <div className="transaction-form">
        {/* Recipient Input */}
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            className="input"
          />
        </div>

        {/* Amount Input */}
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

        {/* Send Button */}
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
            <>⚡ Send Gasless Transfer</>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <span>❌</span> {error}
        </div>
      )}

      {/* Success Display */}
      {txSignature && (
        <div className="alert alert-success">
          <span>✅</span>
          <div>
            <p>Transaction confirmed!</p>
            <a
              href={getExplorerTxLink(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View on Solana Explorer →
            </a>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <strong>💡 How it works:</strong>
        <ul>
          <li>Your transaction is signed with your passkey (biometric)</li>
          <li>The paymaster pays the network fees</li>
          <li>SOL is sent from your smart wallet to the recipient</li>
        </ul>
      </div>
    </section>
  );
}
