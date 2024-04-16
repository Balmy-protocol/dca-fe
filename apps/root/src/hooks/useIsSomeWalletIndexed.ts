import React from 'react';
import useStoredTransactionHistory from './useStoredTransactionHistory';
import { Address } from 'viem';

const INDEXER_ACCEPTANCE = 0.95; // 95%

export default function useIsSomeWalletIndexed(wallet?: Address) {
  const { history } = useStoredTransactionHistory();

  const isSomeWalletIndexed = React.useMemo(() => {
    return Object.entries(history?.indexing || {}).some(([address, chainsData]) => {
      if (!wallet || wallet === address) {
        return Object.values(chainsData).some((chainData) => {
          if (!chainData.processedUpTo) {
            return false;
          }
          const percentProcessed = Number(chainData.processedUpTo) / Number(chainData.target);
          return percentProcessed >= INDEXER_ACCEPTANCE;
        });
      } else {
        return false;
      }
    });
  }, [history, wallet]);

  return { isSomeWalletIndexed, hasLoadedEvents: history !== undefined };
}
