import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ContainerBox, Grid, StyledNonFormContainer, StyledPageTitleDescription, Typography, Zoom } from 'ui-library';
import ElegibilityCriteria from '../components/elegibility-criteria';
import ClaimCodeForm from '../components/claim-code-form';
import AboutEarnGuardian from '../components/about-earn-guardian';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import useAnalytics from '@hooks/useAnalytics';
import { EARN_ACCESS_NOW_ROUTE } from '@constants/routes';
import ElegibilityConfirmation from '../components/elegibility-confirmation';

const StyledTitleSpan = styled('span')`
  background: linear-gradient(90deg, #791aff 24.91%, #4a00b2 86.35%);
  background-clip: text;
  color: transparent;
`;

const EarnAccessNowFrame = () => {
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const [isCheckingEligibility, setIsCheckingEligibility] = React.useState(false);

  React.useEffect(() => {
    dispatch(changeRoute(EARN_ACCESS_NOW_ROUTE.key));
    trackEvent('Earn - Visit earn access now page');
  }, []);

  return (
    <StyledNonFormContainer>
      <ContainerBox flexDirection="column" gap={20}>
        <ContainerBox flexDirection="column" gap={12}>
          <ContainerBox flexDirection="column" gap={3} alignItems="center">
            <ContainerBox flexDirection="column">
              <Typography variant="h1Bold" textAlign="center">
                <FormattedMessage description="earn-access-now.title" defaultMessage="Check Your Eligibility" />
              </Typography>
              <Typography variant="h1Bold" textAlign="center">
                <FormattedMessage description="earn-access-now.title.for" defaultMessage="for" />{' '}
                <StyledTitleSpan>
                  <FormattedMessage
                    description="earn-access-now.title.early-access"
                    defaultMessage="Earn Early Access"
                  />
                </StyledTitleSpan>
              </Typography>
            </ContainerBox>
            <StyledPageTitleDescription textAlign="center">
              <FormattedMessage
                description="earn-access-now.subtitle"
                defaultMessage="Find out if you meet the criteria to join Earn Early Access and explore our exclusive yield strategies."
              />
            </StyledPageTitleDescription>
          </ContainerBox>
          <Grid container spacing={6}>
            {isCheckingEligibility ? (
              <Zoom in mountOnEnter>
                <Grid item xs={12}>
                  <ElegibilityConfirmation />
                </Grid>
              </Zoom>
            ) : (
              <>
                <Grid item xs={12} md={7}>
                  <ClaimCodeForm />
                </Grid>
                <Grid item xs={12} md={5}>
                  <ElegibilityCriteria
                    setIsCheckingEligibility={setIsCheckingEligibility}
                    isCheckingEligibility={isCheckingEligibility}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </ContainerBox>
        <AboutEarnGuardian />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};

export default EarnAccessNowFrame;
