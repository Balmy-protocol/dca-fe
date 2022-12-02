import { useAppSelector } from 'hooks/state';
import React from 'react';
import some from 'lodash/some';

export function useSavedTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeLists);
}

export function useSavedAggregatorTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeAggregatorLists);
}

export function useTokensLists() {
  return useAppSelector((state) => state.tokenLists.byUrl);
}

export function useIsLoadingAggregatorTokenLists() {
  const aggregatorTokenLists = useSavedAggregatorTokenLists();
  const tokenLists = useTokensLists();

  return React.useMemo(
    () => some(aggregatorTokenLists, (list) => !tokenLists[list].hasLoaded),
    [aggregatorTokenLists, tokenLists]
  );
}
