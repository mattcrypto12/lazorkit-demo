import { useState, useCallback } from 'react';
import { useWallet } from '@lazorkit/wallet';

/**
 * Transaction status for tracking UI state
 */
export type TransactionStatus = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

/**
 * Custom hook for sending gasless transactions with LazorKit
 * 
 * Features:
 * - User-friendly error messages
 * - Transaction status tracking
 * - Automatic error parsing
 * 
 * @example
 * const { send, status, signature, error } = useGaslessTransaction();
 * await send([instruction1, instruction2]);
 */
export function useGaslessTransaction() {
  const { signAndSendTransaction, isConnected } = useWallet();
  
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseError = (err: Error): string => {
    const message = err.message;
    
    if (message.includes('insufficient lamports')) {
      return 'Insufficient balance. Get devnet SOL from faucet.solana.com';
    }
    if (message.includes('User rejected') || message.includes('cancelled')) {
      return 'Transaction cancelled';
    }
    if (message.includes('Blockhash not found')) {
      return 'Network congestion. Please try again.';
    }
    if (message.includes('0x1')) {
      return 'Transaction failed. Check your balance and try again.';
    }
    
    return message;
  };

  const send = useCallback(async (instructions: Parameters<typeof signAndSendTransaction>[0]['instructions']) => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return null;
    }

    setStatus('signing');
    setSignature(null);
    setError(null);

    try {
      setStatus('confirming');
      const sig = await signAndSendTransaction({ instructions });
      
      setSignature(sig);
      setStatus('success');
      return sig;
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(parseError(err instanceof Error ? err : new Error('Unknown error')));
      setStatus('error');
      return null;
    }
  }, [signAndSendTransaction, isConnected]);

  const reset = useCallback(() => {
    setStatus('idle');
    setSignature(null);
    setError(null);
  }, []);

  return { send, status, signature, error, reset };
}
