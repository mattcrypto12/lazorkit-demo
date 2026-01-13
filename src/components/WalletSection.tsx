import { useWallet } from '@lazorkit/wallet';
import { ConnectButton } from './ConnectButton';
import { WalletInfo } from './WalletInfo';

/**
 * WalletSection Component
 * Main section for wallet connection and management
 */
export function WalletSection() {
  const { isConnected, wallet } = useWallet();

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Wallet</h2>
      </div>

      {isConnected && wallet ? (
        <WalletInfo wallet={wallet} />
      ) : (
        <div className="connect-prompt">
          <ConnectButton />
          <p className="connect-hint">
            Authenticate with your device biometrics to create or access your wallet
          </p>
        </div>
      )}
    </section>
  );
}
