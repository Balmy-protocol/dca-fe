import React from 'react';
import { ContainerBox, StyledFormContainer, StyledNonFormContainer } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCurrentRoute } from '@state/tabs/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
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
  const currentRoute = useCurrentRoute();
  const trackEvent = useTrackEvent();
  const hasLoadedPairs = useHasFetchedPairs();
  const positionService = usePositionService();
  const user = useUser();
  const { hasFetchedUserHasPositions, userHasPositions } = useUserHasPositions();
  const isLoggingUser = useIsLoggingUser();

  React.useEffect(() => {
    trackEvent('DCA - Visit create page');
  }, []);

  React.useEffect(() => {
    if (!hasFetchedUserHasPositions && !isLoggingUser) {
      void positionService.fetchUserHasPositions();
    }
  }, [user, hasFetchedUserHasPositions, isLoggingUser]);

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
            {isCreate ? <CreatePosition /> : <Positions />}
          </ContainerBox>
          <DcaFAQ />
        </ContainerBox>
      )}
    </Container>
  );
};
export default DcaFrame;
