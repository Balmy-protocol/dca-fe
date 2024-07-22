import React from 'react';
import NetWorthNumber from '@common/components/networth-number';
import useUserStrategiesFinancial from '@hooks/earn/useUserStrategiesFinancial';
import { DisplayStrategy } from 'common-types';
import { ContainerBox, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

interface FinancialOverviewProps {
  strategy: DisplayStrategy;
}

const StyledOverviewItem = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 0.5 })``;

const FinancialOverview = ({ strategy }: FinancialOverviewProps) => {
  const { totalInvestedUsd, currentProfitUsd, currentProfitRate } = useUserStrategiesFinancial(strategy.userPositions);

  const dailyEarningsUsd = (totalInvestedUsd * strategy.farm.apy) / 365;

  return (
    <ContainerBox justifyContent="space-between">
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Total Invested"
            description="strategy-detail.vault-investment-data.total-invested"
          />
        </Typography>
        <NetWorthNumber value={totalInvestedUsd} variant="h5Bold" />
      </StyledOverviewItem>
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Daily Earnings"
            description="strategy-detail.vault-investment-data.daily-earnings"
          />
        </Typography>
        <NetWorthNumber value={dailyEarningsUsd} variant="h5Bold" />
      </StyledOverviewItem>
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Current Profit"
            description="strategy-detail.vault-investment-data.current-profit"
          />
        </Typography>
        <ContainerBox gap={2}>
          <Typography variant="h5Bold">{`${currentProfitRate.toFixed(2)}% ·`}</Typography>
          <NetWorthNumber value={currentProfitUsd} variant="h5Bold" />
        </ContainerBox>
      </StyledOverviewItem>
    </ContainerBox>
  );
};

export default FinancialOverview;
