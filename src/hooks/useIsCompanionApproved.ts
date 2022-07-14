import React from 'react';
import { FullPosition } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { fullPositionToMappedPosition } from 'utils/parsing';
import useWalletService from './useWalletService';
import usePositionService from './usePositionService';

function useIsCompanionApproved(position: FullPosition | undefined): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const walletService = useWalletService();
  const positionService = usePositionService();
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(position);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = usePrevious(walletService.getAccount());
  const currentAccount = walletService.getAccount();

  React.useEffect(() => {
    async function callPromise() {
      if (position) {
        try {
          const promiseResult = await positionService.companionIsApproved(fullPositionToMappedPosition(position));
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if (
      (!isLoading && result === undefined && !error) ||
      !isEqual(prevFrom, position) ||
      !isEqual(account, currentAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [position, isLoading, result, error, hasPendingTransactions, currentAccount]);

  if (!position) {
    return [false, false, undefined];
  }

  return [
    result ||
      !currentAccount ||
      (currentAccount && currentAccount.toLowerCase() !== position.user.toLowerCase()) ||
      position.status === 'TERMINATED',
    isLoading,
    error,
  ];
}

export default useIsCompanionApproved;
