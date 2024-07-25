import NetWorthNumber from '@common/components/networth-number';
import {
  parseUserStrategiesFinancialData,
  STRATEGY_RETURN_PERIODS,
  StrategyReturnPeriods,
} from '@common/utils/earn/parsing';
import { EarnPosition } from 'common-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { ContainerBox, Typography } from 'ui-library';

interface ExpectedReturnsProps {
  userPositions?: EarnPosition[];
  hidePeriods?: StrategyReturnPeriods[];
  size?: 'medium' | 'small';
  isLoading?: boolean;
}

const ExpectedReturns = ({ userPositions, hidePeriods, size = 'medium', isLoading }: ExpectedReturnsProps) => {
  const intl = useIntl();
  const { earnings } = React.useMemo(() => parseUserStrategiesFinancialData(userPositions), [userPositions]);
  return (
    <ContainerBox gap={size === 'medium' ? 16 : 6}>
      {STRATEGY_RETURN_PERIODS.filter((period) => !hidePeriods?.includes(period.period)).map((period) => (
        <ContainerBox flexDirection="column" key={period.period} gap={size === 'medium' ? 0 : 1}>
          <Typography variant="bodySmallRegular">{intl.formatMessage(period.title)}</Typography>
          <NetWorthNumber value={earnings[period.period]} isLoading={isLoading} variant="bodyBold" />
        </ContainerBox>
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturns;
