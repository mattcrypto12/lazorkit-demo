import { useWallet } from '@lazorkit/wallet';
import { ConnectButton } from './ConnectButton';
import { WalletInfo } from './WalletInfo';

/**
 * WalletSection Component
 * 
 * Main section for wallet connection and management.
 * Shows connect button when disconnected, wallet info when connected.
 * 
 * This demonstrates:
 * - How to check wallet connection status
 * - Conditional rendering based on wallet state
 */
export function WalletSection() {
  // useWallet hook provides all wallet state and methods
  const { isConnected, wallet } = useWallet();

  return (
    <section className="card">
      <h2>👛 Wallet Connection</h2>
      <p className="section-description">
        Connect using your device's biometric authentication (fingerprint, Face ID, or Windows Hello).
        No browser extension or seed phrase needed!
      </p>

      {/* Show wallet info if connected, otherwise show connect button */}
      {isConnected && wallet ? (
        <WalletInfo wallet={wallet} />
      ) : (
        <div className="connect-prompt">
          <ConnectButton />
          <p className="connect-hint">
            First time? A new smart wallet will be created for you.
          </p>
        </div>
      )}
    </section>
  );
}
