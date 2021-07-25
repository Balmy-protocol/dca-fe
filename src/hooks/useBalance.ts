import React from 'react';
import { Token, Web3Service, Web3ServicePromisableMethods } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { useHasPendingTransactions } from 'state/transactions/hooks';

function useBalance(from: Token) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<any>(undefined);
  const [error, setError] = React.useState<any>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = usePrevious(web3Service.getAccount());

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await web3Service.getBalance(from.address, from.decimals);
          setResult(promiseResult);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, web3Service.getAccount()) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);
      callPromise();
    }
  }, [from, isLoading, result, error, hasPendingTransactions, web3Service.getAccount()]);

  return [result, isLoading, error];
}

export default useBalance;
