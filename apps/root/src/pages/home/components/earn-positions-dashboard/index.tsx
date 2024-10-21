import React from 'react';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector/types';
import useNetWorth from '@hooks/useNetWorth';
import WidgetFrame from '../widget-frame';
import { FormattedMessage } from 'react-intl';
import { colors, Grid, MoneyAddIcon, Typography } from 'ui-library';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { useShowBalances } from '@state/config/hooks';
import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import FinancialOverview from '@pages/strategy-guardian-detail/investment-data/components/financial-overview';

interface EarnPositionsDashboardProps {
  selectedWalletOption: WalletOptionValues;
}

const EarnPositionsDashboard = ({ selectedWalletOption }: EarnPositionsDashboardProps) => {
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();
  const showBalances = useShowBalances();

  const filteredPositions = React.useMemo(
    () =>
      userStrategies.filter(
        (strategy) => selectedWalletOption === ALL_WALLETS || strategy.owner === selectedWalletOption
      ),
    [userStrategies, selectedWalletOption]
  );

  const filteredPositionsLenght = filteredPositions.length;

  if (!userStrategies.length) {
    return null;
  }

  return (
    <WidgetFrame
      assetValue={assetsTotalValue.earn}
      title={<FormattedMessage defaultMessage="Earn" description="home.earn.dashboard.title.earn" />}
      Icon={MoneyAddIcon}
      subtitle={
        hasFetchedUserStrategies &&
        showBalances &&
        (filteredPositionsLenght === 1 ? (
          <FormattedMessage defaultMessage="1 active vault" description="home.earn.dashboard.title.vaults.singular" />
        ) : (
          <FormattedMessage
            defaultMessage="{vaults} active vaults"
            description="home.earn.dashboard.title.vaults.plural"
            values={{
              vaults: filteredPositionsLenght,
            }}
          />
        ))
      }
      isLoading={!hasFetchedUserStrategies}
      collapsable
      widgetId="Earn Dashboard"
      totalValue={totalAssetValue}
      showPercentage
    >
      {!!filteredPositionsLenght ? (
        <Grid container justifyContent="space-between" columnSpacing={4}>
          <Grid item xs={12} md="auto" display="flex" flexDirection="column" gap={3}>
            <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              <FormattedMessage defaultMessage="Total Value" description="home.earn.dashboard.title.total-value" />
            </Typography>
            <FinancialOverview userPositions={filteredPositions} size="small" isLoading={!hasFetchedUserStrategies} />
          </Grid>
          <Grid item xs={12} md="auto" display="flex" flexDirection="column" gap={3}>
            <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              <FormattedMessage
                defaultMessage="Expected returns"
                description="home.earn.dashboard.title.expected-returns"
              />
            </Typography>
            <ExpectedReturns userPositions={filteredPositions} isLoading={!hasFetchedUserStrategies} />
          </Grid>
        </Grid>
      ) : (
        <Typography variant="bodyRegular">
          <FormattedMessage
            defaultMessage="Current wallet has no active vaults"
            description="home.earn.dashboard.title.no-vaults"
          />
        </Typography>
      )}
    </WidgetFrame>
  );
};

export default EarnPositionsDashboard;
