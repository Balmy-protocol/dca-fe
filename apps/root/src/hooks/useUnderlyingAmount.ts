import React from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import some from 'lodash/some';
import every from 'lodash/every';
import usePrevious from '@hooks/usePrevious';

import useMeanApiService from './useMeanApiService';

function useUnderlyingAmount(
  tokens: { token: Token | undefined | null; amount: bigint | undefined | null; returnSame?: boolean }[]
): [bigint[], boolean, string?] {
  const [{ result, isLoading, error }, setParams] = React.useState<{
    result: bigint[];
    error: string | undefined;
    isLoading: boolean;
  }>({ result: [], error: undefined, isLoading: false });
  const meanApiService = useMeanApiService();
  const prevTokens = usePrevious(tokens);

  React.useEffect(() => {
    async function callPromise() {
      if (!tokens.length || some(tokens, { token: undefined })) {
        setParams({ isLoading: false, result: [], error: undefined });
        return;
      }
      try {
        const indexes = tokens.map((tokenObj, index) => ({
          ...tokenObj,
          originalIndex: index,
        }));

        const filteredTokens = indexes
          .filter<{ token: Token; amount: bigint; originalIndex: number }>(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (tokenObj) => !!tokenObj.token && !!tokenObj.amount && !tokenObj.returnSame
          )
          .map((tokenObj, index) => ({
            ...tokenObj,
            sentIndex: index,
          }));
        const promiseResult = await meanApiService.getUnderlyingTokens(filteredTokens);
        const newResults: bigint[] = [];

        indexes
          .filter<{ token: Token; amount: bigint; originalIndex: number }>(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (tokenObj) => !!tokenObj.token && !!tokenObj.amount && tokenObj.returnSame
          )
          .forEach((tokenObj) => {
            newResults[tokenObj.originalIndex] = tokenObj.amount;
          });

        filteredTokens.forEach(({ originalIndex, token, amount }) => {
          const individualResult =
            promiseResult[`${token.chainId}-${token.underlyingTokens[0].address}-${amount.toString()}`];
          if (individualResult) {
            newResults[originalIndex] = BigInt(individualResult.underlyingAmount);
          } else {
            console.warn('Could not fetch underlying for', token.address, amount.toString());
          }
        });

        setParams({ isLoading: false, result: newResults, error: undefined });
      } catch (e) {
        setParams({ isLoading: false, result: [], error: e as string });
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevTokens, tokens)) {
      setParams({ isLoading: true, result: [], error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [isLoading, result, error, tokens, prevTokens]);

  if (every(tokens, { returnSame: true })) {
    return [tokens.map((tokenObj) => tokenObj.amount || 0n), isLoading, error];
  }

  return [result, isLoading, error];
}

export default useUnderlyingAmount;
