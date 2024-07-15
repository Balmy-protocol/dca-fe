import NetWorthNumber from '@common/components/networth-number';
import useUserStrategiesFinancial from '@hooks/earn/useUserStrategiesFinancial';
import { DisplayStrategy } from 'common-types';
import React from 'react';
import { defineMessage, useIntl } from 'react-intl';
import { ContainerBox, Typography } from 'ui-library';

export enum StrategyReturnPeriods {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

type PeriodItem = {
  period: StrategyReturnPeriods;
  annualRatio: number;
  title: ReturnType<typeof defineMessage>;
};

const periods: PeriodItem[] = [
  {
    period: StrategyReturnPeriods.DAY,
    annualRatio: 1 / 365,
    title: defineMessage({
      defaultMessage: 'Daily',
      description: 'strategy-detail.vault-investment-data.daily',
    }),
  },
  {
    period: StrategyReturnPeriods.WEEK,
    annualRatio: 1 / 52,
    title: defineMessage({
      defaultMessage: 'Weekly',
      description: 'strategy-detail.vault-investment-data.weekly',
    }),
  },
  {
    period: StrategyReturnPeriods.MONTH,
    annualRatio: 1 / 12,
    title: defineMessage({
      defaultMessage: 'Monthly',
      description: 'strategy-detail.vault-investment-data.monthly',
    }),
  },
  {
    period: StrategyReturnPeriods.YEAR,
    annualRatio: 1,
    title: defineMessage({
      defaultMessage: 'Annual',
      description: 'strategy-detail.vault-investment-data.yearly',
    }),
  },
];

interface ExpectedReturnsProps {
  strategy: DisplayStrategy;
  hidePeriods?: StrategyReturnPeriods[];
}

const ExpectedReturns = ({ strategy, hidePeriods }: ExpectedReturnsProps) => {
  const intl = useIntl();
  const { totalInvestedUsd } = useUserStrategiesFinancial(strategy.userPositions);
  return (
    <ContainerBox gap={16}>
      {periods
        .filter((period) => !hidePeriods?.includes(period.period))
        .map((period) => (
          <ContainerBox flexDirection="column" key={period.period}>
            <Typography variant="bodySmallRegular">{intl.formatMessage(period.title)}</Typography>
            <NetWorthNumber
              value={totalInvestedUsd * period.annualRatio * strategy.farm.apy}
              variant="bodyRegular"
            />
          </ContainerBox>
        ))}
    </ContainerBox>
  );
};

export default ExpectedReturns;
