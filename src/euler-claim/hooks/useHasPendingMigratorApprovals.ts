import { EULER_CLAIM_MIGRATORS_ADDRESSES, TRANSACTION_TYPES } from 'config';
import { EULER_4626_ADDRESSES } from 'euler-claim/constants';
import useWeb3Service from 'hooks/useWeb3Service';
import { useMemo } from 'react';
import { useAllTransactions } from 'state/transactions/hooks';
import { ApproveTokenTypeData } from 'types';

const useHasPendingMigratorApprovals = () => {
  const allTransactions = useAllTransactions();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  return useMemo(
    () =>
      Object.keys(allTransactions).some((hash) => {
        if (!allTransactions[hash]) return false;
        if (
          allTransactions[hash].type !== TRANSACTION_TYPES.APPROVE_TOKEN &&
          allTransactions[hash].type !== TRANSACTION_TYPES.APPROVE_TOKEN_EXACT
        )
          return false;
        const tx = allTransactions[hash];
        if (tx.receipt) {
          return false;
        }
        return (
          EULER_4626_ADDRESSES.includes((<ApproveTokenTypeData>tx.typeData).token.address) &&
          (<ApproveTokenTypeData>tx.typeData).addressFor.toLowerCase() ===
            EULER_CLAIM_MIGRATORS_ADDRESSES[
              (<ApproveTokenTypeData>tx.typeData).token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES
            ].toLowerCase() &&
          tx.from === account
        );
      }),
    [allTransactions, account]
  );
};

export default useHasPendingMigratorApprovals;
