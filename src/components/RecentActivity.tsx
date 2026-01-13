import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG, NETWORK_CONFIG } from '../config';

interface Transaction {
  signature: string;
  type: string;
  timestamp: number;
  status: 'success' | 'failed';
}

/* Recent transactions list */
export function RecentActivity() {
  const { isConnected, smartWalletPubkey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      if (!smartWalletPubkey) return;

      setIsLoading(true);
      try {
        const response = await fetch(LAZORKIT_CONFIG.RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignaturesForAddress',
            params: [
              smartWalletPubkey.toBase58(),
              { limit: 5 }
            ],
          }),
        });

        const data = await response.json();
        
        if (data.result) {
          const txs: Transaction[] = data.result.map((tx: { signature: string; blockTime: number; err: unknown }) => ({
            signature: tx.signature,
            type: 'Transfer',
            timestamp: tx.blockTime * 1000,
            status: tx.err ? 'failed' : 'success',
          }));
          setTransactions(txs);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [smartWalletPubkey?.toBase58()]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSignature = (sig: string) => `${sig.slice(0, 8)}...`;

  if (!isConnected) {
    return null;
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Activity</h2>
      </div>

      {isLoading && transactions.length === 0 ? (
        <div className="activity-loading">
          <span className="spinner-small"></span>
          <span>Loading...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="activity-empty">
          <p>No transactions yet</p>
          <span>Your transaction history will appear here</span>
        </div>
      ) : (
        <div className="activity-list">
          {transactions.map((tx) => (
            <a
              key={tx.signature}
              href={`${NETWORK_CONFIG.explorerUrl}/tx/${tx.signature}?cluster=${NETWORK_CONFIG.cluster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="activity-item"
            >
              <div className="activity-info">
                <span className={`activity-status ${tx.status}`}></span>
                <span className="activity-type">{tx.type}</span>
                <code className="activity-sig">{formatSignature(tx.signature)}</code>
              </div>
              <span className="activity-time">{formatTime(tx.timestamp)}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
