import React from 'react';

import { ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, Line, ComposedChart, Tooltip } from 'recharts';
import { FormattedMessage } from 'react-intl';
import { Typography, colors, baseColors } from 'ui-library';
import { DCAPositionSwappedAction, Position } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import usePriceService from '@hooks/usePriceService';
import { formatUnits } from 'viem';
import GasSavedTooltip from './tooltip';
import { useThemeMode } from '@state/config/hooks';
import useAggregatorService from '@hooks/useAggregatorService';
import { SORT_LEAST_GAS } from '@constants/aggregator';
import { ActionTypeAction } from '@mean-finance/sdk';
import { StyledLegend, StyledLegendIndicator } from '../..';
import { GraphNoData, GraphNoPriceAvailable, GraphSkeleton } from '../graph-state';

interface PriceData {
  name: string;
  date: number;
  gasSaved: number;
  gasSavedRaw: bigint;
}

type Prices = PriceData[];

interface GasSavedGraphProps {
  position: Position;
}

const POINT_LIMIT = 30;

const tickFormatter = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return parseFloat(preciseValue).toString();
};

const GasSavedGraph = ({ position }: GasSavedGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const [hasLoadedPrices, setHasLoadedPrices] = React.useState(false);
  const priceService = usePriceService();
  const mode = useThemeMode();
  const aggregatorService = useAggregatorService();

  React.useEffect(() => {
    const fetchGasSaved = async () => {
      if (!position) {
        return;
      }
      try {
        const filteredPositionActions = position.history?.filter(
          (action) => action.action === ActionTypeAction.SWAPPED
        ) as DCAPositionSwappedAction[];

        const protocolTokenHistoricPrices = await priceService.getProtocolHistoricPrices(
          filteredPositionActions.map(({ tx: { timestamp } }) => timestamp.toString()),
          position.chainId
        );

        const options = await aggregatorService.getSwapOptions(
          position.from,
          position.to,
          position.rate.amount,
          undefined,
          SORT_LEAST_GAS,
          undefined,
          undefined,
          undefined,
          undefined,
          position.chainId
        );

        const filteredOptions = options.filter(({ gas }) => !!gas);
        const leastAffordableOption = filteredOptions[filteredOptions.length - 1];

        const { gas } = leastAffordableOption;

        if (!gas) {
          return;
        }

        const { estimatedGas } = gas;

        const newPrices: Prices = filteredPositionActions.map(({ tx: { gasPrice, timestamp } }) => {
          return {
            date: timestamp,
            name: DateTime.fromSeconds(timestamp).toFormat('MMM d t'),
            gasSavedRaw: estimatedGas * BigInt(gasPrice || 0) * protocolTokenHistoricPrices[timestamp],
            gasSaved: 0,
          };
        });

        setPrices(newPrices);
      } finally {
        setIsLoadingPrices(false);
        setHasLoadedPrices(true);
      }
    };

    if (prices.length === 0 && !isLoadingPrices && !hasLoadedPrices) {
      setIsLoadingPrices(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      fetchGasSaved();
    }
  }, [position, isLoadingPrices]);

  const noData = prices.length === 0;
  const hasActions = position.history?.filter((action) => action.action === ActionTypeAction.SWAPPED).length !== 0;

  const mappedPrices = prices
    .reduce<Prices>((acc, price, index) => {
      acc.push({
        ...price,
        // 18 for protocolToken decimals and 18 for usd decimals
        gasSaved: parseFloat(formatUnits(price.gasSavedRaw, 36)) + (acc[index - 1]?.gasSaved || 0),
      });
      return acc;
    }, [])
    .slice(-POINT_LIMIT);

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
        <CartesianGrid vertical={false} stroke={baseColors.disabledText} />
        <Line
          connectNulls
          legendType="none"
          type="monotone"
          strokeWidth="3px"
          stroke={colors[mode].violet.violet600}
          dot={{ strokeWidth: '3px', stroke: colors[mode].violet.violet600, fill: colors[mode].violet.violet600 }}
          strokeDasharray="5 5"
          dataKey="gasSaved"
        />
        <XAxis
          tickMargin={30}
          minTickGap={30}
          interval="preserveStartEnd"
          dataKey="name"
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
            <GasSavedTooltip
              payload={payload}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              label={label}
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
        <FormattedMessage description="gasSavedBullet" defaultMessage="Gas saved in USD" />
      </Typography>
    </StyledLegend>
  );
};

export default GasSavedGraph;
