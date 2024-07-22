import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';
import { StrategiesTableVariants } from './reducer';

export function useStrategiesFilters(variant: StrategiesTableVariants) {
  return useAppSelector((state: RootState) => state.strategiesFilters[variant]);
}
