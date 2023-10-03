import useWalletService from '@hooks/useWalletService';
import { useMemo } from 'react';
import { useAllTransactions } from '@state/transactions/hooks';
import { Token, TransactionTypes } from '@types';

const useHasPendingClaim = (token: Token | null) => {
  const allTransactions = useAllTransactions();
  const tokenAddress = (token && token.address) || '';
  const walletService = useWalletService();
  const spender = walletService.getAccount();

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
