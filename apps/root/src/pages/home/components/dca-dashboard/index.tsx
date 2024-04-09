import React from 'react';
import { ContainerBox, Dashboard, DashboardSkeleton, Typography } from 'ui-library';
import useCurrentPositions from '@hooks/useCurrentPositions';

import { FormattedMessage } from 'react-intl';
import useUserHasPositions from '@hooks/useUserHasPositions';
import WidgetFrame from '../widget-frame';
import useNetWorth from '@hooks/useNetWorth';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
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
        if (selectedWalletOption !== ALL_WALLETS && position.user !== selectedWalletOption) {
          return acc;
        }

        if (position.remainingLiquidity.amount > 0n) {
          if (!acc[position.from.symbol]) {
            // eslint-disable-next-line no-param-reassign
            acc[position.from.symbol] = parseFloat(position.remainingLiquidity.amountInUSD || '0');
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[position.from.symbol] += parseFloat(position.remainingLiquidity.amountInUSD || '0');
          }
        }

        if (position.toWithdraw.amount > 0n) {
          if (!acc[position.to.symbol]) {
            // eslint-disable-next-line no-param-reassign
            acc[position.to.symbol] = parseFloat(position.toWithdraw.amountInUSD || '0');
          } else {
            // eslint-disable-next-line no-param-reassign
            acc[position.to.symbol] += parseFloat(position.toWithdraw.amountInUSD || '0');
          }
        }

        return acc;
      }, {}),
    [positions.length, selectedWalletOption]
  );

  const tokensCount = React.useMemo(() => {
    const tokenSymbols = Object.keys(tokensCountRaw);

    return tokenSymbols.map((tokenSymbol) => ({
      name: tokenSymbol,
      value: tokensCountRaw[tokenSymbol],
    }));
  }, [tokensCountRaw]);

  const filteredPositionsLenght = React.useMemo(
    () =>
      selectedWalletOption === ALL_WALLETS
        ? positions.length
        : positions.filter((position) => position.user === selectedWalletOption).length,
    [selectedWalletOption, positions.length]
  );

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
              positions: filteredPositionsLenght,
              plural: filteredPositionsLenght !== 1 ? 's' : '',
            }}
          />
        )
      }
      isLoading={!hasFetchedCurrentPositions}
      collapsable
      totalValue={totalAssetValue}
      showPercentage
    >
      {!!filteredPositionsLenght ? (
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
      ) : (
        <Typography variant="bodyRegular">
          <FormattedMessage
            defaultMessage="Current wallet has no active DCA positions"
            description="currentWalletNoPositions"
          />
        </Typography>
      )}
    </WidgetFrame>
  );
};
export default DcaDashboard;
