import React from 'react';
import { useAppSelector } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { RootState } from '../index';
import useEnsAddress from '@hooks/useEnsAddress';

export function useTransferState() {
  const transferState = useAppSelector((state: RootState) => state.transfer);
  const { ensAddress } = useEnsAddress(transferState.recipient);

  return React.useMemo(
    () => ({
      ...transferState,
      recipientAddress: ensAddress || transferState.recipient,
    }),
    [transferState, ensAddress]
  );
}

export function useTransferNetwork() {
  const chainId = useAppSelector((state: RootState) => state.transfer.network);

  return find(NETWORKS, { chainId });
}
