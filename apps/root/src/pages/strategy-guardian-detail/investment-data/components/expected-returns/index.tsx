import NetWorthNumber from '@common/components/networth-number';
import {
  parseUserStrategiesFinancialData,
  STRATEGY_RETURN_PERIODS,
  StrategyReturnPeriods,
} from '@common/utils/earn/parsing';
import { EarnPosition } from 'common-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { ChevronRightSmallIcon, colors, ContainerBox, Typography } from 'ui-library';

interface ExpectedReturnsProps {
  userPositions?: EarnPosition[];
  hidePeriods?: StrategyReturnPeriods[];
  isLoading?: boolean;
}

const ExpectedReturns = ({ userPositions, hidePeriods, isLoading }: ExpectedReturnsProps) => {
  const intl = useIntl();
  const { earnings } = React.useMemo(() => parseUserStrategiesFinancialData(userPositions), [userPositions]);
  return (
    <ContainerBox alignItems="flex-start" flexWrap="wrap" gap={2}>
      {STRATEGY_RETURN_PERIODS.filter((period) => !hidePeriods?.includes(period.period)).map((period, index) => (
        <>
          {index !== 0 && (
            <ChevronRightSmallIcon
              sx={({ spacing, palette: { mode } }) => ({
                fontSize: `${spacing(4)} !important`,
                color: colors[mode].typography.typo5,
              })}
            />
          )}
          <ContainerBox flexDirection="column" gap={1} key={period.period}>
            <Typography variant="bodySmallRegular">{intl.formatMessage(period.title)}</Typography>
            <NetWorthNumber
              value={earnings[period.period]}
              isLoading={isLoading}
              variant="bodyBold"
              colorVariant={!userPositions?.length ? 'typo4' : undefined}
            />
          </ContainerBox>
        </>
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturns;
