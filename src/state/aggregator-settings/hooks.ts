import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useAggregatorSettingsState() {
  return useAppSelector((state: RootState) => state.aggregatorSettings);
}
