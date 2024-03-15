import React from 'react';
import { Typography, colors, ContainerBox, Dashboard, DashboardSkeleton } from 'ui-library';
import useCurrentPositions from '@hooks/useCurrentPositions';

import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { usdFormatter } from '@common/utils/parsing';

type TokenCount = Record<string, number>;

const UsdDashboard = () => {
  const { currentPositions: positions, hasFetchedCurrentPositions } = useCurrentPositions();
  const mode = useThemeMode();

  const tokensCountRaw = React.useMemo(
    () =>
      positions.reduce<TokenCount>((acc, position) => {
        const newAcc: TokenCount = {
          ...acc,
        };

        if (position.remainingLiquidity.amount > 0n) {
          if (!newAcc[position.from.symbol]) {
            newAcc[position.from.symbol] = parseFloat(position.remainingLiquidity.amountInUSD || '0');
          } else {
            newAcc[position.from.symbol] += parseFloat(position.remainingLiquidity.amountInUSD || '0');
          }
        }

        if (position.toWithdraw.amount > 0n) {
          if (!newAcc[position.to.symbol]) {
            newAcc[position.to.symbol] = parseFloat(position.toWithdraw.amountInUSD || '0');
          } else {
            newAcc[position.to.symbol] += parseFloat(position.toWithdraw.amountInUSD || '0');
          }
        }

        return newAcc;
      }, {}),
    [positions.length]
  );

  const tokensCount = React.useMemo(() => {
    const tokenSymbols = Object.keys(tokensCountRaw);

    return tokenSymbols.map((tokenSymbol) => {
      return {
        name: tokenSymbol,
        value: tokensCountRaw[tokenSymbol],
      };
    });
  }, [tokensCountRaw]);

  return (
    <ContainerBox flexDirection="column" alignItems="stretch" flex={1} gap={3} style={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={700} color={colors[mode].typography.typo2}>
        <FormattedMessage description="totalValueDashboard" defaultMessage="Total value" />
      </Typography>
      {hasFetchedCurrentPositions ? (
        <Dashboard data={tokensCount} valueFormatter={(value) => `$${usdFormatter(value)}`} withPie />
      ) : (
        <DashboardSkeleton withPie />
      )}
    </ContainerBox>
  );
};
export default UsdDashboard;
