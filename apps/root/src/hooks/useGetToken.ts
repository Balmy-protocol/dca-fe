import find from 'lodash/find';
import React from 'react';
import useTokenList from './useTokenList';
import { findKey } from 'lodash';

function useGetToken() {
  const tokenList = useTokenList({ filter: true });

  return React.useCallback(
    (tokenAddress: string, checkForSymbol = false) => {
      if (!tokenAddress) {
        return undefined;
      }

      const key = findKey(tokenList, (token) => token.address === tokenAddress) as `${number}-${string}`;

      const foundToken = tokenList[key];

      if (foundToken || !checkForSymbol) {
        return foundToken;
      }

      const values = Object.values(tokenList);

      return find(values, { symbol: tokenAddress.toUpperCase() });
    },
    [tokenList]
  );
}

export default useGetToken;
