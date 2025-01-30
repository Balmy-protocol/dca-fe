import React from 'react';
import {
  DataItemAction,
  findClosestTimestamp,
  PERMITTED_ACTIONS,
} from '@common/components/earn/action-graph-components';
import { formatUsdAmount } from '@common/utils/currency';
import { compact, findLast, maxBy, orderBy } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { colors } from 'ui-library';
import { EarnPosition, EarnPositionActionType, Timestamp } from 'common-types';
import { parseUserStrategiesFinancialData } from '@common/utils/earn/parsing';
import { DateTime } from 'luxon';
import { nowInSeconds } from '@common/utils/time';
import { ONE_DAY } from '@constants';

export type TVLDataItem = {
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

export const findXPoint = (data: TVLDataItem[]) => {
  const reversedData = data.slice().reverse();

  return reversedData.find((d) => !!d.tvl)?.timestamp;
};

export const findYPoint = (data: TVLDataItem[]) => {
  const reversedData = data.slice().reverse();

  const lastTvl = reversedData.find((d) => !!d.tvl)?.tvl || 0;

  const maxTvl = maxBy(data, (d) => d.tvl)?.tvl || 0;

  return lastTvl + (maxTvl - lastTvl) / 2;
};

export const estReturnLabel = (
  { viewBox: { x } }: { viewBox: { x: number } },
  data: TVLDataItem[],
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

export const getDataForTVLGraph = ({
  userStrategies,
  mode,
  extendExpectedReturns = true,
  showDots = true,
  minPoints = 0,
}: {
  userStrategies: EarnPosition[];
  mode: 'light' | 'dark';
  extendExpectedReturns?: boolean;
  showDots?: boolean;
  minPoints?: number;
}) => {
  const { earnings, totalInvestedUsd: currentTvl } = parseUserStrategiesFinancialData(userStrategies);

  const tvlKey: Record<Timestamp, number> = {};

  // Get all unique timestamps from historical balances
  const allTimestamps = new Set<number>();

  userStrategies.forEach((strategy) => {
    strategy.historicalBalances.forEach((balance) => {
      allTimestamps.add(balance.timestamp);
    });
  });

  // For each timestamp, calculate total TVL
  Array.from(allTimestamps).forEach((timestamp) => {
    tvlKey[timestamp] = 0;

    userStrategies.forEach((strategy) => {
      // Timestamps added from recent transactions would not be available for all user strategies
      // We find the exact match or the first previous balance
      const matchingBalance = findLast(strategy.historicalBalances, (b) => b.timestamp <= timestamp);

      if (matchingBalance) {
        const balanceSum = matchingBalance.balances.reduce((acc, b) => acc + Number(b.amount.amountInUSD || 0), 0);
        tvlKey[timestamp] += balanceSum;
      }
    });
  });

  const actualData = orderBy(
    Object.entries(tvlKey).map(([timestamp, tvl]) => ({
      timestamp: Number(timestamp),
      tvl,
      name: DateTime.fromSeconds(Number(timestamp)).toFormat('MMM d t'),
      actions: [],
      mode,
    })) as TVLDataItem[],
    'timestamp',
    'asc'
    // Now lets merge all the data that has the same name
  ).reduce<TVLDataItem[]>((acc, item) => {
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
    Array.from(Array(DAYS).keys()).reduce<TVLDataItem[]>((acc, i) => {
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
};
