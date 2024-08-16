import React from 'react';
import { ContainerBox, Dashboard, DashboardSkeleton, Grid, Typography } from 'ui-library';
import useCurrentPositions from '@hooks/useCurrentPositions';

import { FormattedMessage, useIntl } from 'react-intl';
import useUserHasPositions from '@hooks/useUserHasPositions';
import WidgetFrame from '../widget-frame';
import useNetWorth from '@hooks/useNetWorth';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector';
import { formatUsdAmount } from '@common/utils/currency';
import { useShowBalances } from '@state/config/hooks';

type TokenCount = Record<string, number>;

interface PortfolioProps {
  selectedWalletOption: WalletOptionValues;
}

const DcaDashboard = ({ selectedWalletOption }: PortfolioProps) => {
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const { currentPositions: positions, hasFetchedCurrentPositions } = useCurrentPositions();
  const { userHasPositions } = useUserHasPositions();
  const intl = useIntl();
  const showBalances = useShowBalances();

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
    <Grid item xs={12} display="flex">
      <ContainerBox flex="1">
        <WidgetFrame
          assetValue={assetsTotalValue.dca}
          title={<FormattedMessage defaultMessage="DCA Investments" description="dcaInvestments" />}
          subtitle={
            hasFetchedCurrentPositions &&
            showBalances &&
            (filteredPositionsLenght === 1 ? (
              <FormattedMessage defaultMessage="1 Position" description="home.dca.dashboard.title.positions.singular" />
            ) : (
              <FormattedMessage
                defaultMessage="{positions} Positions"
                description="home.dca.dashboard.title.positions.plural"
                values={{
                  positions: filteredPositionsLenght,
                }}
              />
            ))
          }
          isLoading={!hasFetchedCurrentPositions}
          collapsable
          widgetId="Dca Dashboard"
          totalValue={totalAssetValue}
          showPercentage
        >
          {!!filteredPositionsLenght ? (
            <ContainerBox flexDirection="column" alignItems="stretch" flex={1} gap={3} style={{ height: '100%' }}>
              {hasFetchedCurrentPositions ? (
                <Dashboard
                  data={tokensCount}
                  valueFormatter={(value) => `$${formatUsdAmount({ amount: value, intl })}`}
                  withPie
                  showBalances={showBalances}
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
      </ContainerBox>
    </Grid>
  );
};
export default DcaDashboard;
