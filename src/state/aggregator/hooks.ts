import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useAggregatorState() {
  return useAppSelector((state: RootState) => state.aggregator);
}
