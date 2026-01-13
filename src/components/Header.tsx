import { NETWORK_CONFIG } from '../config';

/**
 * Header Component
 * Displays app title and network indicator
 */
export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src="/lazorkit.svg" alt="LazorKit" className="logo-icon" />
          <span className="logo-text">LazorKit</span>
        </div>
        
        <div className="network-badge">
          <span className="network-dot"></span>
          {NETWORK_CONFIG.networkName}
        </div>
      </div>
    </header>
  );
}
