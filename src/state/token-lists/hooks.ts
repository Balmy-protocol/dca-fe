import { useCallback, useMemo } from 'react';

import { useAppSelector } from 'hooks/state';

// returns all the transactions for the current chain
export function useTokenLists() {
  const state = useAppSelector((state) => state.tokenLists);

  return state;
}
