// Simple event system for pending transactions

type Listener = (tx: PendingTransaction) => void;

export interface PendingTransaction {
  signature: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

const listeners = new Set<Listener>();

export function addPendingTransaction(signature: string) {
  const tx: PendingTransaction = {
    signature,
    timestamp: Date.now(),
    status: 'pending',
  };
  listeners.forEach(fn => fn(tx));
}

export function subscribeToPending(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
