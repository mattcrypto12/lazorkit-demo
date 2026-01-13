import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from '../config';

// Devnet token mints (these are devnet equivalents)
const TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
    decimals: 6,
    icon: '💵',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    mint: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', // Devnet USDT
    decimals: 6,
    icon: '💲',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Devnet BONK
    decimals: 5,
    icon: '🐕',
  },
];

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
}

/*
 * TokenBalances - Shows SPL token balances for the connected wallet
 */
export function TokenBalances() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    async function fetchTokenBalances() {
      if (!smartWalletPubkey || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const response = await fetch(LAZORKIT_CONFIG.RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [
              smartWalletPubkey.toBase58(),
              { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
              { encoding: 'jsonParsed' },
            ],
          }),
        });

        const data = await response.json();
        
        if (data.result?.value) {
          const tokenBalances: TokenBalance[] = [];
          
          for (const account of data.result.value) {
            const info = account.account.data.parsed.info;
            const mint = info.mint;
            const token = TOKENS.find(t => t.mint === mint);
            
            if (token) {
              const amount = info.tokenAmount.uiAmount || 0;
              tokenBalances.push({
                symbol: token.symbol,
                name: token.name,
                balance: amount,
                icon: token.icon,
              });
            }
          }
          
          // Add tokens with 0 balance if not found
          for (const token of TOKENS) {
            if (!tokenBalances.find(b => b.symbol === token.symbol)) {
              tokenBalances.push({
                symbol: token.symbol,
                name: token.name,
                balance: 0,
                icon: token.icon,
              });
            }
          }
          
          setBalances(tokenBalances);
        } else {
          // No token accounts, show all as 0
          setBalances(TOKENS.map(t => ({
            symbol: t.symbol,
            name: t.name,
            balance: 0,
            icon: t.icon,
          })));
        }
      } catch (error) {
        console.error('Failed to fetch token balances:', error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }

    if (isConnected) {
      fetchTokenBalances();
      const interval = setInterval(fetchTokenBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [smartWalletPubkey?.toBase58(), isConnected]);

  if (!isConnected) return null;

  return (
    <div className="token-balances">
      <span className="wallet-label">Tokens</span>
      <div className="token-list">
        {isLoading && balances.length === 0 ? (
          <span className="token-loading">Loading...</span>
        ) : (
          balances.map((token) => (
            <div key={token.symbol} className="token-item">
              <span className="token-icon">{token.icon}</span>
              <span className="token-symbol">{token.symbol}</span>
              <span className="token-balance">{token.balance.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
