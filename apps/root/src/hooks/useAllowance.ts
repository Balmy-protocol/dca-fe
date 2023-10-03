import React, { useCallback } from 'react';
import { Token, PositionVersions } from '@types';
import usePrevious from '@hooks/usePrevious';
import { EMPTY_TOKEN } from '@common/mocks/tokens';
import { IntervalSetActions } from '@constants/timing';
import useWalletService from './useWalletService';
import useInterval from './useInterval';

export type Allowance = {
  token: Token;
  allowance: string | undefined;
};

type AllowanceResponse = [Allowance, boolean, string?];

const dummyToken: Allowance = { token: EMPTY_TOKEN, allowance: undefined };

function useAllowance(
  from: Token | undefined | null,
  usesYield?: boolean,
  version?: PositionVersions
): AllowanceResponse {
  const walletService = useWalletService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result: Allowance;
    error?: string;
  }>({ isLoading: false, result: dummyToken, error: undefined });
  const prevResult = usePrevious(result, false, 'allowance');

  const fetchAllowance = useCallback(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.getAllowance(from, usesYield, version);
          setState({ result: promiseResult, error: undefined, isLoading: false });
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
  }, [from, isLoading, usesYield, version, walletService]);

  useInterval(fetchAllowance, IntervalSetActions.allowance);

  return React.useMemo(() => {
    if (!from) {
      return [dummyToken, false, undefined];
    }

    return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
  }, [error, from, isLoading, prevResult, result]);
}

export default useAllowance;
