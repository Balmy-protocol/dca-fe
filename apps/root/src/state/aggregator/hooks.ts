import { useAppSelector } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { RootState } from '../index';

export function useAggregatorState() {
  return useAppSelector((state: RootState) => state.aggregator);
}

export function useAggregatorNetwork() {
  const chainId = useAppSelector((state: RootState) => state.aggregator.network);

  return find(NETWORKS, { chainId });
}
