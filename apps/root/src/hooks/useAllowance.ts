import React from 'react';
import { Token, PositionVersions } from '@types';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { EMPTY_TOKEN } from '@common/mocks/tokens';
import useWalletService from './useWalletService';
import { Address } from 'viem';
import useInterval from './useInterval';
import { IntervalSetActions } from '@constants/timing';

export type Allowance = {
  token: Token;
  allowance: string | undefined;
};

type AllowanceResponse = [Allowance, boolean, string?];

const dummyToken: Allowance = { token: EMPTY_TOKEN, allowance: undefined };

function useAllowance(
  from: Token | undefined | null,
  owner: string,
  usesYield?: boolean,
  version?: PositionVersions
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
      if (from) {
        try {
          const promiseResult = await walletService.getAllowance(from, owner as Address, usesYield, version);
          setState({ result: promiseResult, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: dummyToken, error: e as string, isLoading: false });
        }
      }
    }

    setState({ isLoading: true, result: dummyToken, error: undefined });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    callPromise();
  }, [from, isLoading, result, error, usesYield, version, hasPendingTransactions, owner, walletService]);

  // When either of this values change we want to trigger this
  React.useEffect(fetchAllowance, [owner, from?.address]);
  useInterval(fetchAllowance, IntervalSetActions.allowance);

  if (!from) {
    return [dummyToken, false, undefined];
  }

  return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
}

export default useAllowance;
