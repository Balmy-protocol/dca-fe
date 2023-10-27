import { useMemo } from 'react';
import { useAllTransactions } from '@state/transactions/hooks';
import { Token, TransactionTypes } from '@types';

const useHasPendingClaim = (token: Token | null, spender: string) => {
  const allTransactions = useAllTransactions();
  const tokenAddress = (token && token.address) || '';

  return useMemo(
    () =>
      !!token &&
      typeof tokenAddress === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
        if (tx.type !== TransactionTypes.eulerClaimClaimFromMigrator) return false;
        if (tx.receipt) {
          return false;
        }
        return tx.typeData.token.address === tokenAddress && tx.from === spender;
      }),
    [allTransactions, spender, tokenAddress]
  );
};

export default useHasPendingClaim;
