import { EULER_CLAIM_MIGRATORS_ADDRESSES } from '@constants';
import { EULER_4626_ADDRESSES } from '@pages/euler-claim/constants';
import useWeb3Service from '@hooks/useWeb3Service';
import { useMemo } from 'react';
import { useAllTransactions } from '@state/transactions/hooks';
import { TransactionTypes } from '@types';

const useHasPendingMigratorApprovals = () => {
  const allTransactions = useAllTransactions();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  return useMemo(
    () =>
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        const tx = allTransactions[hash];
        if (tx.type !== TransactionTypes.approveToken && tx.type !== TransactionTypes.approveTokenExact) return false;
        if (tx.receipt) {
          return false;
        }
        return (
          EULER_4626_ADDRESSES.includes(tx.typeData.token.address) &&
          tx.typeData.addressFor.toLowerCase() ===
            EULER_CLAIM_MIGRATORS_ADDRESSES[
              tx.typeData.token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES
            ].toLowerCase() &&
          tx.from === account
        );
      }),
    [allTransactions, account]
  );
};

export default useHasPendingMigratorApprovals;
