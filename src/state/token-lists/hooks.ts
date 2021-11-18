import { useAppSelector } from 'hooks/state';

// returns all the transactions for the current chain
export function useSavedTokenLists() {
  const tokenList = useAppSelector((state) => state.tokenLists);

  return tokenList;
}
