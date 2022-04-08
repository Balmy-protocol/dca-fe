import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { BigNumber } from 'ethers';
import useCurrentNetwork from './useCurrentNetwork';

function useOracleQuote(
  from: Token | undefined | null,
  to: Token | undefined | null,
  amount: BigNumber
): [BigNumber | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<BigNumber | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const price = await web3Service.getTokenQuote(from, to, amount);
          setResult(price);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from) || !isEqual(prevTo, to)) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, isLoading, result, error, web3Service.getAccount(), currentNetwork]);

  if (!from || !to) {
    return [undefined, false, undefined];
  }

  return [result, isLoading, error];
}

export default useOracleQuote;
