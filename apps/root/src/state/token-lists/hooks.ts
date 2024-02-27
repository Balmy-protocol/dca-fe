import { useAppSelector } from '@hooks/state';
import keyBy from 'lodash/keyBy';
import React from 'react';
import some from 'lodash/some';
import { TokenList, TokensLists } from '@types';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@state';

export function useSavedAllTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeAllTokenLists);
}

const tokenListByUrlSelector = (state: RootState['tokenLists']) => state.byUrl;

const customTokenListSelector = (state: RootState['tokenLists']) => state.customTokens;

const useTokenListSelector = createSelector(
  [tokenListByUrlSelector, customTokenListSelector],
  (byUrl, customTokens) => ({
    ...byUrl,
    'custom-tokens': customTokens,
  })
);

export function useTokensLists(): { [tokenListUrl: string]: TokensLists } {
  const appState = useAppSelector((state) => state.tokenLists);

  return useTokenListSelector(appState);
}

export function useCustomTokens(chainId?: number): TokenList {
  return useAppSelector((state) =>
    keyBy(
      state.tokenLists.customTokens.tokens.filter(({ chainId: tokenChainId }) => !chainId || tokenChainId === chainId),
      'address'
    )
  );
}

export function useIsLoadingAllTokenLists() {
  const allTokenLists = useSavedAllTokenLists();
  const tokenLists = useTokensLists();

  return React.useMemo(() => some(allTokenLists, (list) => !tokenLists[list].hasLoaded), [allTokenLists, tokenLists]);
}
