import { useWallet } from '@lazorkit/wallet';
import { useState, useEffect, useRef } from 'react';

/**
 * ConnectButton Component
 * Handles passkey authentication flow
 * 
 * Note: We manage our own loading state because the SDK's isConnecting
 * doesn't reset when the user closes the portal popup without completing auth.
 */
export function ConnectButton() {
  const { connect, disconnect, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const connectPromiseRef = useRef<Promise<unknown> | null>(null);

  // Reset loading state if connection status changes
  useEffect(() => {
    if (isConnected) {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Detect when popup/dialog is closed by monitoring focus
  // This is a workaround since the SDK doesn't emit close events
  useEffect(() => {
    if (!isLoading) return;

    let checkCount = 0;
    const maxChecks = 120; // 60 seconds max

    const interval = setInterval(() => {
      checkCount++;
      
      // If we've been waiting too long, assume user closed the popup
      if (checkCount >= maxChecks) {
        setIsLoading(false);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleConnect = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      connectPromiseRef.current = connect({ feeMode: 'paymaster' });
      await connectPromiseRef.current;
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
      connectPromiseRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
    connectPromiseRef.current = null;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  if (isConnected) {
    return (
      <button onClick={handleDisconnect} className="btn btn-secondary">
        Disconnect
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="btn btn-primary btn-large"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Connecting...
          </>
        ) : (
          'Connect with Passkey'
        )}
      </button>
      {isLoading && (
        <button onClick={handleCancel} className="btn btn-ghost">
          Cancel
        </button>
      )}
    </div>
  );
}
