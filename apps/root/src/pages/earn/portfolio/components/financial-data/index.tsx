import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import FinancialOverview from '@pages/strategy-guardian-detail/investment-data/components/financial-overview';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, colors, ContainerBox, Typography } from 'ui-library';
import EarnPositionTvlGraph from '../tvl-graph';
import { EarnPosition } from 'common-types';

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(10)};
  `}
`;

interface EarnPortfolioFinancialDataProps {
  userStrategies: EarnPosition[];
  isLoading: boolean;
}

const EarnPortfolioFinancialData = ({ userStrategies, isLoading }: EarnPortfolioFinancialDataProps) => {
  return (
    <StyledPaper>
      <ContainerBox gap={20}>
        <ContainerBox gap={3} flexDirection="column">
          <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              description="earn.portfolio.financial-data.total-value.title"
              defaultMessage="Total Value"
            />
          </Typography>
          <FinancialOverview userPositions={userStrategies} isLoading={isLoading} size="small" />
        </ContainerBox>
        <ContainerBox gap={3} flexDirection="column">
          <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              description="earn.portfolio.financial-data.expected-returns.title"
              defaultMessage="Expected returns"
            />
          </Typography>
          <ExpectedReturns userPositions={userStrategies} isLoading={isLoading} size="small" />
        </ContainerBox>
      </ContainerBox>
      <EarnPositionTvlGraph />
    </StyledPaper>
  );
};

export default EarnPortfolioFinancialData;
