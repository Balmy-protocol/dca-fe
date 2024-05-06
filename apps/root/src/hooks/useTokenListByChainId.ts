import React from 'react';
import { TokenListByChainId } from '@types';
import useTokenList, { UseTokenListProps } from './useTokenList';

function useTokenListByChainId(tokenListProps: UseTokenListProps) {
  const tokenList = useTokenList(tokenListProps);

  return React.useMemo(
    () =>
      Object.entries(tokenList).reduce<TokenListByChainId>(
        (acc, [tokenKey, token]) => ({
          ...acc,
          [token.chainId]: {
            ...acc[token.chainId],
            [tokenKey]: token,
          },
        }),
        {}
      ),
    [tokenList]
  );
}

export default useTokenListByChainId;
