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
  const [{ result, isLoading, error }, setParams] = React.useState<{
    result: BigNumber | null | undefined;
    error: string | undefined;
    isLoading: boolean;
  }>({ result: undefined, error: undefined, isLoading: false });
  const priceService = usePriceService();
  const prevToken = usePrevious(token);
  const prevAmount = usePrevious(amount);

  React.useEffect(() => {
    async function callPromise() {
      if (token && amount) {
        try {
          const promiseResult = await priceService.getTransformerValue(token.underlyingTokens[0].address, amount);
          setParams({ isLoading: false, result: promiseResult[0].amount, error: undefined });
        } catch (e) {
          setParams({ isLoading: false, result: undefined, error: e as string });
        }
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevToken, token) || !isEqual(prevAmount, amount)) {
      if (!returnSame) {
        setParams({ isLoading: true, result: undefined, error: undefined });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callPromise();
      } else {
        setParams({ isLoading: false, result: amount, error: undefined });
      }
    }
  }, [token, returnSame, isLoading, result, error, amount, prevAmount, token, prevToken]);

  if (!token) {
    return [null, false, undefined];
  }

  return [result, isLoading, error];
}

export default useUnderlyingAmount;
