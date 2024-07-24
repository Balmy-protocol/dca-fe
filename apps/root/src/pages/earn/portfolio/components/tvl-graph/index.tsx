import useEarnPositions from '@hooks/earn/useEarnPositions';
import { GraphSkeleton } from '@pages/strategy-guardian-detail/vault-data/components/data-historical-rate';
import { useThemeMode } from '@state/config/hooks';
import { Timestamp } from 'common-types';
import { DateTime } from 'luxon';
import React from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Area, XAxis, YAxis } from 'recharts';
import { ContainerBox, GraphContainer, colors } from 'ui-library';
import { buildTypographyVariant } from 'ui-library/src/theme/typography';

type DataItem = {
  tvl: number;
  timestamp: number;
  name: string;
};

const EarnPositionTvlGraph = () => {
  const mode = useThemeMode();

  const { userStrategies, hasFetchedUserStrategies } = useEarnPositions();

  const mappedData = React.useMemo(() => {
    const tvlKey: Record<Timestamp, number> = {};
    userStrategies.forEach((strategy) => {
      strategy.historicalBalances.forEach((balance) => {
        const totalTvl = balance.balances.reduce((acc, b) => acc + Number(b.amount.amountInUSD || 0), 0);
        if (!tvlKey[balance.timestamp]) tvlKey[balance.timestamp] = 0;

        tvlKey[balance.timestamp] += totalTvl;
      });
    });

    return Object.entries(tvlKey).map(([timestamp, tvl]) => ({
      timestamp: Number(timestamp),
      tvl,
      name: DateTime.fromMillis(Number(timestamp)).toFormat('MMM d t'),
    })) as DataItem[];
  }, [userStrategies]);

  const isLoading = !hasFetchedUserStrategies;

  return (
    <ContainerBox>
      {isLoading ? (
        <GraphSkeleton />
      ) : (
        <GraphContainer data={mappedData} height={190}>
          {(data) => (
            <ResponsiveContainer width="100%" height={190}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="tvl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={1} />
                    <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
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
                <XAxis
                  dataKey="name"
                  interval="preserveStartEnd"
                  tickMargin={8}
                  minTickGap={30}
                  axisLine={{ stroke: 'transparent' }}
                  tickLine={false}
                  tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}
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
