import { useWallet } from '@lazorkit/wallet';

/**
 * ConnectButton Component
 * Handles passkey authentication flow
 */
export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect({ feeMode: 'paymaster' });
    } catch (error) {
      console.error('Connection failed:', error);
    }
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
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="btn btn-primary btn-large"
    >
      {isConnecting ? (
        <>
          <span className="spinner"></span>
          Connecting...
        </>
      ) : (
        'Connect with Passkey'
      )}
    </button>
  );
}
