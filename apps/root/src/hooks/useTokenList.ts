import React from 'react';
import { TokenList } from '@types';
import { ALLOWED_YIELDS } from '@constants';
import { useTokensLists } from '@state/token-lists/hooks';
import { parseTokenList } from '@common/utils/parsing';

export interface UseTokenListProps {
  curateList?: boolean;
  filter?: boolean;
  chainId?: number;
  filterForDca?: boolean;
}

function useTokenList({ filter = true, chainId, filterForDca = false, curateList = false }: UseTokenListProps) {
  const tokensLists = useTokensLists();

  const reducedYieldTokens = React.useMemo(
    () =>
      ALLOWED_YIELDS[chainId || 1].reduce((acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()], []),
    [chainId]
  );

  const tokenList: TokenList = React.useMemo(
    () =>
      parseTokenList({
        filter,
        filterForDca,
        yieldTokens: reducedYieldTokens,
        chainId,
        tokensLists,
        curateList,
      }),
    [filterForDca, reducedYieldTokens, filter, chainId, curateList, tokensLists]
  );

  return tokenList;
}

export default useTokenList;
