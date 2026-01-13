import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from './config';
import { Header } from './components/Header';
import { WalletSection } from './components/WalletSection';
import { TransactionSection } from './components/TransactionSection';
import { MessageSection } from './components/MessageSection';
import { Footer } from './components/Footer';

/**
 * Main Application Component
 * 
 * This app demonstrates the key features of LazorKit SDK:
 * 1. Passkey-based wallet creation and authentication
 * 2. Gasless SOL transfers using the paymaster
 * 3. Message signing for verification
 * 
 * The LazorkitProvider wraps the entire app to provide wallet context.
 */
function App() {
  return (
    // LazorkitProvider initializes the SDK and provides wallet context
    // All child components can access wallet state via useWallet hook
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.RPC_URL}
      portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
      paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
    >
      <div className="app">
        <Header />
        
        <main className="main-content">
          <div className="container">
            {/* Hero Section */}
            <section className="hero">
              <h1>🔐 LazorKit Passkey Demo</h1>
              <p className="hero-subtitle">
                Experience the future of Solana UX: No seed phrases, no wallet extensions.
                Just your fingerprint or Face ID.
              </p>
              <div className="feature-badges">
                <span className="badge">✨ Passkey Auth</span>
                <span className="badge">⚡ Gasless Txns</span>
                <span className="badge">🔒 Smart Wallet</span>
              </div>
            </section>

            {/* Wallet Connection Section */}
            <WalletSection />

            {/* Transaction Demo Section */}
            <TransactionSection />

            {/* Message Signing Section */}
            <MessageSection />
          </div>
        </main>

        <Footer />
      </div>
    </LazorkitProvider>
  );
}

export default App;
