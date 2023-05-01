import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { BigNumber } from 'ethers';
import useCurrentNetwork from './useCurrentNetwork';
import usePriceService from './usePriceService';
import useAccount from './useAccount';

function useRawUsdPrices(
  from: Token[] | undefined | null,
  date?: string,
  chainId?: number
): [Record<string, BigNumber> | undefined, boolean, string?] {
  const [{ result, isLoading, error }, setResults] = React.useState<{
    result: Record<string, BigNumber> | undefined;
    isLoading: boolean;
    error: string | undefined;
  }>({
    result: undefined,
    isLoading: false,
    error: undefined,
  });
  const priceService = usePriceService();
  const prevFrom = usePrevious(from);
  const currentNetwork = useCurrentNetwork();
  const account = useAccount();

  React.useEffect(() => {
    async function callPromise() {
      if (from && from.length) {
        try {
          const price = await priceService.getUsdHistoricPrice(from, date, chainId);
          if (price) {
            setResults({ result: price, error: undefined, isLoading: false });
          } else {
            setResults({ result: undefined, error: 'Could not find usd price', isLoading: false });
          }
        } catch (e) {
          setResults({ result: undefined, error: e as string, isLoading: false });
        }
      } else {
        setResults({ result: {}, error: undefined, isLoading: false });
      }
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from)) {
      setResults({ result: undefined, isLoading: true, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, isLoading, result, error, account, currentNetwork, chainId]);

  return [result, isLoading, error];
}

export default useRawUsdPrices;
