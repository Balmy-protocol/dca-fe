import React from 'react';
import { ALL_WALLETS, WalletOptionValues } from '@common/components/wallet-selector/types';
import useNetWorth from '@hooks/useNetWorth';
import WidgetFrame from '../widget-frame';
import { FormattedMessage } from 'react-intl';
import { colors, ContainerBox, Grid, MoneyAddIcon, Typography } from 'ui-library';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { useShowBalances } from '@state/config/hooks';
import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import FinancialOverview from '@pages/strategy-guardian-detail/investment-data/components/financial-overview';
import { groupPositionsByStrategy, StrategyReturnPeriods } from '@common/utils/earn/parsing';
import DelayedWithdrawalsContainer from '../earn-delayed-withdrawals';

interface EarnPositionsDashboardProps {
  selectedWalletOption: WalletOptionValues;
}

const EarnPositionsDashboard = ({ selectedWalletOption }: EarnPositionsDashboardProps) => {
  const { assetsTotalValue, totalAssetValue } = useNetWorth({ walletSelector: selectedWalletOption });
  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();
  const showBalances = useShowBalances();

  const userStrategiesWithBalancesOrDelayedAmount = React.useMemo(
    () =>
      userStrategies.filter(
        (userStrategy) =>
          userStrategy.balances.some((balance) => balance.amount.amount > 0n) ||
          userStrategy.delayed?.some(
            (delayedBalance) => delayedBalance.ready.amount > 0n || delayedBalance.pending.amount > 0n
          )
      ),
    [userStrategies]
  );

  const filteredPositions = React.useMemo(
    () =>
      userStrategiesWithBalancesOrDelayedAmount.filter(
        (strategy) => selectedWalletOption === ALL_WALLETS || strategy.owner === selectedWalletOption
      ),
    [userStrategiesWithBalancesOrDelayedAmount, selectedWalletOption]
  );

  const groupedPositionsByStrategyCount = React.useMemo(
    () => groupPositionsByStrategy(filteredPositions).length,
    [filteredPositions]
  );

  if (!userStrategiesWithBalancesOrDelayedAmount.length) {
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
        (groupedPositionsByStrategyCount === 1 ? (
          <FormattedMessage defaultMessage="1 Vault" description="home.earn.dashboard.title.vaults.singular" />
        ) : (
          <FormattedMessage
            defaultMessage="{vaults} Vaults"
            description="home.earn.dashboard.title.vaults.plural"
            values={{
              vaults: groupedPositionsByStrategyCount,
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
      {!!groupedPositionsByStrategyCount ? (
        <ContainerBox flexDirection="column" gap={8}>
          <Grid container spacing={12}>
            <Grid item xs={12} md="auto" display="flex" flexDirection="column" gap={3}>
              <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage
                  defaultMessage="Investment & Earnings Summary"
                  description="home.earn.dashboard.title.total-value"
                />
              </Typography>
              <FinancialOverview
                userPositions={filteredPositions}
                size="small"
                isLoading={!hasFetchedUserStrategies}
                isFiat
                showLastMonth
                sumRewards
              />
            </Grid>
            <Grid item xs={12} md="auto" display="flex" flexDirection="column" gap={3}>
              <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage
                  defaultMessage="Expected Returns"
                  description="home.earn.dashboard.title.expected-returns"
                />
              </Typography>
              <ExpectedReturns
                userPositions={filteredPositions}
                isLoading={!hasFetchedUserStrategies}
                hidePeriods={[StrategyReturnPeriods.WEEK]}
                isFiat
              />
            </Grid>
          </Grid>
          <DelayedWithdrawalsContainer filteredPositions={filteredPositions} isLoading={!hasFetchedUserStrategies} />
        </ContainerBox>
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
