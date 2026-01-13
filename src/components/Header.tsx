import { NETWORK_CONFIG } from '../config';

/* App header */
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
