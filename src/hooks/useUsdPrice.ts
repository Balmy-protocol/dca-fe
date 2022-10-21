import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import { STABLE_COINS } from 'config/constants';
import { formatCurrencyAmount } from 'utils/currency';
import useCurrentNetwork from './useCurrentNetwork';
import usePriceService from './usePriceService';
import useWalletService from './useWalletService';

function useUsdPrice(
  from: Token | undefined | null,
  amount: BigNumber | null,
  date?: string,
  chainId?: number
): [number | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const priceService = usePriceService();
  const walletService = useWalletService();
  const [result, setResult] = React.useState<BigNumber | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevFrom = usePrevious(from);
  const currentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(chainId || currentNetwork.chainId);
  const protocolToken = getProtocolToken(chainId || currentNetwork.chainId);

  React.useEffect(() => {
    async function callPromise() {
      if (from && !STABLE_COINS.includes(from.symbol) && amount && amount.gt(BigNumber.from(0))) {
        try {
          const [price] = await priceService.getUsdHistoricPrice(
            [from.address === protocolToken.address ? wrappedProtocolToken : from],
            date,
            chainId
          );
          setResult(price);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
      }

      setIsLoading(false);
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from)) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, amount, isLoading, result, error, walletService.getAccount(), currentNetwork, chainId]);

  return React.useMemo(() => {
    if (!from || !amount) {
      return [undefined, false, undefined];
    }

    if (STABLE_COINS.includes(from.symbol)) {
      return [parseFloat(formatUnits(amount, from.decimals)), false, undefined];
    }

    if (amount.lte(BigNumber.from(0)) || !result) {
      return [0, false, undefined];
    }

    const multiplied = amount.mul(result);

    return [parseFloat(formatUnits(multiplied, from.decimals + 18)), isLoading, error];
  }, [result, from, amount, isLoading, error]);
}

export default useUsdPrice;
