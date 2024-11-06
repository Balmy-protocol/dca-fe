import TokenAmount from '@common/components/token-amount';
import { emptyTokenWithDecimals, formatUsdAmount } from '@common/utils/currency';
import {
  parseUserStrategiesFinancialData,
  STRATEGY_RETURN_PERIODS,
  StrategyReturnPeriods,
} from '@common/utils/earn/parsing';
import { EarnPosition } from 'common-types';
import React from 'react';
import { useIntl } from 'react-intl';
import { ChevronRightSmallIcon, colors, ContainerBox, Typography } from 'ui-library';
import { parseUnits } from 'viem';

interface ExpectedReturnsProps {
  userPositions?: EarnPosition[];
  hidePeriods?: StrategyReturnPeriods[];
  isLoading?: boolean;
  isFiat?: boolean;
}

const ExpectedReturns = ({ userPositions, hidePeriods, isLoading, isFiat = true }: ExpectedReturnsProps) => {
  const intl = useIntl();
  const { earnings } = React.useMemo(() => parseUserStrategiesFinancialData(userPositions), [userPositions]);

  const mainAsset = userPositions?.[0]?.strategy?.asset;
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
            <TokenAmount
              token={isFiat ? emptyTokenWithDecimals(2) : mainAsset}
              amount={
                isFiat
                  ? {
                      amount: parseUnits(earnings[period.period].total.toFixed(2), 2),
                      amountInUnits: earnings[period.period].total.toFixed(2),
                      amountInUSD: formatUsdAmount({ amount: earnings[period.period].total, intl }),
                    }
                  : earnings[period.period].byToken[mainAsset?.address || '0x']
              }
              isLoading={isLoading}
              amountColorVariant={!userPositions?.length ? 'typo4' : undefined}
              showIcon={false}
              useNetworthNumber={isFiat}
              showSymbol={!isFiat}
              showSubtitle={!isFiat}
            />
          </ContainerBox>
        </>
      ))}
    </ContainerBox>
  );
};

export default ExpectedReturns;
