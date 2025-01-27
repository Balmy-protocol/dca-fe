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
  showLastMonth?: boolean;
  sumRewards?: boolean;
}

const StyledOverviewItem = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 1 })``;

const FinancialOverview = ({
  userPositions,
  size = 'medium',
  isLoading,
  isFiat = true,
  showLastMonth,
  sumRewards = false,
}: FinancialOverviewProps) => {
  const {
    currentProfitUsd,
    currentProfitRate,
    totalInvested,
    currentProfit,
    totalInvestedUsd,
    totalMonthlyEarnings,
    monthlyEarnings,
  } = React.useMemo(() => parseUserStrategiesFinancialData(userPositions), [userPositions]);

  const intl = useIntl();

  const isPortfolioEmpty = userPositions?.length === 0;

  const mainAsset = userPositions?.[0]?.strategy?.asset;

  let amountInvested;
  let amountProfit;
  let lastMonthEarnings;

  if (isFiat) {
    amountInvested = {
      amount: parseUnits(totalInvestedUsd.toString(), 2),
      amountInUnits: totalInvestedUsd.toFixed(2),
      amountInUSD: totalInvestedUsd.toFixed(2),
    };
    amountProfit = {
      amount: sumRewards
        ? parseUnits(currentProfitUsd.total.toString(), 2)
        : parseUnits(currentProfitUsd.asset.toString(), 2),
      amountInUnits: sumRewards ? currentProfitUsd.total.toFixed(2) : currentProfitUsd.asset.toFixed(2),
      amountInUSD: sumRewards ? currentProfitUsd.total.toFixed(2) : currentProfitUsd.asset.toFixed(2),
    };
    lastMonthEarnings = {
      amount: parseUnits(totalMonthlyEarnings.toString(), 2),
      amountInUnits: totalMonthlyEarnings.toFixed(2),
      amountInUSD: totalMonthlyEarnings.toFixed(2),
    };
  } else {
    amountInvested = sumRewards
      ? {
          amount: parseUnits(totalInvestedUsd.toString(), 2),
          amountInUnits: totalInvestedUsd.toFixed(2),
          amountInUSD: totalInvestedUsd.toFixed(2),
        }
      : (mainAsset && totalInvested[mainAsset.address]) || undefined;
    amountProfit = sumRewards
      ? {
          amount: parseUnits(currentProfitUsd.total.toString(), 2),
          amountInUnits: currentProfitUsd.total.toFixed(2),
          amountInUSD: currentProfitUsd.total.toFixed(2),
        }
      : (mainAsset && currentProfit[mainAsset.address]) || undefined;
    lastMonthEarnings = sumRewards
      ? {
          amount: parseUnits(totalMonthlyEarnings.toString(), 2),
          amountInUnits: totalMonthlyEarnings.toFixed(2),
          amountInUSD: totalMonthlyEarnings.toFixed(2),
        }
      : (mainAsset && monthlyEarnings[mainAsset.address]) || undefined;
  }

  const profitSubtitle = sumRewards
    ? `+${currentProfitRate.total.toFixed(2)}% · (${formatUsdAmount({
        amount: currentProfitUsd.total,
        intl,
      })})`
    : `+${currentProfitRate.asset.toFixed(2)}% · (${formatUsdAmount({
        amount: currentProfitUsd.asset,
        intl,
      })})`;

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
          overrideSubtitle={profitSubtitle}
          subtitleColorVariant={isPortfolioEmpty ? 'typo4' : 'success.dark'}
          titlePrefix="+"
          showIcon={!isFiat}
          showSymbol={!isFiat}
          showSubtitle={!isFiat}
          useNetworthNumber={isFiat}
        />
      </StyledOverviewItem>
      {showLastMonth && (
        <StyledOverviewItem>
          <ContainerBox gap={1} alignItems="center">
            <Typography variant="bodySmallRegular">
              <FormattedMessage
                defaultMessage="Last Month 🔥"
                description="strategy-detail.vault-investment-data.last-month"
              />
            </Typography>
            <Tooltip
              title={
                <FormattedMessage
                  description="strategy-detail.vault-investment-data.last-month-tooltip"
                  defaultMessage="Earning since last month"
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
            amount={lastMonthEarnings}
            amountTypographyVariant={size === 'medium' ? 'h3Bold' : 'bodyBold'}
            isLoading={isLoading}
            amountColorVariant={isPortfolioEmpty ? 'typo4' : undefined}
            subtitleColorVariant={isPortfolioEmpty ? 'typo4' : 'success.dark'}
            titlePrefix="+"
            showIcon={!isFiat}
            showSymbol={!isFiat}
            showSubtitle={!isFiat}
            useNetworthNumber={isFiat}
          />
        </StyledOverviewItem>
      )}
    </ContainerBox>
  );
};

export default FinancialOverview;
