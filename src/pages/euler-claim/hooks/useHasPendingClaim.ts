import { TRANSACTION_TYPES } from '@constants';
import useWalletService from '@hooks/useWalletService';
import { useMemo } from 'react';
import { useAllTransactions } from '@state/transactions/hooks';
import { EulerClaimClaimFromMigratorTypeData, Token } from '@types';

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
        if (allTransactions[hash].type !== TRANSACTION_TYPES.EULER_CLAIM_CLAIM_FROM_MIGRATOR) return false;
        const tx = allTransactions[hash];
        if (tx.receipt) {
          return false;
        }
        return (<EulerClaimClaimFromMigratorTypeData>tx.typeData).token.address === tokenAddress && tx.from === spender;
      }),
    [allTransactions, spender, tokenAddress]
  );
};

export default useHasPendingClaim;
