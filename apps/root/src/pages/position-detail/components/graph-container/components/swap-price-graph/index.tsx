import React from 'react';

import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import { Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from 'recharts';
import { FormattedMessage } from 'react-intl';
import { Typography, colors, baseColors } from 'ui-library';
import { DCAPositionSwappedAction, Position, Token } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { FREQUENCY_TO_FORMAT, FREQUENCY_TO_MULTIPLIER, FREQUENCY_TO_PERIOD, STABLE_COINS } from '@constants';
import { formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import usePriceService from '@hooks/usePriceService';
import GraphTooltip from '../graph-tooltip';
import { useThemeMode } from '@state/config/hooks';
import { ActionTypeAction } from '@mean-finance/sdk';
import { GraphNoData, GraphNoPriceAvailable, GraphSkeleton } from '../graph-state';
import { StyledLegend, StyledLegendIndicator } from '../..';

interface AveragePriceGraphProps {
  position: Position;
}

interface PriceData {
  name: string;
  date: number;
  swap?: number;
  Defillama?: number;
}

type Prices = PriceData[];

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

const AveragePriceGraph = ({ position }: AveragePriceGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const [hasLoadedPrices, setHasLoadedPrices] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const priceService = usePriceService();
  const mode = useThemeMode();
  let tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  let tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
  tokenFromAverage =
    tokenFromAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? {
          ...wrappedProtocolToken,
          symbol: tokenFromAverage.symbol,
          underlyingTokens: tokenFromAverage.underlyingTokens,
        }
      : tokenFromAverage;
  tokenToAverage =
    tokenToAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenToAverage.symbol, underlyingTokens: tokenFromAverage.underlyingTokens }
      : tokenToAverage;

  const tokenA: GraphToken = {
    ...tokenFromAverage,
    isBaseToken: STABLE_COINS.includes(tokenFromAverage.symbol),
  };
  const tokenB: GraphToken = {
    ...tokenToAverage,
    isBaseToken: STABLE_COINS.includes(tokenToAverage.symbol),
  };

  React.useEffect(() => {
    const fetchTokenRate = async () => {
      if (!position) {
        return;
      }
      try {
        const swappedActions = orderBy(
          position.history?.filter((state) => state.action === ActionTypeAction.SWAPPED),
          ['createdAtTimestamp'],
          ['desc']
        ) as DCAPositionSwappedAction[];

        const defillamaPrices = await priceService.getPriceForGraph(
          tokenA,
          tokenB,
          0,
          position.chainId,
          swappedActions.length * FREQUENCY_TO_MULTIPLIER[position.swapInterval.toString()],
          FREQUENCY_TO_PERIOD[position.swapInterval.toString()],
          swappedActions[swappedActions.length - 1] && swappedActions[swappedActions.length - 1].tx.timestamp.toString()
        );

        const defiLlamaData =
          defillamaPrices.map(({ rate, timestamp }) => ({
            date: timestamp,
            tokenPrice: rate.toString(),
          })) || [];

        const mappedDefiLlamaData = map(defiLlamaData, ({ date, tokenPrice }) => ({
          name: DateTime.fromSeconds(date).toFormat(FREQUENCY_TO_FORMAT[position.swapInterval.toString()]),
          market: parseFloat(tokenPrice),
          date: date,
        }));

        const ratioBase: Record<string, bigint> = {};

        const swapData = swappedActions.reduce<{ swap: number; date: number; name: string }[]>((acc, action) => {
          ratioBase[action.tokenA.address] = action.ratioAToB;
          ratioBase[action.tokenB.address] = action.ratioBToA;

          const ratio = ratioBase[tokenFromAverage.address];

          acc.push({
            swap: parseFloat(formatCurrencyAmount(ratio, tokenToAverage, 9, 10)),
            date: action.tx.timestamp,
            name: DateTime.fromSeconds(action.tx.timestamp).toFormat(
              FREQUENCY_TO_FORMAT[position.swapInterval.toString()]
            ),
          });

          return acc;
        }, []);

        const mergedMap = orderBy([...mappedDefiLlamaData, ...swapData], ['date'], ['desc']).reverse();

        const index = findIndex(mergedMap, (item) => !!(item as { swap: number }).swap);

        setPrices(mergedMap.slice((index || 1) - 1));
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
  const hasActions = position.history?.filter((state) => state.action === ActionTypeAction.SWAPPED).length !== 0;

  if (isLoadingPrices) {
    <GraphSkeleton />;
  }

  if (noData && hasActions) {
    return <GraphNoPriceAvailable />;
  }

  if (noData) {
    return <GraphNoData />;
  }

  return (
    <ResponsiveContainer height={200}>
      <ComposedChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[mode].violet.violet500} stopOpacity={0.5} />
            <stop offset="95%" stopColor={colors[mode].violet.violet500} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          connectNulls
          legendType="none"
          type="monotone"
          fill="url(#colorUniswap)"
          strokeWidth="2px"
          dot={false}
          activeDot={false}
          stroke={colors[mode].violet.violet500}
          dataKey="market"
        />
        <CartesianGrid vertical={false} stroke={baseColors.disabledText} />
        <Line
          connectNulls
          legendType="none"
          type="monotone"
          strokeWidth="3px"
          stroke={colors[mode].violet.violet600}
          dot={{ strokeWidth: '3px', stroke: colors[mode].violet.violet600, fill: colors[mode].violet.violet600 }}
          strokeDasharray="5 5"
          dataKey="swap"
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
        <YAxis strokeWidth="0px" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ payload, label }) => (
            <GraphTooltip
              payload={payload}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              label={label}
              tokenA={tokenA}
              tokenB={tokenB}
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
    <>
      <StyledLegend>
        <StyledLegendIndicator fill={colors[mode].violet.violet500} />
        <Typography variant="bodySmall">
          <FormattedMessage description="marketPriceLegend" defaultMessage="Market price" />
        </Typography>
      </StyledLegend>
      <StyledLegend>
        <StyledLegendIndicator fill={colors[mode].violet.violet600} />
        <Typography variant="bodySmall">
          <FormattedMessage description="swapPriceLegend" defaultMessage="Swap" />
        </Typography>
      </StyledLegend>
    </>
  );
};

export default AveragePriceGraph;
