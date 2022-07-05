import React from 'react';
import { UsedToken } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import useWalletService from './useWalletService';

function useUsedTokens(): [string[], boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const walletService = useWalletService();
  const [result, setResult] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const account = usePrevious(walletService.getAccount());

  React.useEffect(() => {
    async function callPromise() {
      try {
        const usedTokensData = await walletService.getUsedTokens();
        const mappedTokens =
          (usedTokensData &&
            usedTokensData.data.tokens &&
            usedTokensData.data.tokens.map((token: UsedToken) => token.tokenInfo.address.toLowerCase())) ||
          [];
        setResult(mappedTokens);
        setError(undefined);
      } catch (e) {
        setError(e as string);
      }
      setIsLoading(false);
    }

    if ((!isLoading && !result && !error) || !isEqual(account, walletService.getAccount())) {
      setIsLoading(true);
      setResult([]);
      setError(undefined);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, walletService.getAccount()]);

  return [result, isLoading, error];
}

export default useUsedTokens;
