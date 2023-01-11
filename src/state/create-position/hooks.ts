import { NETWORKS } from 'config';
import find from 'lodash/find';
import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function useCreatePositionState() {
  return useAppSelector((state: RootState) => state.createPosition);
}

export function useDCANetwork() {
  const chainId = useAppSelector((state: RootState) => state.createPosition.chainId);

  return find(NETWORKS, { chainId });
}
