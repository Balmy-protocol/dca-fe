import { useAppSelector } from 'hooks/state';

export function useSavedTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeLists);
}

export function useSavedAggregatorTokenLists() {
  return useAppSelector((state) => state.tokenLists.activeAggregatorLists);
}

export function useTokensLists() {
  return useAppSelector((state) => state.tokenLists.byUrl);
}
