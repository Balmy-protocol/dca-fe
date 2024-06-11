import React from 'react';
import { ContainerBox, StyledFormContainer, StyledNonFormContainer } from 'ui-library';
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
import { identifyNetwork } from '@common/utils/parsing';
import CreatePosition from '../create-position';
import Positions from '../positions';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import useHasFetchedPairs from '@hooks/useHasFetchedPairs';
import NetWorth from '@common/components/net-worth';
import DcaFAQ from '../components/faq';
import useUserHasPositions from '@hooks/useUserHasPositions';
import usePositionService from '@hooks/usePositionService';
import useUser from '@hooks/useUser';
import useIsLoggingUser from '@hooks/useIsLoggingUser';

interface DcaFrameProps {}

const DcaFrame = ({}: DcaFrameProps) => {
  const currentNetwork = useCurrentNetwork();
  const currentRoute = useCurrentRoute();
  const { chainId } = useParams<{ chainId: string }>();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const trackEvent = useTrackEvent();
  const hasLoadedPairs = useHasFetchedPairs();
  const sdkMappedNetworks = useSdkMappedChains();
  const positionService = usePositionService();
  const user = useUser();
  const { hasFetchedUserHasPositions, userHasPositions } = useUserHasPositions();
  const isLoggingUser = useIsLoggingUser();

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
  }, []);

  React.useEffect(() => {
    const networkToSet = identifyNetwork(sdkMappedNetworks, chainId);

    if (networkToSet && SUPPORTED_NETWORKS_DCA.includes(networkToSet.chainId)) {
      dispatch(setDCAChainId(networkToSet.chainId));
    } else if (SUPPORTED_NETWORKS_DCA.includes(currentNetwork.chainId)) {
      dispatch(setDCAChainId(DEFAULT_NETWORK_FOR_VERSION[POSITION_VERSION_4].chainId));
    }
  }, []);

  React.useEffect(() => {
    if (!hasFetchedUserHasPositions && !isLoggingUser) {
      void positionService.fetchUserHasPositions();
    }
  }, [user, hasFetchedUserHasPositions, isLoggingUser]);

  const handleChangeNetwork = React.useCallback(
    (newChainId: number) => {
      if (SUPPORTED_NETWORKS_DCA.includes(newChainId)) {
        replaceHistory(`/create/${newChainId}`);
        dispatch(setDCAChainId(newChainId));
        trackEvent('Create position - Change network', { newChainId });
      }
    },
    [replaceHistory, dispatch]
  );

  const isLoadingIntervals = !hasLoadedPairs || !hasFetchedUserHasPositions || isLoggingUser;

  const isCreate = currentRoute === DCA_CREATE_ROUTE.key || !userHasPositions;
  const Container = isCreate ? StyledFormContainer : StyledNonFormContainer;

  return (
    <Container flexDirection="column" flexWrap="nowrap">
      {isLoadingIntervals ? (
        <CenteredLoadingIndicator size={70} />
      ) : (
        <ContainerBox flexDirection="column" gap={32}>
          <ContainerBox flexDirection="column" gap={6}>
            <NetWorth walletSelector={{ options: { setSelectionAsActive: true } }} />
            {isCreate ? <CreatePosition handleChangeNetwork={handleChangeNetwork} /> : <Positions />}
          </ContainerBox>
          <DcaFAQ />
        </ContainerBox>
      )}
    </Container>
  );
};
export default DcaFrame;
