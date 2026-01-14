// Track YOUR transactions only (not other users')

type Listener = (tx: PendingTransaction) => void;

export interface PendingTransaction {
  signature: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

const listeners = new Set<Listener>();
const yourTransactions = new Map<string, PendingTransaction>();

export function addPendingTransaction(signature: string) {
  const tx: PendingTransaction = {
    signature,
    timestamp: Date.now(),
    status: 'pending',
  };
  yourTransactions.set(signature, tx);
  // Persist to localStorage so it survives refresh
  saveToStorage();
  listeners.forEach(fn => fn(tx));
}

export function subscribeToPending(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getYourTransactions(): PendingTransaction[] {
  loadFromStorage();
  const all = Array.from(yourTransactions.values()).sort((a, b) => b.timestamp - a.timestamp);
  
  // Group transactions within 5 seconds (LazorKit creates multiple per action)
  const grouped: PendingTransaction[] = [];
  let lastTimestamp = 0;
  
  for (const tx of all) {
    if (Math.abs(tx.timestamp - lastTimestamp) > 5000) {
      grouped.push(tx);
      lastTimestamp = tx.timestamp;
    }
  }
  
  return grouped;
}

export function markConfirmed(signature: string) {
  const tx = yourTransactions.get(signature);
  if (tx) {
    tx.status = 'confirmed';
    saveToStorage();
  }
}

export function isYourTransaction(signature: string): boolean {
  loadFromStorage();
  return yourTransactions.has(signature);
}

// LocalStorage helpers
const STORAGE_KEY = 'lazorkit_your_txs';

function saveToStorage() {
  try {
    const data = Array.from(yourTransactions.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadFromStorage() {
  if (yourTransactions.size > 0) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: [string, PendingTransaction][] = JSON.parse(raw);
      // Only keep transactions from last 24 hours
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [sig, tx] of data) {
        if (tx.timestamp > cutoff) {
          yourTransactions.set(sig, tx);
        }
      }
    }
  } catch {}
}
