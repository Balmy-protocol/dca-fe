import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useBadgeNumber(): number {
  return useAppSelector((state: RootState) => state.badge.viewedTransactions || 0);
}
