import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useStoredBalances() {
  return useAppSelector((state: RootState) => state.balances);
}
