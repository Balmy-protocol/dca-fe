import { useAppSelector } from '@hooks/state';
import keyBy from 'lodash/keyBy';
import React from 'react';
import some from 'lodash/some';
import { TokenList, TokensLists } from '@types';
import { Selector, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@state';

export function useSavedTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeLists);
}

export function useSavedAggregatorTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeAggregatorLists);
}

const tokenListSelector: Selector<RootState, { [tokenListUrl: string]: TokensLists }> = (state) =>
  state.tokenLists.byUrl;
const customTokensListSelector: Selector<RootState, TokensLists> = (state) => state.tokenLists.customTokens;
const selectTokenList = createSelector<
  [typeof tokenListSelector, typeof customTokensListSelector],
  { [tokenListUrl: string]: TokensLists }
>([tokenListSelector, customTokensListSelector], (selectedLists, selectedCustomTokens) => ({
  ...selectedLists,
  'custom-tokens': selectedCustomTokens,
}));

export function useTokensLists(): { [tokenListUrl: string]: TokensLists } {
  return useAppSelector((state) => selectTokenList(state));
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
