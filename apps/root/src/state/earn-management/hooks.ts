import { NETWORKS } from '@constants';
import find from 'lodash/find';
import { useAppSelector } from '@state/hooks';
import { RootState } from '../index';

export function useEarnManagementState() {
  return useAppSelector((state: RootState) => state.earnManagement);
}

export function useEarnManagementNetwork() {
  const chainId = useAppSelector((state: RootState) => state.earnManagement.chainId);

  return find(NETWORKS, { chainId });
}
