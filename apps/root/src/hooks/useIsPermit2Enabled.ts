import React from 'react';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { MEAN_PERMIT_2_ADDRESS } from '@constants';
import useWeb3Service from './useWeb3Service';

function useIsPermit2Enabled(chainId: number): boolean {
  const web3Service = useWeb3Service();
  const { isPermit2Enabled } = useAggregatorSettingsState();
  const hasSignSupport = web3Service.getSignSupport();

  return React.useMemo(
    () => hasSignSupport && isPermit2Enabled && !!MEAN_PERMIT_2_ADDRESS[chainId],
    [chainId, isPermit2Enabled, hasSignSupport]
  );
}

export default useIsPermit2Enabled;
