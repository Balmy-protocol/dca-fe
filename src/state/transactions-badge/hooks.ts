import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useBadgeNumber(chainId: number): number {
  return useAppSelector((state: RootState) => (state.badge[chainId] && state.badge[chainId].viewedTransactions) || 0);
}
