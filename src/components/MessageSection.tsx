import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';

/**
 * MessageSection Component
 * 
 * Demonstrates message signing with LazorKit passkeys.
 * 
 * Use Cases for Message Signing:
 * - Verify wallet ownership without a transaction
 * - Sign-in to dApps (similar to "Sign-In with Ethereum")
 * - Prove identity for off-chain operations
 * - Create verifiable signatures for documents
 * 
 * How it Works:
 * 1. User enters a message to sign
 * 2. User confirms with their passkey (biometric)
 * 3. A cryptographic signature is generated
 * 4. The signature can be verified on-chain or off-chain
 */
export function MessageSection() {
  const { isConnected, signMessage } = useWallet();
  
  // Form state
  const [message, setMessage] = useState('Hello LazorKit! This is my first signed message.');
  
  // Signing state
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle Message Signing
   * 
   * Signs the message using the passkey.
   * This does NOT create an on-chain transaction.
   */
  const handleSign = async () => {
    if (!message.trim()) {
      setError('Please enter a message to sign');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      // Sign the message using the passkey
      // This triggers a biometric prompt
      const result = await signMessage(message);
      
      console.log('Message signed:', result);
      setSignature(result.signature);
    } catch (err) {
      console.error('Signing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign message');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy signature to clipboard
   */
  const copySignature = async () => {
    if (signature) {
      try {
        await navigator.clipboard.writeText(signature);
        alert('Signature copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Don't show the form if not connected
  if (!isConnected) {
    return (
      <section className="card card-disabled">
        <h2>✍️ Message Signing</h2>
        <p className="section-description">
          Connect your wallet to sign messages.
        </p>
        <div className="disabled-overlay">
          <span>🔒 Connect wallet to unlock</span>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>✍️ Message Signing</h2>
      <p className="section-description">
        Sign messages to prove wallet ownership without creating a transaction.
      </p>

      <div className="message-form">
        {/* Message Input */}
        <div className="form-group">
          <label htmlFor="message">Message to Sign</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            className="input textarea"
            rows={3}
          />
        </div>

        {/* Sign Button */}
        <button
          onClick={handleSign}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Signing...
            </>
          ) : (
            <>✍️ Sign Message</>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <span>❌</span> {error}
        </div>
      )}

      {/* Signature Display */}
      {signature && (
        <div className="signature-result">
          <label>Signature</label>
          <div className="signature-display">
            <code className="signature-text">{signature}</code>
            <button
              onClick={copySignature}
              className="btn-icon"
              title="Copy signature"
            >
              📋
            </button>
          </div>
          <p className="signature-note">
            ✅ Message signed successfully! This signature can be verified to prove you own this wallet.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <strong>💡 Use cases:</strong>
        <ul>
          <li>Sign-in to dApps without transactions</li>
          <li>Verify wallet ownership off-chain</li>
          <li>Create verifiable attestations</li>
        </ul>
      </div>
    </section>
  );
}
