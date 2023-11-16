import find from 'lodash/find';
import React from 'react';
import useTokenList from './useTokenList';

function useGetToken() {
  const tokenList = useTokenList({ allowAllTokens: true, filter: true, filterChainId: false });

  return React.useCallback(
    (tokenAddress: string, checkForSymbol = false) => {
      if (!tokenAddress) {
        return undefined;
      }

      const foundToken = tokenList[tokenAddress];

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
