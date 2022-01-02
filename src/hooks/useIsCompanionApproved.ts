import React from 'react';
import { FullPosition } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { useHasPendingTransactions } from 'state/transactions/hooks';

function useIsCompanionApproved(position: FullPosition | undefined): [boolean | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<boolean | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(position);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = usePrevious(web3Service.getAccount());
  const currentAccount = web3Service.getAccount();

  React.useEffect(() => {
    async function callPromise() {
      if (position) {
        try {
          const promiseResult = await web3Service.companionIsApproved(position);
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
