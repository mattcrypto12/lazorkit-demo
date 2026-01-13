import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG, NETWORK_CONFIG } from '../config';
import { subscribeToPending, getYourTransactions, markConfirmed } from '../utils/pendingTx';

interface Transaction {
  signature: string;
  type: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

/* Recent transactions list - only shows YOUR transactions */
export function RecentActivity() {
  const { isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Subscribe to new pending transactions
  useEffect(() => {
    const unsubscribe = subscribeToPending(() => {
      setRefreshKey(k => k + 1);
    });
    return unsubscribe;
  }, []);

  // Load YOUR transactions from storage + check confirmation status
  useEffect(() => {
    async function loadYourTransactions() {
      const yourTxs = getYourTransactions();
      
      // Check pending transactions for confirmation
      const pendingOnes = yourTxs.filter(tx => tx.status === 'pending');
      
      for (const tx of pendingOnes) {
        try {
          const response = await fetch(LAZORKIT_CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getSignatureStatuses',
              params: [[tx.signature]],
            }),
          });
          const data = await response.json();
          if (data.result?.value?.[0]?.confirmationStatus) {
            markConfirmed(tx.signature);
          }
        } catch {}
      }

      // Reload after checking confirmations
      const updated = getYourTransactions();
      setTransactions(updated.slice(0, 10).map(tx => ({
        signature: tx.signature,
        type: 'Transfer',
        timestamp: tx.timestamp,
        status: tx.status === 'confirmed' ? 'success' : tx.status,
      })));
    }

    loadYourTransactions();
    const interval = setInterval(loadYourTransactions, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

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

      {transactions.length === 0 ? (
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
              className={`activity-item ${tx.status === 'pending' ? 'pending' : ''}`}
            >
              <div className="activity-info">
                {tx.status === 'pending' ? (
                  <span className="spinner-small pending-spinner"></span>
                ) : (
                  <span className={`activity-status ${tx.status}`}></span>
                )}
                <span className="activity-type">{tx.type}</span>
                <code className="activity-sig">{formatSignature(tx.signature)}</code>
              </div>
              <span className="activity-time">
                {tx.status === 'pending' ? 'Pending...' : formatTime(tx.timestamp)}
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
