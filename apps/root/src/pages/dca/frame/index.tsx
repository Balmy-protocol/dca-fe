import React from 'react';
import {
  colors,
  ContainerBox,
  StyledFormContainer,
  StyledNonFormContainer,
  StyledPageTitleDescription,
  Typography,
} from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { useCurrentRoute } from '@state/tabs/hooks';
import useAnalytics from '@hooks/useAnalytics';
import CreatePosition from '../create-position';
import Positions from '../positions';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import useHasFetchedPairs from '@hooks/useHasFetchedPairs';
import DcaFAQ from '../components/faq';
import useUserHasPositions from '@hooks/useUserHasPositions';
import usePositionService from '@hooks/usePositionService';
import useUser from '@hooks/useUser';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import { FormattedMessage } from 'react-intl';

interface DcaFrameProps {}

const DcaFrame = ({}: DcaFrameProps) => {
  const currentRoute = useCurrentRoute();
  const { trackEvent } = useAnalytics();
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
        <ContainerBox flexDirection="column" gap={20}>
          <ContainerBox flexDirection="column" gap={6}>
            <ContainerBox flexDirection="column" gap={2}>
              <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage defaultMessage="Recurring Investments" description="dca.title" />
              </Typography>
              <StyledPageTitleDescription>
                <FormattedMessage
                  defaultMessage="Automate your investments with recurring buys"
                  description="dca.title-description"
                />
              </StyledPageTitleDescription>
            </ContainerBox>
            {isCreate ? <CreatePosition /> : <Positions />}
          </ContainerBox>
          <DcaFAQ />
        </ContainerBox>
      )}
    </Container>
  );
};
export default DcaFrame;
