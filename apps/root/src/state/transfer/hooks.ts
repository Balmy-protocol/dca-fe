import { useAppSelector } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { RootState } from '../index';

export function useTransferState() {
  return useAppSelector((state: RootState) => state.transfer);
}

export function useTransferNetwork() {
  const chainId = useAppSelector((state: RootState) => state.transfer.network);

  return find(NETWORKS, { chainId });
}
