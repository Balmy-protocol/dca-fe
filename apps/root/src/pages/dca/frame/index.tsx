import React from 'react';
import { Grid } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCurrentRoute } from '@state/tabs/hooks';
import { useParams } from 'react-router-dom';
import { DEFAULT_NETWORK_FOR_VERSION, FAIL_ON_ERROR, POSITION_VERSION_4, SUPPORTED_NETWORKS_DCA } from '@constants';
import { GetSwapIntervalsGraphqlResponse } from '@types';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useQuery } from '@apollo/client';
import getAvailableIntervals from '@graphql/getAvailableIntervals.graphql';
import useDCAGraphql from '@hooks/useDCAGraphql';
import usePairService from '@hooks/usePairService';
import { useAppDispatch } from '@state/hooks';
import { setDCAChainId } from '@state/create-position/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import useErrorService from '@hooks/useErrorService';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useSdkMappedChains from '@hooks/useMappedSdkChains';
import { fetchGraphTokenList } from '@state/token-lists/actions';
import { identifyNetwork } from '@common/utils/parsing';
import CreatePosition from '../create-position';
import Positions from '../positions';
import { DCA_CREATE_ROUTE } from '@constants/routes';

interface DcaFrameProps {
  isLoading: boolean;
}

const DcaFrame = ({ isLoading }: DcaFrameProps) => {
  const currentNetwork = useCurrentNetwork();
  const currentRoute = useCurrentRoute();
  const { chainId } = useParams<{ chainId: string }>();
  const client = useDCAGraphql();
  const pairService = usePairService();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const errorService = useErrorService();
  const trackEvent = useTrackEvent();
  const [hasLoadedPairs, setHasLoadedPairs] = React.useState(pairService.getHasFetchedAvailablePairs());
  const selectedNetwork = useSelectedNetwork();
  const sdkMappedNetworks = useSdkMappedChains();

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
  }, []);

  React.useEffect(() => {
    const networkToSet = identifyNetwork(sdkMappedNetworks, chainId);

    if (networkToSet && SUPPORTED_NETWORKS_DCA.includes(networkToSet.chainId)) {
      dispatch(setDCAChainId(networkToSet.chainId));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchGraphTokenList(networkToSet.chainId));
    } else if (SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
      dispatch(setDCAChainId(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchGraphTokenList(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId));
    }
  }, []);

  React.useEffect(() => {
    const networkToUse = identifyNetwork(sdkMappedNetworks, chainId);

    const fetchPairs = async () => {
      try {
        await pairService.fetchAvailablePairs(networkToUse?.chainId || selectedNetwork.chainId);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        errorService.logError('Error fetching pairs', JSON.stringify(e), {});
      }
      setHasLoadedPairs(true);
    };

    if (!isLoading && !hasLoadedPairs) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPairs();
    }
  }, [isLoading, hasLoadedPairs]);

  const handleChangeNetwork = React.useCallback(
    (newChainId: number) => {
      if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
        replaceHistory(`/create/${newChainId}`);
        dispatch(setDCAChainId(newChainId));
        setHasLoadedPairs(false);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(fetchGraphTokenList(newChainId));
      }
    },
    [replaceHistory, dispatch]
  );

  const { loading: isLoadingSwapIntervals, data: swapIntervalsData } = useQuery<GetSwapIntervalsGraphqlResponse>(
    getAvailableIntervals,
    {
      client,
      variables: {
        ...((!FAIL_ON_ERROR && { subgraphError: 'allow' }) || { subgraphError: 'deny' }),
      },
      errorPolicy: (!FAIL_ON_ERROR && 'ignore') || 'none',
    }
  );

  // TODO- Move this logic to swap container
  const isLoadingIntervals =
    isLoading || (isLoadingSwapIntervals && DCA_CREATE_ROUTE.key === currentRoute) || !hasLoadedPairs;

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
              <CreatePosition swapIntervalsData={swapIntervalsData} handleChangeNetwork={handleChangeNetwork} />
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
