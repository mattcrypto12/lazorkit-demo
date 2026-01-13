import { useWallet } from '@lazorkit/wallet';

/**
 * ConnectButton Component
 * 
 * A button that triggers the LazorKit passkey authentication flow.
 * 
 * How it works:
 * 1. User clicks the button
 * 2. LazorKit opens the authentication portal
 * 3. User authenticates with their device's biometrics
 * 4. If first time: A new passkey and smart wallet are created
 * 5. If returning: Session is restored automatically
 * 
 * The connect() function handles all complexity internally.
 */
export function ConnectButton() {
  // Destructure the methods and state we need from the wallet hook
  const { connect, disconnect, isConnected, isConnecting } = useWallet();

  /**
   * Handle the connect action
   * 
   * The feeMode option tells LazorKit how to handle transaction fees:
   * - 'paymaster': Gas fees are sponsored (gasless for user)
   * - 'user': User pays their own gas fees
   */
  const handleConnect = async () => {
    try {
      // Connect with paymaster mode for gasless transactions
      await connect({ feeMode: 'paymaster' });
      console.log('Successfully connected wallet!');
    } catch (error) {
      // Handle user cancellation or other errors gracefully
      console.error('Connection failed:', error);
    }
  };

  /**
   * Handle the disconnect action
   * 
   * This signs the user out and clears cached session data.
   * The passkey remains on the device for future logins.
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  // Show disconnect button if already connected
  if (isConnected) {
    return (
      <button 
        onClick={handleDisconnect} 
        className="btn btn-secondary"
      >
        🔓 Disconnect
      </button>
    );
  }

  // Show connect button with loading state
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
        <>🔐 Connect with Passkey</>
      )}
    </button>
  );
}
