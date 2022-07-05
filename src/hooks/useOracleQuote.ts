import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';
import { STABLE_COINS } from 'config/constants';
import useCurrentNetwork from './useCurrentNetwork';
import usePriceService from './usePriceService';
import useWalletService from './useWalletService';

function useOracleQuote(
  from: Token | undefined | null,
  to: Token | undefined | null
): [BigNumber | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const priceService = usePriceService();
  const walletService = useWalletService();
  const [result, setResult] = React.useState<BigNumber | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const fromToUse = STABLE_COINS.includes(from.symbol) ? to : from;
          const toToUse = STABLE_COINS.includes(from.symbol) ? from : to;
          const price = await priceService.getTokenQuote(fromToUse, toToUse, parseUnits('1', fromToUse.decimals || 18));
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
  }, [from, to, isLoading, result, error, walletService.getAccount(), currentNetwork]);

  if (!from || !to) {
    return [undefined, false, undefined];
  }

  return [result, isLoading, error];
}

export default useOracleQuote;
