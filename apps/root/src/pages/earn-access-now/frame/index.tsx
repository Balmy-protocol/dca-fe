import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  ContainerBox,
  DividerBorder1,
  Grid,
  StyledNonFormContainer,
  StyledPageTitleDescription,
  Typography,
} from 'ui-library';
import ElegibilityCriteria from '../components/elegibility-criteria';
import ClaimCodeForm from '../components/claim-code-form';
import AboutEarnGuardian from '../components/about-earn-guardian';
import EarnEarlyAccessFAQ from '../faq';

const StyledTitleSpan = styled('span')`
  background: linear-gradient(90deg, #791aff 24.91%, #4a00b2 86.35%);
  background-clip: text;
  color: transparent;
`;

const EarnAccessNowFrame = () => {
  return (
    <StyledNonFormContainer>
      <ContainerBox flexDirection="column" gap={20}>
        <ContainerBox flexDirection="column" gap={12}>
          <ContainerBox flexDirection="column" gap={3} alignItems="center">
            <ContainerBox flexDirection="column">
              <Typography variant="h1Bold" textAlign="center">
                <FormattedMessage description="earn-access-now.title" defaultMessage="Check Your Eligibility" />{' '}
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
          <Grid container spacing={8}>
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <ElegibilityCriteria />
            </Grid>
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <ClaimCodeForm />
            </Grid>
          </Grid>
        </ContainerBox>
        <AboutEarnGuardian />
        <DividerBorder1 />
        <EarnEarlyAccessFAQ />
      </ContainerBox>
    </StyledNonFormContainer>
  );
};

export default EarnAccessNowFrame;
