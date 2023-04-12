import React from 'react';
import Grid from '@mui/material/Grid';
import find from 'lodash/find';
import CenteredLoadingIndicator from 'common/components/centered-loading-indicator';
import { useSubTab } from 'state/tabs/hooks';
import { useParams } from 'react-router-dom';
import {
  DEFAULT_NETWORK_FOR_VERSION,
  FAIL_ON_ERROR,
  POSITION_VERSION_4,
  SUPPORTED_NETWORKS_DCA,
  NETWORKS,
} from 'config/constants';
import { GetSwapIntervalsGraphqlResponse, NetworkStruct } from 'types';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useQuery } from '@apollo/client';
import getAvailableIntervals from 'graphql/getAvailableIntervals.graphql';
import { setNetwork } from 'state/config/actions';
import useDCAGraphql from 'hooks/useDCAGraphql';
import usePairService from 'hooks/usePairService';
import { useAppDispatch } from 'state/hooks';
import { setDCAChainId } from 'state/create-position/actions';
import useTrackEvent from 'hooks/useTrackEvent';
import useErrorService from 'hooks/useErrorService';
import useReplaceHistory from 'hooks/useReplaceHistory';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import useSdkMappedChains from 'hooks/useMappedSdkChains';
import useWalletService from 'hooks/useWalletService';
import useWeb3Service from 'hooks/useWeb3Service';
import { fetchGraphTokenList } from 'state/token-lists/actions';
import SwapContainer from '../swap-container';
import Positions from '../positions';

interface HomeFrameProps {
  isLoading: boolean;
}

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const tabIndex = useSubTab();
  const currentNetwork = useCurrentNetwork();
  const { chainId } = useParams<{ chainId: string }>();
  const client = useDCAGraphql();
  const pairService = usePairService();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const errorService = useErrorService();
  const trackEvent = useTrackEvent();
  const [hasLoadedPairs, setHasLoadedPairs] = React.useState(pairService.getHasFetchedAvailablePairs());
  const selectedNetwork = useSelectedNetwork();
  const sdkMappedNetworks = useSdkMappedChains();
  const web3Service = useWeb3Service();
  // const hasInitiallySetNetwork = React.useState()

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
  }, []);

  React.useEffect(() => {
    const chainIdToUse = Number(chainId);

    let networkToSet = find(sdkMappedNetworks, { chainId: chainIdToUse });
    if (!networkToSet && chainId) {
      networkToSet = find(sdkMappedNetworks, { name: chainId.toLowerCase() });
    }

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
    const fetchPairs = async () => {
      try {
        await pairService.fetchAvailablePairs(Number(chainId) || selectedNetwork.chainId);
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

  const handleChangeNetwork = (newChainId: number) => {
    if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetworkAutomatically(newChainId, () => {
        const networkToSet = find(NETWORKS, { chainId: newChainId });
        dispatch(setNetwork(networkToSet as NetworkStruct));
        if (networkToSet) {
          web3Service.setNetwork(networkToSet?.chainId);
        }
      });
      replaceHistory(`/create/${newChainId}`);
      dispatch(setDCAChainId(newChainId));
      setHasLoadedPairs(false);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(fetchGraphTokenList(newChainId));
    }
  };

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
  const isLoadingIntervals = isLoading || (isLoadingSwapIntervals && tabIndex === 0) || !hasLoadedPairs;

  return (
    <Grid container spacing={3}>
      {isLoadingIntervals ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <>
          {tabIndex === 0 ? (
            <Grid item xs={12} style={{ display: 'flex' }}>
              <SwapContainer swapIntervalsData={swapIntervalsData} handleChangeNetwork={handleChangeNetwork} />
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
export default HomeFrame;
