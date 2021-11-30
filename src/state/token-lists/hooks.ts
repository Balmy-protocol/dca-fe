import { useAppSelector } from 'hooks/state';

// returns all the transactions for the current chain
export function useSavedTokenLists() {
  const tokenList = useAppSelector((state) => state.tokenLists.activeLists);

  return tokenList;
}

export function useTokensLists() {
  return useAppSelector((state) => state.tokenLists.byUrl);
}
