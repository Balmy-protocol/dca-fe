import React from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { EMPTY_TOKEN } from '@common/mocks/tokens';
import useWalletService from './useWalletService';
import { Address } from 'viem';
import useInterval from './useInterval';
import { IntervalSetActions } from '@constants/timing';

type Allowance = {
  token: Token;
  allowance: string | undefined;
};

type AllowanceResponse = [Allowance, boolean, string?];

const dummyToken: Allowance = { token: EMPTY_TOKEN, allowance: undefined };

function useSpecificAllowance(
  from: Token | undefined | null,
  account: string,
  addressToCheck?: string | null
): AllowanceResponse {
  const walletService = useWalletService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result: Allowance;
    error?: string;
  }>({ isLoading: false, result: dummyToken, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const prevResult = usePrevious(result, false, 'allowance');

  const fetchAllowance = React.useCallback(() => {
    async function callPromise() {
      if (from && addressToCheck) {
        try {
          const promiseResult = await walletService.getSpecificAllowance(
            from,
            addressToCheck as Address,
            account as Address
          );
          setState({ result: promiseResult, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: dummyToken, error: e as string, isLoading: false });
        }
      } else {
        setState({ isLoading: false, result: dummyToken, error: undefined });
      }
    }

    setState({ isLoading: true, result: dummyToken, error: undefined });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    callPromise();
  }, [from, isLoading, result, error, addressToCheck, hasPendingTransactions, account, walletService]);

  // When either of this values change we want to trigger this
  React.useEffect(fetchAllowance, [addressToCheck, from?.address, account]);
  useInterval(fetchAllowance, IntervalSetActions.allowance);

  if (!from) {
    return [dummyToken, false, undefined];
  }

  return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
}

export default useSpecificAllowance;
