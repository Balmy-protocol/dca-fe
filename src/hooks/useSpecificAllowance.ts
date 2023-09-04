import React, { useCallback } from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { IntervalSetActions } from '@constants/timing';
import { EMPTY_TOKEN } from '@common/mocks/tokens';
import useSelectedNetwork from './useSelectedNetwork';
import useWalletService from './useWalletService';
import useInterval from './useInterval';

type Allowance = {
  token: Token;
  allowance: string | undefined;
};

type AllowanceResponse = [Allowance, boolean, string?];

const dummyToken: Allowance = { token: EMPTY_TOKEN, allowance: undefined };

function useSpecificAllowance(from: Token | undefined | null, addressToCheck?: string | null): AllowanceResponse {
  const walletService = useWalletService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result: Allowance;
    error?: string;
  }>({ isLoading: false, result: dummyToken, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const currentNetwork = useSelectedNetwork();
  const prevCurrentNetwork = usePrevious(currentNetwork);
  const prevResult = usePrevious(result, false, 'allowance');
  const prevAddress = usePrevious(addressToCheck);

  const fetchSpecificAllowance = useCallback(() => {
    async function callPromise() {
      if (from && addressToCheck) {
        try {
          const promiseResult = await walletService.getSpecificAllowance(from, addressToCheck);
          setState({ result: promiseResult, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: dummyToken, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(prevAddress, addressToCheck) ||
      !isEqual(prevCurrentNetwork?.chainId, currentNetwork.chainId)
    ) {
      setState({ isLoading: true, result: dummyToken, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    from,
    prevFrom,
    isLoading,
    result,
    error,
    addressToCheck,
    prevAddress,
    hasPendingTransactions,
    prevAccount,
    account,
    prevPendingTrans,
    prevCurrentNetwork?.chainId,
    currentNetwork.chainId,
    walletService,
  ]);

  useInterval(fetchSpecificAllowance, IntervalSetActions.allowance);

  if (!from) {
    return [dummyToken, false, undefined];
  }

  return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
}

export default useSpecificAllowance;
