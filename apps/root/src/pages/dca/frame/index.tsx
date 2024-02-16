import React from 'react';
import { Grid } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCurrentRoute } from '@state/tabs/hooks';
import { useParams } from 'react-router-dom';
import { DEFAULT_NETWORK_FOR_VERSION, POSITION_VERSION_4, SUPPORTED_NETWORKS_DCA } from '@constants';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useAppDispatch } from '@state/hooks';
import { setDCAChainId } from '@state/create-position/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useSdkMappedChains from '@hooks/useMappedSdkChains';
import { fetchGraphTokenList } from '@state/token-lists/actions';
import { identifyNetwork } from '@common/utils/parsing';
import CreatePosition from '../create-position';
import Positions from '../positions';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import useHasFetchedPairs from '@hooks/useHasFetchedPairs';

interface DcaFrameProps {
  isLoading: boolean;
}

const DcaFrame = ({ isLoading }: DcaFrameProps) => {
  const currentNetwork = useCurrentNetwork();
  const currentRoute = useCurrentRoute();
  const { chainId } = useParams<{ chainId: string }>();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const trackEvent = useTrackEvent();
  const hasLoadedPairs = useHasFetchedPairs();
  const sdkMappedNetworks = useSdkMappedChains();

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
    void dispatch(fetchGraphTokenList());
  }, []);

  React.useEffect(() => {
    const networkToSet = identifyNetwork(sdkMappedNetworks, chainId);

    if (networkToSet && SUPPORTED_NETWORKS_DCA.includes(networkToSet.chainId)) {
      dispatch(setDCAChainId(networkToSet.chainId));
    } else if (SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
      dispatch(setDCAChainId(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId));
    }
  }, []);

  const handleChangeNetwork = React.useCallback(
    (newChainId: number) => {
      if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
        replaceHistory(`/create/${newChainId}`);
        dispatch(setDCAChainId(newChainId));
      }
    },
    [replaceHistory, dispatch]
  );

  const isLoadingIntervals = isLoading || !hasLoadedPairs;

  return (
    <Grid container spacing={3}>
      {isLoadingIntervals ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <>
          {currentRoute === DCA_CREATE_ROUTE.key ? (
            <Grid item xs={12} style={{ display: 'flex' }}>
              <CreatePosition handleChangeNetwork={handleChangeNetwork} />
            </Grid>
          ) : (
            <Grid item xs={12} style={{ display: 'flex' }}>
              <Positions />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};
export default DcaFrame;
