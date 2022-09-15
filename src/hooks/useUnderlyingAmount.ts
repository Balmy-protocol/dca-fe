import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { BigNumber } from 'ethers';
import usePriceService from './usePriceService';

function useUnderlyingAmount(
  token: Token | undefined | null,
  amount: BigNumber | undefined | null,
  returnSame?: boolean
): [BigNumber | null | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const priceService = usePriceService();
  const [result, setResult] = React.useState<BigNumber | null | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevToken = usePrevious(token);
  const prevAmount = usePrevious(amount);

  React.useEffect(() => {
    async function callPromise() {
      if (token && amount) {
        try {
          const promiseResult = await priceService.getTransformerValue(token.underlyingTokens[0].address, amount);
          setResult(promiseResult[0].amount);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevToken, token) || !isEqual(prevAmount, amount)) {
      if (!returnSame) {
        setIsLoading(true);
        setResult(undefined);
        setError(undefined);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callPromise();
      } else {
        setIsLoading(false);
        setResult(amount);
        setError(undefined);
      }
    }
  }, [token, returnSame, isLoading, result, error]);

  if (!token) {
    return [null, false, undefined];
  }

  return [result, isLoading, error];
}

export default useUnderlyingAmount;
