import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import { STABLE_COINS } from 'config/constants';
import useCurrentNetwork from './useCurrentNetwork';

function useUsdPrice(
  from: Token | undefined | null,
  amount: BigNumber,
  date?: string
): [number | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<number | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevFrom = usePrevious(from);
  const currentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const protocolToken = getProtocolToken(currentNetwork.chainId);

  React.useEffect(() => {
    async function callPromise() {
      if (from && !STABLE_COINS.includes(from.symbol)) {
        try {
          const price = await web3Service.getUsdHistoricPrice(
            from.address === protocolToken.address ? wrappedProtocolToken : from,
            date
          );
          const multiplied = amount.mul(price);
          setResult(parseFloat(formatUnits(multiplied, from.decimals + 18)));
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if ((!isLoading && isUndefined(result) && !error) || !isEqual(prevFrom, from)) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, isLoading, result, error, web3Service.getAccount(), currentNetwork]);

  if (!from) {
    return [undefined, false, undefined];
  }

  return [result, isLoading, error];
}

export default useUsdPrice;
