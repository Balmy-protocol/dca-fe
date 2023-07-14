import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import { MEAN_PERMIT_2_ADDRESS } from '@constants';
import useWeb3Service from './useWeb3Service';

function useIsPermit2Enabled(chainId: number): boolean {
  const web3Service = useWeb3Service();
  const { isPermit2Enabled } = useAggregatorSettingsState();

  return web3Service.getSignSupport() && isPermit2Enabled && !!MEAN_PERMIT_2_ADDRESS[chainId];
}

export default useIsPermit2Enabled;
