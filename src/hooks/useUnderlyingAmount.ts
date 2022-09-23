import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { BigNumber } from 'ethers';
import useMeanApiService from './useMeanApiService';

function useUnderlyingAmount(
  tokens: { token: Token | undefined | null; amount: BigNumber | undefined | null; returnSame?: boolean }[]
): [BigNumber[], boolean, string?] {
  const [{ result, isLoading, error }, setParams] = React.useState<{
    result: BigNumber[];
    error: string | undefined;
    isLoading: boolean;
  }>({ result: [], error: undefined, isLoading: false });
  const meanApiService = useMeanApiService();
  const prevTokens = usePrevious(tokens);

  React.useEffect(() => {
    async function callPromise() {
      if (tokens.length) {
        try {
          const filteredTokens = tokens.filter<{ token: Token; amount: BigNumber }>(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (tokenObj) => !!tokenObj.token && !!tokenObj.amount && !tokenObj.returnSame
          );
          const promiseResult = await meanApiService.getUnderlyingTokens(filteredTokens);
          setParams({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setParams({ isLoading: false, result: [], error: e as string });
        }
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevTokens, tokens)) {
      setParams({ isLoading: true, result: [], error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, tokens, prevTokens]);

  return [result, isLoading, error];
}

export default useUnderlyingAmount;
