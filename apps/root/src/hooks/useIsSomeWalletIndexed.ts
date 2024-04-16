import React from 'react';
import useStoredTransactionHistory from './useStoredTransactionHistory';

const INDEXER_ACCEPTANCE = 0.95; // 95%

export default function useIsSomeWalletIndexed() {
  const { history } = useStoredTransactionHistory();

  const isSomeWalletIndexed = React.useMemo(() => {
    const returnValue = Object.values(history?.indexing || {}).some((chainsData) => {
      const isSomeChainIndexed = Object.values(chainsData).some((chainData) => {
        if (!chainData.processedUpTo) {
          return false;
        }
        const percentProcessed = Number(chainData.processedUpTo) / Number(chainData.target);
        return percentProcessed >= INDEXER_ACCEPTANCE;
      });
      return isSomeChainIndexed;
    });
    return returnValue;
  }, [history]);

  return {isSomeWalletIndexed, hasLoadedEvents: history !== undefined};
}
