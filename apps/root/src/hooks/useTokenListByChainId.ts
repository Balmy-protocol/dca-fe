import React from 'react';
import { TokenListByChainId, TokenListId } from '@types';
import useTokenList, { UseTokenListProps } from './useTokenList';

function useTokenListByChainId(tokenListProps: UseTokenListProps) {
  const tokenList = useTokenList(tokenListProps);

  return React.useMemo(
    () =>
      Object.entries(tokenList).reduce<TokenListByChainId>((acc, [tokenKey, token]) => {
        if (!acc[token.chainId]) {
          // eslint-disable-next-line no-param-reassign
          acc[token.chainId] = {};
        }

        // eslint-disable-next-line no-param-reassign
        acc[token.chainId][tokenKey as TokenListId] = token;
        return acc;
      }, {}),
    [tokenList]
  );
}

export default useTokenListByChainId;
