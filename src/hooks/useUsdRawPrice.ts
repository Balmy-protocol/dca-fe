import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { BigNumber } from 'ethers';
import { STABLE_COINS } from 'config/constants';
import useCurrentNetwork from './useCurrentNetwork';
import usePriceService from './usePriceService';
import useWalletService from './useWalletService';

function useRawUsdPrice(
  from: Token | undefined | null,
  date?: string,
  chainId?: number
): [BigNumber | undefined, boolean, string?] {
  const [{ result, isLoading, error }, setResults] = React.useState<{
    result: BigNumber | undefined;
    isLoading: boolean;
    error: string | undefined;
  }>({
    result: undefined,
    isLoading: false,
    error: undefined,
  });
  const priceService = usePriceService();
  const walletService = useWalletService();
  const prevFrom = usePrevious(from);
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function callPromise() {
      if (from && !STABLE_COINS.includes(from.symbol)) {
        try {
          const price = await priceService.getUsdHistoricPrice([from], date, chainId);
          if (price && price[from.address]) {
            setResults({ result: price[from.address], error: undefined, isLoading: false });
          } else {
            setResults({ result: undefined, error: 'Could not find usd price', isLoading: false });
          }
        } catch (e) {
          setResults({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from)) {
      setResults({ result: undefined, isLoading: true, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, isLoading, result, error, walletService.getAccount(), currentNetwork, chainId]);

  return [result, isLoading, error];
}

export default useRawUsdPrice;
