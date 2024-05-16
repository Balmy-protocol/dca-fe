import React from 'react';
import { TokenList } from '@types';
import { useTokensLists } from '@state/token-lists/hooks';
import { parseTokenList } from '@common/utils/parsing';
import useYieldOptions from './useYieldOptions';

export interface UseTokenListProps {
  curateList?: boolean;
  filter?: boolean;
  chainId?: number;
  filterForDca?: boolean;
}

function useTokenList({ filter = true, chainId, filterForDca = false, curateList = false }: UseTokenListProps) {
  const tokensLists = useTokensLists();
  const [yieldOptions] = useYieldOptions(chainId);

  const reducedYieldTokens = React.useMemo(
    () => yieldOptions?.reduce((acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()], []),
    [yieldOptions]
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
