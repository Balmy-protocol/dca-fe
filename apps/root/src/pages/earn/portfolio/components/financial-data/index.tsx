import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import FinancialOverview from '@pages/strategy-guardian-detail/investment-data/components/financial-overview';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, colors, ContainerBox, Typography } from 'ui-library';
import EarnPositionTvlGraph from '../tvl-graph';
import { EarnPosition } from 'common-types';
import { useShowBalances } from '@state/config/hooks';

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(10)};
  `}
`;

const StyledFinancialNumbersContainer = styled(ContainerBox).attrs({ gap: 20 })`
  ${({ theme: { breakpoints, spacing } }) => `
  ${breakpoints.down('md')} {
    gap: ${spacing(6)};
    flex-direction: column;
  }
`}
`;

const EarnPortfolioFinancialData = ({
  userStrategies,
  isLoading,
}: {
  userStrategies: EarnPosition[];
  isLoading: boolean;
}) => {
  const showBalances = useShowBalances();

  return (
    <StyledPaper>
      <StyledFinancialNumbersContainer>
        <ContainerBox gap={3} flexDirection="column">
          <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              description="earn.portfolio.financial-data.total-value.title"
              defaultMessage="Investment & Earnings Summary"
            />
          </Typography>
          <FinancialOverview userPositions={userStrategies} isLoading={isLoading} size="small" isFiat />
        </ContainerBox>
        <ContainerBox gap={3} flexDirection="column">
          <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              description="earn.portfolio.financial-data.expected-returns.title"
              defaultMessage="Expected Returns"
            />
          </Typography>
          <ExpectedReturns userPositions={userStrategies} isLoading={isLoading} isFiat />
        </ContainerBox>
      </StyledFinancialNumbersContainer>
      {userStrategies.length !== 0 && showBalances && (
        <EarnPositionTvlGraph isLoading={isLoading} userStrategies={userStrategies} showDots={false}/>
      )}
    </StyledPaper>
  );
};

export default EarnPortfolioFinancialData;
