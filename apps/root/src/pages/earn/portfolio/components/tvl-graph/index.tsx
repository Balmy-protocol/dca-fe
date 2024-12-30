import { formatUsdAmount } from '@common/utils/currency';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import { nowInSeconds } from '@common/utils/time';
import { ONE_DAY } from '@constants';
import { GraphSkeleton } from '@pages/strategy-guardian-detail/vault-data/components/data-historical-rate';
import { useThemeMode } from '@state/config/hooks';
import { EarnPosition, EarnPositionActionType, Timestamp } from 'common-types';
import { compact, isUndefined, maxBy, orderBy } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
} from 'recharts';
import {
  CustomDot,
  DataItemAction,
  findClosestTimestamp,
  GraphTooltip,
  PERMITTED_ACTIONS,
} from '@common/components/earn/action-graph-components';
import { ContainerBox, GraphContainer, colors, AvailableDatePeriods } from 'ui-library';
import { buildTypographyVariant } from 'ui-library/src/theme/typography';

type DataItem = {
  tvl?: number;
  timestamp: number;
  name: string;
  estReturn?: number;
  actions: DataItemAction[];
  mode: 'light' | 'dark';
};

function calculateExpectedTVL(currentTVL: number, apy: number, durationDays: number): number {
  const ratePerDay = apy / 100 / 365;
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
        <FormattedMessage
          description="earn.portfolio.tvl-graph.projected-portfolio-value"
          defaultMessage="Projected Portfolio Value"
        />
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

const CUSTOM_DAYS_BACK_MAP = {
  [AvailableDatePeriods.day]: 3,
};

const EarnPositionTvlGraph = ({
  userStrategies,
  isLoading,
  extendExpectedReturns = true,
  showDots = true,
  minPoints = 0,
  emptyActionsTitle,
}: {
  userStrategies: EarnPosition[];
  isLoading: boolean;
  showDots?: boolean;
  minPoints?: number;
  extendExpectedReturns?: boolean;
  emptyActionsTitle?: string;
}) => {
  const mode = useThemeMode();
  const intl = useIntl();

  const mappedData = React.useMemo(() => {
    const { earnings, totalInvestedUsd: currentTvl } = parseUserStrategiesFinancialData(userStrategies);

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
        name: DateTime.fromSeconds(Number(timestamp)).toFormat('MMM d t'),
        actions: [],
        mode,
      })) as DataItem[],
      'timestamp',
      'asc'
      // Now lets merge all the data that has the same name
    ).reduce<DataItem[]>((acc, item) => {
      const existingItem = acc.find((i) => i.name === item.name);
      if (existingItem) {
        existingItem.tvl = (existingItem.tvl ?? 0) + (item.tvl ?? 0);
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

    if (actualData.length < minPoints) {
      return [];
    }

    if (showDots) {
      const userActions = compact(
        userStrategies?.map((position) => {
          if (position.history.length === 0) {
            return null;
          }

          return compact(
            position.history
              ?.filter((action) => PERMITTED_ACTIONS.includes(action.action as EarnPositionActionType))
              .map<DataItemAction | null>((state) => {
                if (
                  state.action !== EarnPositionActionType.CREATED &&
                  state.action !== EarnPositionActionType.WITHDREW &&
                  state.action !== EarnPositionActionType.INCREASED
                ) {
                  return null;
                }

                const value: DataItemAction['value'] | undefined =
                  state.action === EarnPositionActionType.WITHDREW
                    ? state.withdrawn.find(({ token }) => token.address === position.strategy.asset.address)
                    : { amount: state.deposited, token: position.strategy.asset };

                if (!value) return null;

                return {
                  user: position.owner,
                  type:
                    state.action === EarnPositionActionType.CREATED
                      ? EarnPositionActionType.INCREASED
                      : (state.action as EarnPositionActionType.INCREASED | EarnPositionActionType.WITHDREW),
                  value,
                  timestamp: state.tx.timestamp,
                } satisfies DataItemAction;
              })
          );
        }) || []
      ).reduce<DataItemAction[]>((acc, userPos) => [...acc, ...userPos], []);

      const timestamps = actualData.map(({ timestamp }) => timestamp);

      userActions.forEach((action) => {
        const closestTimestamp = findClosestTimestamp(timestamps, action.timestamp);

        const dataItemIndex = actualData.findIndex(({ timestamp }) => timestamp === closestTimestamp);

        if (dataItemIndex !== -1) {
          actualData[dataItemIndex].actions.push(action);
        }
      });
    }

    const lastTimestamp = nowInSeconds() - 1; // Prevent to be considered as future data
    actualData.push({
      timestamp: lastTimestamp,
      tvl: currentTvl,
      name: DateTime.fromSeconds(lastTimestamp).toFormat('MMM d t'),
      actions: [],
      mode,
    });

    if (currentTvl === 0 || !extendExpectedReturns) {
      return actualData;
    }

    const apy = (earnings.year.total / currentTvl) * 100;

    const estReturns = orderBy(
      Array.from(Array(DAYS).keys()).reduce<DataItem[]>((acc, i) => {
        const nextTimestamp = lastTimestamp + Number(ONE_DAY) * i;
        const expectedTVL = calculateExpectedTVL(currentTvl, apy, i);

        acc.push({
          timestamp: nextTimestamp,
          estReturn: expectedTVL,
          name: DateTime.fromSeconds(Number(nextTimestamp)).toFormat('MMM d t'),
          mode,
          actions: [],
        });
        return acc;
      }, []),
      'timestamp',
      'asc'
    );

    return [...actualData, ...estReturns];
  }, [userStrategies, extendExpectedReturns, showDots, minPoints]);

  const organicGrowers: (keyof DataItem)[] = React.useMemo(() => ['estReturn'], []);

  return (
    <ContainerBox>
      {isLoading ? (
        <GraphSkeleton />
      ) : (
        <GraphContainer
          data={mappedData}
          height={190}
          addOrganicGrowthTo={organicGrowers}
          variationFactor={0.1}
          customDaysBackMap={CUSTOM_DAYS_BACK_MAP}
          defaultPeriod={AvailableDatePeriods.month}
        >
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
                  fill="url(#tvl)"
                  strokeWidth="2px"
                  dot={CustomDot}
                  activeDot={false}
                  stroke={colors[mode].violet.violet500}
                  dataKey="tvl"
                />
                {extendExpectedReturns && (
                  <>
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
                  </>
                )}
                <Tooltip
                  wrapperStyle={{ zIndex: 1000 }}
                  content={({ payload }) => (
                    <GraphTooltip
                      payload={payload}
                      emptyActionsTitle={emptyActionsTitle}
                      valueFormatter={(value) => `$${formatUsdAmount({ amount: Number(value), intl })}`}
                      showFilter={
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        !isUndefined(payload?.[0]?.payload?.timestamp) &&
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        DateTime.fromSeconds(payload?.[0]?.payload?.timestamp as number) < DateTime.now()
                      }
                    />
                  )}
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
                  tickFormatter={(value: string) => DateTime.fromSeconds(Number(value)).toFormat('MMM d')}
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).labelRegular }}
                />
                <YAxis
                  tickMargin={4}
                  width={30}
                  strokeWidth="0px"
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: string) => `$${formatUsdAmount({ amount: Number(value), intl })}`}
                  // @ts-expect-error no worries about the ones we send here
                  tick={{ fill: colors[mode].typography.typo3, ...buildTypographyVariant(mode).labelRegular }}
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
