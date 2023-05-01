import { useAppSelector } from '@hooks/state';
import keyBy from 'lodash/keyBy';
import React from 'react';
import some from 'lodash/some';
import { TokenList, TokensLists } from '@types';

export function useSavedTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeLists);
}

export function useSavedAggregatorTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeAggregatorLists);
}

export function useTokensLists(): { [tokenListUrl: string]: TokensLists } {
  return useAppSelector((state) => ({ ...state.tokenLists.byUrl, 'custom-tokens': state.tokenLists.customTokens }));
}

export function useCustomTokens(): TokenList {
  return useAppSelector((state) => keyBy(state.tokenLists.customTokens.tokens, 'address'));
}

export function useIsLoadingAggregatorTokenLists() {
  const aggregatorTokenLists = useSavedAggregatorTokenLists();
  const tokenLists = useTokensLists();

  return React.useMemo(
    () => some(aggregatorTokenLists, (list) => !tokenLists[list].hasLoaded),
    [aggregatorTokenLists, tokenLists]
  );
}
