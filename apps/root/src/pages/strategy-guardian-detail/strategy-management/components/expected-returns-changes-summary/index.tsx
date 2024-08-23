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
import { useIntl } from 'react-intl';
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

interface ExpectedReturnsChangesSummaryProps {
  hidePeriods?: StrategyReturnPeriods[];
  size?: 'medium' | 'small';
  isLoading?: boolean;
  strategy?: DisplayStrategy;
  assetAmount?: string;
}

const ExpectedReturnsChangesSummary = ({
  hidePeriods,
  size = 'medium',
  isLoading,
  assetAmount,
  strategy,
}: ExpectedReturnsChangesSummaryProps) => {
  const intl = useIntl();
  const activeWallet = useActiveWallet();

  const updatedUserPositions = React.useMemo(() => {
    const mainAsset = strategy?.asset;
    let newUpdatedPositions;
    const positions = [...(strategy?.userPositions || [])];

    const userStrategy =
      positions.find((position) => position.owner === activeWallet?.address) ||
      (strategy && mainAsset && createEmptyEarnPosition(strategy, activeWallet?.address || '0x', mainAsset));
    if (userStrategy && mainAsset) {
      newUpdatedPositions = [...(strategy.userPositions?.filter((position) => position.id !== userStrategy.id) || [])];
      userStrategy.balances = userStrategy.balances.map(({ token, amount: tokenAmount, profit }) => {
        const newAmount = tokenAmount.amount + BigInt(parseUnits(assetAmount || '0', mainAsset.decimals));

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

      newUpdatedPositions.push(userStrategy);
    }

    return newUpdatedPositions;
  }, [strategy?.userPositions, assetAmount, activeWallet]);

  const { earnings } = React.useMemo(
    () => parseUserStrategiesFinancialData(strategy?.userPositions),
    [strategy?.userPositions]
  );
  const { earnings: updatedEarnings } = React.useMemo(
    () => parseUserStrategiesFinancialData(updatedUserPositions),
    [updatedUserPositions]
  );

  const hasOriginalValue = !!strategy?.userPositions && strategy?.userPositions.length > 0;
  const hasNewValues = !!updatedUserPositions && updatedUserPositions.length > 0;
  return (
    <ContainerBox gap={size === 'medium' ? 16 : 6} flexWrap="wrap">
      {STRATEGY_RETURN_PERIODS.filter((period) => !hidePeriods?.includes(period.period)).map((period) => (
        <ContainerBox flexDirection="column" key={period.period} gap={size === 'medium' ? 0 : 1}>
          <Typography variant="bodySmallRegular">{intl.formatMessage(period.title)}</Typography>
          {earnings[period.period] === updatedEarnings[period.period] ? (
            <StyledCurrentValueBold>-</StyledCurrentValueBold>
          ) : (
            <NetWorthNumber
              value={hasOriginalValue ? earnings[period.period] : updatedEarnings[period.period]}
              isLoading={isLoading}
              variant={hasOriginalValue && hasNewValues ? 'bodyRegular' : 'bodyBold'}
            />
          )}
          {earnings[period.period] !== updatedEarnings[period.period] && hasOriginalValue && hasNewValues && (
            <>
              <StyledArrowIcon />
              <ContainerBox gap={0.5} alignItems="center">
                <NetWorthNumber value={updatedEarnings[period.period]} isLoading={isLoading} variant="bodyBold" />
              </ContainerBox>
            </>
          )}
        </ContainerBox>
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturnsChangesSummary;
