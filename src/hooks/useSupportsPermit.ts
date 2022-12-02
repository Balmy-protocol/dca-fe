import React from 'react';
import isUndefined from 'lodash/isUndefined';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import useWalletService from './useWalletService';

type SupportsPermitResponse = [boolean | undefined, boolean, string?];

function useSupportsPermit(from: Token | undefined | null): SupportsPermitResponse {
  const walletService = useWalletService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: boolean;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const prevFrom = usePrevious(from);
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.tokenHasPermit(from.address);
          setState({ result: promiseResult, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from) || !isEqual(account, prevAccount)) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, prevFrom, isLoading, result, error, prevAccount, account, walletService]);

  if (!from) {
    return [false, false, undefined];
  }

  const resultToReturn = isUndefined(result) ? prevResult : result;

  return [resultToReturn, isLoading, error];
}

export default useSupportsPermit;
