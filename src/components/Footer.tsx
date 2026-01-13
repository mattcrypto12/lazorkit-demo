/**
 * Footer Component
 * 
 * Displays helpful links and resources about LazorKit.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Built with ❤️ for the Solana ecosystem using{' '}
          <a href="https://lazorkit.com" target="_blank" rel="noopener noreferrer">
            LazorKit SDK
          </a>
        </p>
        
        <div className="footer-links">
          <a 
            href="https://docs.lazorkit.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            📚 Docs
          </a>
          <a 
            href="https://github.com/lazor-kit/lazor-kit" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            💻 GitHub
          </a>
          <a 
            href="https://t.me/lazorkit" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            💬 Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}
