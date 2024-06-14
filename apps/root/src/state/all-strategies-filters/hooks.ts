import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useAllStrategiesFilters() {
  return useAppSelector((state: RootState) => state.allStrategiesFilters);
}
