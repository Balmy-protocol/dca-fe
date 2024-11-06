import React from 'react';
import { EarnPosition } from 'common-types';
import { colors, ContainerBox, InfoCircleIcon, Tooltip, Typography } from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import TokenAmount from '@common/components/token-amount';
import { emptyTokenWithDecimals, formatUsdAmount } from '@common/utils/currency';
import { parseUnits } from 'viem';

interface FinancialOverviewProps {
  userPositions?: EarnPosition[];
  size?: 'medium' | 'small';
  isLoading?: boolean;
  isFiat?: boolean;
}

const StyledOverviewItem = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 1 })``;

const FinancialOverview = ({ userPositions, size = 'medium', isLoading, isFiat = true }: FinancialOverviewProps) => {
  const { currentProfitUsd, currentProfitRate, totalInvested, currentProfit, totalInvestedUsd } = React.useMemo(
    () => parseUserStrategiesFinancialData(userPositions),
    [userPositions]
  );

  const intl = useIntl();

  const isPortfolioEmpty = userPositions?.length === 0;

  const mainAsset = userPositions?.[0]?.strategy?.asset;

  let amountInvested;
  let amountProfit;

  if (isFiat) {
    amountInvested = {
      amount: parseUnits(totalInvestedUsd.toString(), 2),
      amountInUnits: totalInvestedUsd.toFixed(2),
      amountInUSD: totalInvestedUsd.toFixed(2),
    };
    amountProfit = {
      amount: parseUnits(currentProfitUsd.toString(), 2),
      amountInUnits: currentProfitUsd.toFixed(2),
      amountInUSD: currentProfitUsd.toFixed(2),
    };
  } else {
    amountInvested = (mainAsset && totalInvested[mainAsset.address]) || undefined;
    amountProfit = (mainAsset && currentProfit[mainAsset.address]) || undefined;
  }

  return (
    <ContainerBox gap={size === 'medium' ? 14 : 6}>
      <StyledOverviewItem>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="Total Invested"
            description="strategy-detail.vault-investment-data.total-invested"
          />
        </Typography>
        <TokenAmount
          token={isFiat ? emptyTokenWithDecimals(2) : mainAsset}
          amount={amountInvested}
          amountTypographyVariant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
          isLoading={isLoading}
          amountColorVariant={isPortfolioEmpty ? 'typo4' : undefined}
          addEqualIcon
          showIcon={!isFiat}
          showSymbol={!isFiat}
          showSubtitle={!isFiat}
          useNetworthNumber={isFiat}
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
        <TokenAmount
          token={isFiat ? emptyTokenWithDecimals(2) : mainAsset}
          amount={amountProfit}
          amountTypographyVariant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
          isLoading={isLoading}
          amountColorVariant={isPortfolioEmpty ? 'typo4' : undefined}
          overrideSubtitle={`+${currentProfitRate.toFixed(2)}% · (${formatUsdAmount({ amount: currentProfitUsd, intl })})`}
          subtitleColorVariant={isPortfolioEmpty ? 'typo4' : 'success.dark'}
          titlePrefix="+"
          showIcon={!isFiat}
          showSymbol={!isFiat}
          showSubtitle={!isFiat}
          useNetworthNumber={isFiat}
        />
      </StyledOverviewItem>
    </ContainerBox>
  );
};

export default FinancialOverview;
