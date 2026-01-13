import { useState, useEffect, useRef, useCallback } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LAZORKIT_CONFIG } from '../config';

/* Fetch and poll SOL balance */
export function useBalance(publicKey: PublicKey | null, refreshInterval = 30000) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    
    // Prevent concurrent fetches and rate limit
    const now = Date.now();
    if (fetchingRef.current || now - lastFetchRef.current < 5000) return;
    
    fetchingRef.current = true;
    lastFetchRef.current = now;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(LAZORKIT_CONFIG.RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey.toBase58()],
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const lamports = data.result?.value ?? 0;
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    // Initial fetch after short delay
    const timeout = setTimeout(fetchBalance, 300);
    
    // Set up polling interval
    const interval = setInterval(fetchBalance, refreshInterval);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [publicKey?.toBase58(), fetchBalance, refreshInterval]);

  return { balance, isLoading, error, refresh: fetchBalance };
}
