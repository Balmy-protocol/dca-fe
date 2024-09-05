import { formatUsdAmount } from '@common/utils/currency';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import { ONE_DAY } from '@constants';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { GraphSkeleton } from '@pages/strategy-guardian-detail/vault-data/components/data-historical-rate';
import { useThemeMode } from '@state/config/hooks';
import { Timestamp } from 'common-types';
import { isUndefined, maxBy, orderBy } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { ContainerBox, GraphContainer, colors } from 'ui-library';
import { buildTypographyVariant } from 'ui-library/src/theme/typography';

type DataItem = {
  tvl?: number;
  timestamp: number;
  name: string;
  estReturn?: number;
};

function calculateExpectedTVL(currentTVL: number, apy: number, durationDays: number): number {
  const ratePerDay = apy / 365;
  return currentTVL * Math.pow(1 + ratePerDay, durationDays);
}

// 3 months of data
const DAYS = 90;

const findXPoint = (data: DataItem[]) => {
  const reversedData = data.slice().reverse();

  return reversedData.find((d) => !!d.tvl)?.timestamp;
};

const findYPoint = (data: DataItem[]) => {
  const reversedData = data.slice().reverse();

  const lastTvl = reversedData.find((d) => !!d.tvl)?.tvl || 0;

  const maxTvl = maxBy(data, (d) => d.tvl)?.tvl || 0;

  return lastTvl + (maxTvl - lastTvl) / 2;
};

const estReturnLabel = (
  { viewBox: { x } }: { viewBox: { x: number } },
  data: DataItem[],
  intl: ReturnType<typeof useIntl>,
  mode: 'light' | 'dark'
) => {
  // eslint-disable-next-line react/destructuring-assignment
  const expectedReturn = data[data.length - 1]?.estReturn;
  return (
    <>
      <text
        fontSize="0.75rem"
        fontWeight={500}
        fontFamily="Inter"
        color={colors[mode].typography.typo3}
        x={x + 12}
        y={20}
        fill={colors[mode].typography.typo3}
      >
        Expected Returns
      </text>
      <text
        fontSize="0.875rem"
        fontWeight={600}
        fontFamily="Inter"
        color={colors[mode].semantic.success.darker}
        x={x + 12}
        y={44}
        fill={colors[mode].semantic.success.darker}
      >
        ${formatUsdAmount({ amount: expectedReturn, intl })}
      </text>
    </>
  );
};
const EarnPositionTvlGraph = () => {
  const mode = useThemeMode();

  const intl = useIntl();

  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();

  const { earnings } = React.useMemo(() => parseUserStrategiesFinancialData(userStrategies), [userStrategies]);

  const mappedData = React.useMemo(() => {
    const tvlKey: Record<Timestamp, number> = {};
    userStrategies.forEach((strategy) => {
      strategy.historicalBalances.forEach((balance) => {
        const totalTvl = balance.balances.reduce((acc, b) => acc + Number(b.amount.amountInUSD || 0), 0);
        if (!tvlKey[balance.timestamp]) tvlKey[balance.timestamp] = 0;

        tvlKey[balance.timestamp] += totalTvl;
      });
    });

    const actualData = orderBy(
      Object.entries(tvlKey).map(([timestamp, tvl]) => ({
        timestamp: Number(timestamp),
        tvl,
        name: DateTime.fromMillis(Number(timestamp)).toFormat('MMM d t'),
      })) as DataItem[],
      'timestamp',
      'asc'
    );

    const lastItem = actualData[actualData.length - 1];

    if (isUndefined(lastItem?.tvl)) return [];

    const apy = earnings.year / lastItem.tvl;

    const estReturns = orderBy(
      Array.from(Array(DAYS).keys()).reduce<DataItem[]>((acc, i) => {
        const nextTimestamp = lastItem.timestamp + Number(ONE_DAY) * i * 1000;
        const expectedTVL = calculateExpectedTVL(lastItem.tvl!, apy, i);

        acc.push({
          timestamp: nextTimestamp,
          estReturn: expectedTVL,
          name: DateTime.fromMillis(Number(nextTimestamp)).toFormat('MMM d t'),
        });
        return acc;
      }, []),
      'timestamp',
      'asc'
    );

    return [...actualData, ...estReturns];
  }, [userStrategies, earnings]);

  const isLoading = !hasFetchedUserStrategies;

  const organicGrowers: (keyof DataItem)[] = React.useMemo(() => ['estReturn'], []);

  return (
    <ContainerBox>
      {isLoading ? (
        <GraphSkeleton />
      ) : (
        <GraphContainer data={mappedData} height={190} addOrganicGrowthTo={organicGrowers} variationFactor={0.1}>
          {(data) => (
            <ResponsiveContainer width="100%" height={190}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="tvl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={1} />
                    <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="estReturn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[mode].semantic.success.darker} stopOpacity={1} />
                    <stop offset="95%" stopColor={colors[mode].semantic.success.darker} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
                <Area
                  connectNulls
                  type="monotone"
                  fill="url(#estReturn)"
                  strokeWidth="2px"
                  strokeDasharray="4 2"
                  dot={false}
                  activeDot={false}
                  stroke={colors[mode].semantic.success.darker}
                  dataKey="estReturn"
                />
                <Area
                  connectNulls
                  type="monotone"
                  fill="url(#tvl)"
                  strokeWidth="2px"
                  dot={false}
                  activeDot={false}
                  stroke={colors[mode].violet.violet500}
                  dataKey="tvl"
                />
                <ReferenceDot
                  label={(props: { viewBox: { x: number } }) => estReturnLabel(props, data, intl, mode)}
                  // label="Estimated return"
                  x={findXPoint(data)}
                  y={findYPoint(data)}
                  r={1}
                  color={colors[mode].typography.typo3}
                  fill={colors[mode].typography.typo3}
                />
                <ReferenceLine
                  x={findXPoint(data)}
                  strokeWidth="2px"
                  strokeDasharray="4 2"
                  stroke={colors[mode].border.border1}
                />
                <XAxis
                  dataKey="timestamp"
                  domain={['dataMin', 'dataMax']}
                  interval="preserveStartEnd"
                  tickMargin={8}
                  minTickGap={30}
                  tickCount={10}
                  axisLine={{ stroke: 'transparent' }}
                  type="number"
                  tickLine={false}
                  tickFormatter={(value: string) => DateTime.fromMillis(Number(value)).toFormat('MMM d')}
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).bodySmallLabel }}
                />
                <YAxis
                  tickMargin={4}
                  width={30}
                  strokeWidth="0px"
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: string) => `$${value}`}
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).bodySmallLabel }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </GraphContainer>
      )}
    </ContainerBox>
  );
};

export default EarnPositionTvlGraph;