import React from 'react';

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ComposedChart,
  Tooltip,
  Area,
  ReferenceLine,
} from 'recharts';
import { FormattedMessage } from 'react-intl';
import { Typography, colors } from 'ui-library';
import { DCAPositionCreatedAction, DCAPositionModifiedAction, DCAPositionSwappedAction, Position } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import usePriceService from '@hooks/usePriceService';
import { formatUnits } from 'viem';
import ProfitLossTooltip from './tooltip';
import { useThemeMode } from '@state/config/hooks';
import { ActionTypeAction, DCAPositionAction } from '@balmy/sdk';
import { GraphNoData, GraphNoPriceAvailable, GraphSkeleton } from '../graph-state';
import { StyledLegend, StyledLegendIndicator } from '../..';

interface ProfitLossGraphProps {
  position: Position;
}

interface PriceData {
  name: string;
  date: number;
  swappedIfLumpSum: bigint;
  swappedIfDCA: bigint;
  percentage: bigint;
}

interface SubPosition {
  amountLeft: bigint;
  ratePerUnit: bigint;
}

type Prices = PriceData[];

const tickFormatter = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return `${parseFloat(preciseValue).toString()}%`;
};

const POINT_LIMIT = 30;

const SWAPPED_ACTIONS = [ActionTypeAction.SWAPPED];
const ACTIONS_TO_FILTER = [ActionTypeAction.MODIFIED, ActionTypeAction.SWAPPED, ActionTypeAction.CREATED];

const getFunds = (positionAction: DCAPositionModifiedAction) => {
  const { rate, oldRate, remainingSwaps, oldRemainingSwaps } = positionAction;

  const previousRate = BigInt(oldRate);
  const currentRate = BigInt(rate);
  const previousRemainingSwaps = BigInt(oldRemainingSwaps);
  const currentRemainingSwaps = BigInt(remainingSwaps);
  const oldFunds = previousRate * previousRemainingSwaps;
  const newFunds = currentRate * currentRemainingSwaps;

  return {
    oldFunds,
    newFunds,
  };
};

const isIncrease = (positionAction: DCAPositionAction) => {
  const { action } = positionAction;

  if (action !== ActionTypeAction.MODIFIED) {
    return false;
  }

  const { oldFunds, newFunds } = getFunds(positionAction);

  return newFunds > oldFunds;
};

const isReduce = (positionAction: DCAPositionAction) => {
  const { action } = positionAction;

  if (action !== ActionTypeAction.MODIFIED) {
    return false;
  }
  const { oldFunds, newFunds } = getFunds(positionAction);

  return newFunds < oldFunds;
};

const ProfitLossGraph = ({ position }: ProfitLossGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const [hasLoadedPrices, setHasLoadedPrices] = React.useState(false);
  const priceService = usePriceService();
  const mode = useThemeMode();

  React.useEffect(() => {
    const fetchTokenRate = async () => {
      if (!position) {
        return;
      }
      try {
        const filteredPositionActions = (position.history?.filter((action) =>
          ACTIONS_TO_FILTER.includes(action.action)
        ) || []) as (DCAPositionModifiedAction | DCAPositionSwappedAction | DCAPositionCreatedAction)[];
        const newPrices: Prices = [];

        const fromMagnitude = 10n ** BigInt(position.from.decimals);
        const toMagnitude = 10n ** BigInt(position.to.decimals);
        const subPositions: SubPosition[] = [];

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < filteredPositionActions.length; i++) {
          const positionAction = filteredPositionActions[i];
          const {
            rate,
            tx: { timestamp },
          } = positionAction;
          const currentRate = BigInt(rate || 0);

          if (positionAction.action === ActionTypeAction.CREATED) {
            // eslint-disable-next-line no-await-in-loop
            const fetchedPrices = await priceService.getUsdHistoricPrice(
              [position.from, position.to],
              timestamp.toString(),
              position.chainId
            );

            const fetchedTokenFromPrice = fetchedPrices[position.from.address];
            const fetchedTokenToPrice = fetchedPrices[position.to.address];
            const deposited = BigInt(positionAction.swaps) * currentRate;

            const originalRatePerUnitFromToTo = (fetchedTokenFromPrice * toMagnitude) / fetchedTokenToPrice;
            subPositions.push({ amountLeft: deposited, ratePerUnit: originalRatePerUnitFromToTo });

            newPrices.push({
              date: timestamp,
              name: DateTime.fromSeconds(timestamp).toFormat('MMM d t'),
              swappedIfLumpSum: 0n,
              swappedIfDCA: 0n,
              percentage: 0n,
            });
          }

          if (positionAction.action === ActionTypeAction.MODIFIED && isIncrease(positionAction)) {
            const { oldFunds, newFunds } = getFunds(positionAction);

            const amountAdded = newFunds - oldFunds;

            // eslint-disable-next-line no-await-in-loop
            const fetchedPrices = await priceService.getUsdHistoricPrice(
              [position.from, position.to],
              timestamp.toString(),
              position.chainId
            );

            const fetchedTokenFromPrice = fetchedPrices[position.from.address];
            const fetchedTokenToPrice = fetchedPrices[position.to.address];

            const ratePerUnit = (fetchedTokenFromPrice * toMagnitude) / fetchedTokenToPrice;

            subPositions.push({ amountLeft: amountAdded, ratePerUnit });
          }

          if (positionAction.action === ActionTypeAction.MODIFIED && isReduce(positionAction)) {
            const { oldFunds, newFunds } = getFunds(positionAction);

            let amountWithdrawn = oldFunds - newFunds;

            for (let j = subPositions.length - 1; j >= 0 && amountWithdrawn > 0n; j -= 1) {
              const { amountLeft } = subPositions[j];
              if (amountWithdrawn >= amountLeft) {
                subPositions.splice(j, 1);
                amountWithdrawn = amountWithdrawn - amountLeft;
              } else {
                subPositions[j].amountLeft = subPositions[j].amountLeft - amountWithdrawn;
                amountWithdrawn = 0n;
              }
            }
          }

          if (positionAction.action === ActionTypeAction.SWAPPED) {
            const totalDeposited = subPositions.reduce((acc, subPosition) => acc + subPosition.amountLeft, 0n);
            const oldSwappedIfLumpSum =
              (newPrices[newPrices.length - 1] && newPrices[newPrices.length - 1].swappedIfLumpSum) || 0n;
            const oldSwappedIfDCA =
              (newPrices[newPrices.length - 1] && newPrices[newPrices.length - 1].swappedIfDCA) || 0n;
            let swappedIfLumpSum = BigInt(oldSwappedIfLumpSum);
            const swappedIfDCA = BigInt(oldSwappedIfDCA) + positionAction.swapped;

            for (let j = subPositions.length - 1; j >= 0; j -= 1) {
              const { amountLeft, ratePerUnit } = subPositions[j];
              // We do it this way, first multiply and then divide, and avoid losing precision
              const lumpSum = (currentRate * amountLeft * ratePerUnit) / totalDeposited / fromMagnitude;

              swappedIfLumpSum = swappedIfLumpSum + lumpSum;

              let spentFromPosition = (currentRate * amountLeft) / totalDeposited;
              if ((currentRate * amountLeft) % totalDeposited !== 0n) {
                // We are rounding up, so that we are not left with really small amounts that are very difficult to spen
                spentFromPosition = spentFromPosition + 1n;
              }

              const remainingLeft = amountLeft - spentFromPosition;
              if (remainingLeft <= 0n) {
                subPositions.splice(j, 1);
              } else {
                subPositions[j].amountLeft = remainingLeft;
              }
            }

            const percentage = (swappedIfDCA * toMagnitude) / swappedIfLumpSum / toMagnitude;

            newPrices.push({
              date: timestamp,
              name: DateTime.fromSeconds(timestamp).toFormat('MMM d t'),
              swappedIfLumpSum,
              swappedIfDCA,
              percentage,
            });
          }
        }

        setPrices(newPrices);
      } finally {
        setIsLoadingPrices(false);
        setHasLoadedPrices(true);
      }
    };

    if (prices.length === 0 && !isLoadingPrices && !hasLoadedPrices) {
      setIsLoadingPrices(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      fetchTokenRate();
    }
  }, [position, isLoadingPrices]);

  const noData = prices.length === 0;
  const hasActions = position.history?.filter((action) => SWAPPED_ACTIONS.includes(action.action)).length !== 0;

  const mappedPrices = prices.map((price) => {
    const swappedIfDCA = formatUnits(price.swappedIfDCA, position.to.decimals);
    const swappedIfLumpSum = formatUnits(price.swappedIfLumpSum, position.to.decimals);

    let percentage = 0;

    if (parseFloat(swappedIfLumpSum) > 0) {
      percentage = (parseFloat(swappedIfDCA) / parseFloat(swappedIfLumpSum) - 1) * 100;
    }

    return {
      ...price,
      swappedIfDCA: parseFloat(swappedIfDCA),
      swappedIfLumpSum: parseFloat(swappedIfLumpSum),
      rawSwappedIfDCA: price.swappedIfDCA,
      rawSwappedIfLumpSum: price.swappedIfLumpSum,
      percentage,
      rawPercentage: price.percentage,
    };
  });

  const gradientOffset = () => {
    const dataMax = Math.max(...mappedPrices.map((i) => i.percentage));
    const dataMin = Math.min(...mappedPrices.map((i) => i.percentage));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  if (isLoadingPrices) {
    return <GraphSkeleton />;
  }

  if (noData && hasActions) {
    return <GraphNoPriceAvailable />;
  }

  if (noData) {
    return <GraphNoData />;
  }

  return (
    <ResponsiveContainer height={200}>
      <ComposedChart
        data={orderBy(mappedPrices, ['date'], ['desc']).reverse()}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <defs>
          <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[mode].violet.violet600} stopOpacity={0.5} />
            <stop offset="95%" stopColor={colors[mode].violet.violet600} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
        <ReferenceLine y={0} stroke={colors[mode].violet.violet600} strokeDasharray="3 3" />
        <Area
          connectNulls
          legendType="none"
          type="monotone"
          strokeWidth="3px"
          stroke={colors[mode].violet.violet600}
          dot={
            mappedPrices.length <= POINT_LIMIT && {
              strokeWidth: '3px',
              stroke: colors[mode].violet.violet600,
              fill: colors[mode].violet.violet600,
            }
          }
          strokeDasharray="5 5"
          dataKey="percentage"
          fill="url(#splitColor)"
        />
        <defs>
          <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[mode].violet.violet600} stopOpacity={0.5} />
            <stop offset="95%" stopColor={colors[mode].violet.violet600} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off * 0.05} stopColor={colors[mode].semantic.success.darker} stopOpacity={1} />
            <stop offset={off} stopColor={colors[mode].semantic.success.darker} stopOpacity={0.1} />
            <stop offset={off} stopColor={colors[mode].semantic.error.darker} stopOpacity={0.1} />
            <stop offset={off * 1.95} stopColor={colors[mode].semantic.error.darker} stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          interval="preserveStartEnd"
          tickMargin={4}
          minTickGap={30}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}
        />
        <YAxis
          strokeWidth="0px"
          domain={['auto', 'auto']}
          axisLine={false}
          tickLine={false}
          tickFormatter={tickFormatter}
          // tickFormatter={(tick: string) => `${tick}%`}
        />
        <Tooltip
          content={({ payload, label }) => (
            <ProfitLossTooltip
              payload={payload}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              label={label}
              tokenTo={position.to}
            />
          )}
        />
        <Legend />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const Legends = () => {
  const mode = useThemeMode();
  return (
    <StyledLegend>
      <StyledLegendIndicator fill={colors[mode].violet.violet600} />
      <Typography variant="bodySmallRegular">
        <FormattedMessage description="swappedIfDca" defaultMessage="DCA vs Lump Sum Profit %" />
      </Typography>
    </StyledLegend>
  );
};

export default ProfitLossGraph;
