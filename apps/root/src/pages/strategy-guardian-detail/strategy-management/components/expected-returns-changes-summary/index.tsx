import NetWorthNumber from '@common/components/networth-number';
import { createEmptyEarnPosition } from '@common/mocks/earn';
import { parseUsdPrice, parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import {
  parseUserStrategiesFinancialData,
  STRATEGY_RETURN_PERIODS,
  StrategyReturnPeriods,
} from '@common/utils/earn/parsing';
import useActiveWallet from '@hooks/useActiveWallet';
import { DisplayStrategy } from 'common-types';
import React from 'react';
import { defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { ArrowRightIcon, colors, ContainerBox, Typography } from 'ui-library';
import { formatUnits, parseUnits } from 'viem';

const StyledCurrentValueBold = styled(Typography).attrs({ variant: 'bodyBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo5}
    `}
`;

const StyledArrowIcon = styled(ArrowRightIcon)`
  transform: rotate(90deg);
  font-size: ${({ theme }) => theme.spacing(4)};
`;

export enum EarnOperationVariant {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

interface ExpectedReturnsChangesSummaryProps {
  hidePeriods?: StrategyReturnPeriods[];
  size?: 'medium' | 'small';
  isLoading?: boolean;
  strategy?: DisplayStrategy;
  assetAmount?: string;
  operation: EarnOperationVariant;
  includeSummaryItem?: boolean;
}

const SummaryItem = ({
  currentValue,
  updatedValue,
  isLoading,
  hasOriginalValue,
  hasNewValues,
  title,
  gap,
}: {
  currentValue: number;
  updatedValue: number;
  isLoading?: boolean;
  hasOriginalValue: boolean;
  hasNewValues: boolean;
  title: string;
  gap: number;
}) => (
  <ContainerBox flexDirection="column" gap={gap}>
    <Typography variant="bodySmallRegular">{title}</Typography>
    {currentValue === updatedValue ? (
      <StyledCurrentValueBold>-</StyledCurrentValueBold>
    ) : (
      <NetWorthNumber
        value={hasOriginalValue ? currentValue : updatedValue}
        isLoading={isLoading}
        variant={hasOriginalValue && hasNewValues ? 'bodyRegular' : 'bodyBold'}
      />
    )}
    {currentValue !== updatedValue && hasOriginalValue && hasNewValues && (
      <>
        <StyledArrowIcon />
        <ContainerBox gap={0.5} alignItems="center">
          <NetWorthNumber value={updatedValue} isLoading={isLoading} variant="bodyBold" />
        </ContainerBox>
      </>
    )}
  </ContainerBox>
);

const ExpectedReturnsChangesSummary = ({
  hidePeriods,
  size = 'medium',
  isLoading,
  assetAmount,
  strategy,
  operation,
  includeSummaryItem = false,
}: ExpectedReturnsChangesSummaryProps) => {
  const intl = useIntl();
  const activeWallet = useActiveWallet();
  const isWithdraw = operation === EarnOperationVariant.WITHDRAW;

  const updatedUserPositions = React.useMemo(() => {
    const mainAsset = strategy?.asset;
    let newUpdatedPositions;
    const positions = [...(strategy?.userPositions || [])];

    const userStrategy =
      positions.find((position) => position.owner === activeWallet?.address) ||
      (strategy && mainAsset && createEmptyEarnPosition(strategy, activeWallet?.address || '0x', mainAsset));
    if (userStrategy && mainAsset) {
      const updatedUserStrategy = { ...userStrategy };

      newUpdatedPositions = [
        ...(strategy.userPositions?.filter((position) => position.id !== updatedUserStrategy.id) || []),
      ];
      updatedUserStrategy.balances = updatedUserStrategy.balances.map(({ token, amount: tokenAmount, profit }) => {
        const parsedAssetAmount = BigInt(parseUnits(assetAmount || '0', mainAsset.decimals));
        const newAmount = tokenAmount.amount + (isWithdraw ? -parsedAssetAmount : parsedAssetAmount);

        return token.address === strategy?.asset.address
          ? {
              token,
              amount: {
                amount: newAmount,
                amountInUnits: formatUnits(newAmount, mainAsset.decimals),
                amountInUSD: parseUsdPrice(mainAsset, newAmount, parseNumberUsdPriceToBigInt(mainAsset.price)).toFixed(
                  2
                ),
              },
              profit,
            }
          : { token, amount: tokenAmount, profit };
      });

      newUpdatedPositions.push(updatedUserStrategy);
    }

    return newUpdatedPositions;
  }, [strategy?.userPositions, assetAmount, activeWallet]);

  const { earnings, totalInvestedUsd } = React.useMemo(
    () => parseUserStrategiesFinancialData(strategy?.userPositions),
    [strategy?.userPositions]
  );
  const { earnings: updatedEarnings, totalInvestedUsd: updatedTotalInvestedUsd } = React.useMemo(
    () => parseUserStrategiesFinancialData(updatedUserPositions),
    [updatedUserPositions]
  );

  const hasOriginalValue = !!strategy?.userPositions && strategy?.userPositions.length > 0;
  const hasNewValues = !!updatedUserPositions && updatedUserPositions.length > 0;
  return (
    <ContainerBox gap={size === 'medium' ? 16 : 6} flexWrap="wrap">
      {includeSummaryItem && (
        <SummaryItem
          currentValue={totalInvestedUsd}
          updatedValue={updatedTotalInvestedUsd}
          isLoading={isLoading}
          hasOriginalValue={hasOriginalValue}
          hasNewValues={hasNewValues}
          title={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Total invested',
              description: 'earn.strategy-management.changes-summary.total-invested',
            })
          )}
          gap={size === 'medium' ? 0 : 1}
        />
      )}
      {STRATEGY_RETURN_PERIODS.filter((period) => !hidePeriods?.includes(period.period)).map((period) => (
        <SummaryItem
          key={period.period}
          currentValue={earnings[period.period]}
          updatedValue={updatedEarnings[period.period]}
          isLoading={isLoading}
          hasOriginalValue={hasOriginalValue}
          hasNewValues={hasNewValues}
          title={intl.formatMessage(period.title)}
          gap={size === 'medium' ? 0 : 1}
        />
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturnsChangesSummary;
