import React from 'react';
import { ContainerBox, Dashboard, DashboardSkeleton } from 'ui-library';
import useCurrentPositions from '@hooks/useCurrentPositions';

import { FormattedMessage } from 'react-intl';
import useUserHasPositions from '@hooks/useUserHasPositions';
import WidgetFrame from '../widget-frame';
import useNetWorth from '@hooks/useNetWorth';
import { WalletOptionValues } from '@common/components/wallet-selector';
import { usdFormatter } from '@common/utils/parsing';

type TokenCount = Record<string, number>;

interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

const DcaDashboard = ({ selectedWalletOption }: PortfolioProps) => {
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const { currentPositions: positions, hasFetchedCurrentPositions } = useCurrentPositions();
  const { userHasPositions } = useUserHasPositions();

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

    return tokenSymbols.map((tokenSymbol) => ({
      name: tokenSymbol,
      value: tokensCountRaw[tokenSymbol],
    }));
  }, [tokensCountRaw]);

  if (!userHasPositions) {
    return null;
  }

  return (
    <WidgetFrame
      assetValue={assetsTotalValue.dca}
      title={<FormattedMessage defaultMessage="DCA Investments" description="dcaInvestments" />}
      subtitle={
        hasFetchedCurrentPositions && (
          <FormattedMessage
            defaultMessage="{positions} Position{plural}"
            values={{
              positions: positions.length,
              plural: positions.length !== 1 ? 's' : '',
            }}
          />
        )
      }
      isLoading={!hasFetchedCurrentPositions}
      collapsable
      totalValue={totalAssetValue}
      showPercentage
    >
      <ContainerBox flexDirection="column" alignItems="stretch" flex={1} gap={3} style={{ height: '100%' }}>
        {hasFetchedCurrentPositions ? (
          <Dashboard
            data={tokensCount}
            valueFormatter={(value) => `$${usdFormatter(value)}`}
            withPie
            valuesForOther={4}
          />
        ) : (
          <DashboardSkeleton withPie={false} />
        )}
      </ContainerBox>
    </WidgetFrame>
  );
};
export default DcaDashboard;
