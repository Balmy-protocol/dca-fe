import React, { useCallback } from 'react';
import { Token } from '@types';
import usePrevious from '@hooks/usePrevious';
import { isEqual } from 'lodash';
import { IntervalSetActions } from '@constants/timing';
import { EMPTY_TOKEN } from '@common/mocks/tokens';
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
  const prevResult = usePrevious(result, false, 'allowance');

  const fetchSpecificAllowance = useCallback(() => {
    async function callPromise() {
      if (from && addressToCheck) {
        try {
          const promiseResult = await walletService.getSpecificAllowance(from, addressToCheck);
          if (!isEqual(promiseResult, result)) {
            setState({ result: promiseResult, error: undefined, isLoading: false });
          }
        } catch (e) {
          setState({ result: dummyToken, error: e as string, isLoading: false });
        }
      }
    }

    if (!isLoading) {
      setState({ isLoading: true, result: dummyToken, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [addressToCheck, from, isLoading, result, walletService]);

  useInterval(fetchSpecificAllowance, IntervalSetActions.allowance);

  return React.useMemo(() => {
    if (!from) {
      return [dummyToken, false, undefined];
    }

    return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
  }, [error, from, isLoading, prevResult, result]);
}

export default useSpecificAllowance;
