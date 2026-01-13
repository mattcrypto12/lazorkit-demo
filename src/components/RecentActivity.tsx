import { useState, useEffect } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG, NETWORK_CONFIG } from '../config';
import { subscribeToPending, PendingTransaction } from '../utils/pendingTx';

interface Transaction {
  signature: string;
  type: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

/* Recent transactions list */
export function RecentActivity() {
  const { isConnected, smartWalletPubkey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTxs, setPendingTxs] = useState<Map<string, Transaction>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to pending transactions
  useEffect(() => {
    const unsubscribe = subscribeToPending((tx: PendingTransaction) => {
      setPendingTxs(prev => {
        const next = new Map(prev);
        next.set(tx.signature, {
          signature: tx.signature,
          type: 'Transfer',
          timestamp: tx.timestamp,
          status: 'pending',
        });
        return next;
      });
    });
    return unsubscribe;
  }, []);

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
              { limit: 10 }
            ],
          }),
        });

        const data = await response.json();
        
        if (data.result) {
          const allTxs: Transaction[] = data.result.map((tx: { signature: string; blockTime: number; err: unknown }) => ({
            signature: tx.signature,
            type: 'Transfer',
            timestamp: tx.blockTime * 1000,
            status: tx.err ? 'failed' : 'success',
          }));
          
          // Group transactions within 3 seconds of each other (smart wallet creates multiple)
          const grouped: Transaction[] = [];
          let lastTimestamp = 0;
          
          for (const tx of allTxs) {
            if (Math.abs(tx.timestamp - lastTimestamp) > 3000) {
              grouped.push(tx);
              lastTimestamp = tx.timestamp;
            }
          }
          
          // Remove confirmed transactions from pending
          setPendingTxs(prev => {
            const next = new Map(prev);
            for (const tx of grouped) {
              next.delete(tx.signature);
            }
            // Also remove any pending tx older than 60 seconds
            for (const [sig, ptx] of next) {
              if (Date.now() - ptx.timestamp > 60000) {
                next.delete(sig);
              }
            }
            return next;
          });
          
          setTransactions(grouped.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
    // Poll more frequently when there are pending txs
    const interval = setInterval(fetchTransactions, pendingTxs.size > 0 ? 3000 : 30000);
    return () => clearInterval(interval);
  }, [smartWalletPubkey?.toBase58(), pendingTxs.size]);

  // Combine pending and confirmed transactions
  const allTransactions = [
    ...Array.from(pendingTxs.values()),
    ...transactions.filter(tx => !pendingTxs.has(tx.signature)),
  ].slice(0, 5);

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
      ) : allTransactions.length === 0 ? (
        <div className="activity-empty">
          <p>No transactions yet</p>
          <span>Your transaction history will appear here</span>
        </div>
      ) : (
        <div className="activity-list">
          {allTransactions.map((tx) => (
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
