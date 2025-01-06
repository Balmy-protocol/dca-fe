import TokenAmount from '@common/components/token-amount';
import { createEmptyEarnPosition } from '@common/mocks/earn';
import { parseUsdPrice, parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import {
  parseUserStrategiesFinancialData,
  STRATEGY_RETURN_PERIODS,
  StrategyReturnPeriods,
} from '@common/utils/earn/parsing';
import useActiveWallet from '@hooks/useActiveWallet';
import { AmountsOfToken, DisplayStrategy, Token } from 'common-types';
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
  asset,
}: {
  asset?: Token;
  currentValue?: AmountsOfToken;
  updatedValue?: AmountsOfToken;
  isLoading?: boolean;
  hasOriginalValue: boolean;
  hasNewValues: boolean;
  title: string;
  gap: number;
}) => (
  <ContainerBox flexDirection="column" gap={gap}>
    <Typography variant="bodySmallRegular">{title}</Typography>
    {currentValue?.amount === updatedValue?.amount || (!currentValue && !updatedValue) ? (
      <StyledCurrentValueBold>-</StyledCurrentValueBold>
    ) : (
      <TokenAmount
        token={asset}
        amount={hasOriginalValue ? currentValue : updatedValue}
        isLoading={isLoading}
        amountColorVariant={hasOriginalValue && hasNewValues ? 'typo5' : undefined}
        showIcon={false}
        showSubtitle={!(currentValue?.amount !== updatedValue?.amount && hasOriginalValue && hasNewValues)}
        maxDecimals={4}
        disableHiddenNumber
      />
    )}
    {currentValue?.amount !== updatedValue?.amount && hasOriginalValue && hasNewValues && (
      <>
        <StyledArrowIcon />
        <TokenAmount
          token={asset}
          amount={updatedValue}
          isLoading={isLoading}
          showIcon={false}
          maxDecimals={4}
          disableHiddenNumber
        />
      </>
    )}
  </ContainerBox>
);

const ExpectedReturnsChangesSummary = ({
  hidePeriods,
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

    if (!Number(assetAmount || 0)) {
      return positions;
    }

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

  const { earnings, totalInvested } = React.useMemo(
    () => parseUserStrategiesFinancialData(strategy?.userPositions),
    [strategy?.userPositions]
  );
  const { earnings: updatedEarnings, totalInvested: updatedTotalInvested } = React.useMemo(
    () => parseUserStrategiesFinancialData(updatedUserPositions),
    [updatedUserPositions]
  );

  const hasOriginalValue = !!strategy?.userPositions && strategy?.userPositions.length > 0;
  const hasNewValues = !!updatedUserPositions && updatedUserPositions.length > 0;

  const mainAsset = strategy?.asset;
  return (
    <ContainerBox flexWrap="wrap" gap={8}>
      {includeSummaryItem && (
        <ContainerBox>
          <SummaryItem
            asset={mainAsset}
            currentValue={totalInvested[mainAsset?.address || '0x']}
            updatedValue={updatedTotalInvested[mainAsset?.address || '0x']}
            isLoading={isLoading}
            hasOriginalValue={hasOriginalValue}
            hasNewValues={hasNewValues}
            title={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Total invested',
                description: 'earn.strategy-management.changes-summary.total-invested',
              })
            )}
            gap={0}
          />
        </ContainerBox>
      )}
      {STRATEGY_RETURN_PERIODS.filter((period) => !hidePeriods?.includes(period.period)).map((period) => (
        <ContainerBox key={period.period}>
          <SummaryItem
            asset={mainAsset}
            currentValue={earnings[period.period].byToken[mainAsset?.address || '0x']}
            updatedValue={updatedEarnings[period.period].byToken[mainAsset?.address || '0x']}
            isLoading={isLoading}
            hasOriginalValue={hasOriginalValue}
            hasNewValues={hasNewValues}
            title={intl.formatMessage(period.title)}
            gap={0}
          />
        </ContainerBox>
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturnsChangesSummary;
