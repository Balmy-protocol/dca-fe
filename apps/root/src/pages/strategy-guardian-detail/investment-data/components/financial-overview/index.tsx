import React from 'react';
import NetWorthNumber from '@common/components/networth-number';
import { EarnPosition } from 'common-types';
import { ContainerBox, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';

interface FinancialOverviewProps {
  userPositions?: EarnPosition[];
  size?: 'medium' | 'small';
  isLoading?: boolean;
}

const StyledOverviewItem = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 1 })``;

const FinancialOverview = ({ userPositions, size = 'medium', isLoading }: FinancialOverviewProps) => {
  const { totalInvestedUsd, currentProfitUsd, currentProfitRate } = React.useMemo(
    () => parseUserStrategiesFinancialData(userPositions),
    [userPositions]
  );

  return (
    <ContainerBox gap={size === 'medium' ? 14 : 6}>
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Total Invested"
            description="strategy-detail.vault-investment-data.total-invested"
          />
        </Typography>
        <NetWorthNumber
          value={totalInvestedUsd}
          isLoading={isLoading}
          variant={size === 'medium' ? 'h5Bold' : 'bodyBold'}
        />
      </StyledOverviewItem>
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Current Profit"
            description="strategy-detail.vault-investment-data.current-profit"
          />
        </Typography>
        <ContainerBox gap={2}>
          {!isLoading && (
            <Typography
              variant={size === 'medium' ? 'h5Bold' : 'bodyBold'}
            >{`${currentProfitRate.toFixed(2)}% ·`}</Typography>
          )}
          <NetWorthNumber
            value={currentProfitUsd}
            isLoading={isLoading}
            variant={size === 'medium' ? 'h5Bold' : 'bodyBold'}
          />
        </ContainerBox>
      </StyledOverviewItem>
    </ContainerBox>
  );
};

export default FinancialOverview;
