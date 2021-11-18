import React from 'react';
import { UsedToken } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';

function useUsedTokens(): [string[], boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const account = usePrevious(web3Service.getAccount());

  React.useEffect(() => {
    async function callPromise() {
      try {
        const usedTokensData = await web3Service.getUsedTokens();
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

    if ((!isLoading && !result && !error) || !isEqual(account, web3Service.getAccount())) {
      setIsLoading(true);
      setResult([]);
      setError(undefined);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, web3Service.getAccount()]);

  return [result, isLoading, error];
}

export default useUsedTokens;
