import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from './config';
import { Header } from './components/Header';
import { WalletSection } from './components/WalletSection';
import { QuickActions } from './components/QuickActions';
import { TransactionSection } from './components/TransactionSection';
import { MessageSection } from './components/MessageSection';
import { RecentActivity } from './components/RecentActivity';
import { Footer } from './components/Footer';

function App() {
  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.RPC_URL}
      portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
      paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
    >
      <div className="app">
        <Header />
        
        <main className="main-content">
          <div className="container">
            {/* Hero */}
            <section className="hero">
              <h1>LazorKit Passkey Demo</h1>
              <p className="hero-subtitle">
                Solana wallet authentication using device biometrics. No seed phrases, no browser extensions.
              </p>
              <div className="feature-list">
                <span className="feature-item">Passkey Auth</span>
                <span className="feature-item">Gasless Transactions</span>
                <span className="feature-item">Smart Wallet</span>
                <span className="feature-item">One-Click Actions</span>
              </div>
            </section>

            {/* Wallet Connection - Full Width */}
            <div className="grid-full" style={{ marginBottom: '24px' }}>
              <WalletSection />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid" style={{ marginBottom: '24px' }}>
              <QuickActions />
              <RecentActivity />
            </div>

            {/* Transaction & Message - Side by Side */}
            <div className="grid">
              <TransactionSection />
              <MessageSection />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LazorkitProvider>
  );
}

export default App;
