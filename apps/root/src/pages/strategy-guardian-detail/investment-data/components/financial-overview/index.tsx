import React from 'react';
import NetWorthNumber from '@common/components/networth-number';
import { EarnPosition } from 'common-types';
import { colors, ContainerBox, InfoCircleIcon, Tooltip, Typography } from 'ui-library';
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

  const isPortfolioEmpty = userPositions?.length === 0;

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
          variant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
          colorVariant={isPortfolioEmpty ? 'typo4' : undefined}
        />
      </StyledOverviewItem>
      <StyledOverviewItem>
        <ContainerBox gap={1} alignItems="center">
          <Typography variant="bodySmallRegular">
            <FormattedMessage
              defaultMessage="Total Returns"
              description="strategy-detail.vault-investment-data.current-profit"
            />
          </Typography>
          <Tooltip
            title={
              <FormattedMessage
                description="strategy-detail.vault-investment-data.current-profit-tooltip"
                defaultMessage="Total returns are calculated based on the current value of your assets minus the total invested amount"
              />
            }
          >
            <ContainerBox>
              <InfoCircleIcon
                fontSize="small"
                sx={({ palette }) => ({ color: colors[palette.mode].typography.typo4 })}
              />
            </ContainerBox>
          </Tooltip>
        </ContainerBox>
        <ContainerBox alignItems="center" gap={1}>
          {!isLoading && (
            <Typography
              variant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
              sx={({ palette }) => ({
                color: isPortfolioEmpty ? colors[palette.mode].typography.typo4 : undefined,
              })}
            >{`+${currentProfitRate.toFixed(2)}% · `}</Typography>
          )}
          <NetWorthNumber
            value={currentProfitUsd}
            isLoading={isLoading}
            variant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
            colorVariant={isPortfolioEmpty ? 'typo4' : undefined}
          />
        </ContainerBox>
      </StyledOverviewItem>
    </ContainerBox>
  );
};

export default FinancialOverview;
