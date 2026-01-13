import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';

/**
 * MessageSection Component
 * Demonstrates message signing for wallet verification
 */
export function MessageSection() {
  const { isConnected, signMessage } = useWallet();
  
  const [message, setMessage] = useState('Hello LazorKit!');
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      const result = await signMessage(message);
      setSignature(result.signature);
    } catch (err) {
      console.error('Signing failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign');
    } finally {
      setIsLoading(false);
    }
  };

  const copySignature = async () => {
    if (signature) {
      try {
        await navigator.clipboard.writeText(signature);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (!isConnected) {
    return (
      <section className="card card-disabled">
        <div className="card-header">
          <h2 className="card-title">Sign Message</h2>
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
        <h2 className="card-title">Sign Message</h2>
      </div>

      <div className="message-form">
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message..."
            className="input textarea"
            rows={3}
          />
        </div>

        <div className="form-actions">
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
              'Sign'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {signature && (
        <div className="signature-result">
          <div className="signature-label">Signature</div>
          <div className="signature-value">
            <code className="signature-text">{signature}</code>
            <button onClick={copySignature} className="btn-ghost">
              Copy
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
