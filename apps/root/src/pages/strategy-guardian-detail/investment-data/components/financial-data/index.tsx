import React from 'react';
import { DisplayStrategy } from 'common-types';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { colors, ContainerBox, DividerBorder1, Typography } from 'ui-library';
import ExpectedReturns from '../expected-returns';
import FinancialOverview from '../financial-overview';
import WalletBreakdown from '../wallet-breakdown';
import BalancesContainer from '../balances';
import EarnPositionTvlGraph from '@pages/earn/portfolio/components/tvl-graph';
import { StrategyReturnPeriods } from '@common/utils/earn/parsing';

interface FinancialDataProps {
  strategy: DisplayStrategy;
}

const FinancialData = ({ strategy }: FinancialDataProps) => {
  const intl = useIntl();
  return (
    <>
      <FinancialOverview userPositions={strategy.userPositions} isFiat={false} />
      <DividerBorder1 />
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="h5Bold">
          <FormattedMessage
            defaultMessage="Expected Returns"
            description="strategy-detail.vault-investment-data.expected-returns"
          />
        </Typography>
        <ExpectedReturns userPositions={strategy.userPositions} hidePeriods={[StrategyReturnPeriods.DAY]} />
      </ContainerBox>
      <BalancesContainer
        asset={strategy?.asset}
        rewards={strategy?.displayRewards}
        userPositions={strategy?.userPositions}
      />
      <WalletBreakdown strategy={strategy} />
      <DividerBorder1 />
      <ContainerBox gap={4} flexDirection="column">
        <Typography variant="h5Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage
            description="strategy-detail.vault-investment-data.tvl-graph.title"
            defaultMessage="Vault History Overview"
          />
        </Typography>
        <EarnPositionTvlGraph
          isLoading={!strategy}
          userStrategies={strategy.userPositions || []}
          minPoints={2}
          extendExpectedReturns={false}
          emptyActionsTitle={intl.formatMessage(
            defineMessage({
              description: 'strategy-detail.vault-investment-data.tvl-graph.tvl-tooltip',
              defaultMessage: 'Tvl:',
            })
          )}
        />
      </ContainerBox>
    </>
  );
};

export default FinancialData;
