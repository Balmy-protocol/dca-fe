import React from 'react';
import {
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  Label,
} from 'recharts';
import { FormattedMessage, useIntl } from 'react-intl';
import { Typography, colors } from 'ui-library';
import { DCAPositionSwappedAction, Position, Token } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { STABLE_COINS } from '@constants';
import { formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import GraphTooltip from '../graph-tooltip';
import { useThemeMode } from '@state/config/hooks';
import { ActionTypeAction } from '@mean-finance/sdk';
import { calculateAvgBuyPrice } from '@common/utils/parsing';
import { GraphNoData } from '../graph-state';
import { StyledLegend, StyledLegendIndicator } from '../..';

interface AveragePriceGraphProps {
  position: Position;
}

interface PriceData {
  name: string;
  date: number;
  market: number;
}

type Prices = PriceData[];

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

const AveragePriceGraph = ({ position }: AveragePriceGraphProps) => {
  let prices: Prices = [];
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const mode = useThemeMode();
  const intl = useIntl();

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

  const avgBuyPrice = calculateAvgBuyPrice({ positionHistory: position.history, tokenFrom: tokenFromAverage });

  prices = React.useMemo(() => {
    const swappedActions = position.history?.filter(
      (state) => state.action === ActionTypeAction.SWAPPED
    ) as DCAPositionSwappedAction[];

    const ratioBase: Record<string, bigint> = {};

    const swappedSummed = swappedActions.reduce<{ market: number; date: number; name: string }[]>(
      (acc, { tokenA: pairTokenA, tokenB: pairTokenB, ratioAToB, ratioBToA, tx: { timestamp } }) => {
        ratioBase[pairTokenA.address] = ratioAToB;
        ratioBase[pairTokenB.address] = ratioBToA;

        const ratio = ratioBase[tokenFromAverage.address];

        acc.push({
          market: parseFloat(
            formatCurrencyAmount({ amount: ratio, token: tokenToAverage, sigFigs: 9, maxDecimals: 10, localize: false })
          ),
          date: timestamp,
          name: DateTime.fromSeconds(timestamp).toFormat('MMM d t'),
        });

        return acc;
      },
      []
    );

    return orderBy(swappedSummed, ['date'], ['desc']).reverse();
  }, [position]);

  const parsedAvgBuyPrice = formatCurrencyAmount({ amount: avgBuyPrice, token: tokenToAverage, sigFigs: 3, intl });
  const noData = prices.length === 0;

  if (noData) {
    return <GraphNoData />;
  }

  return (
    <ResponsiveContainer height={200}>
      <ComposedChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors[mode].violet.violet600} stopOpacity={0.5} />
            <stop offset="95%" stopColor={colors[mode].violet.violet600} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={colors[mode].border.border1} />
        <Area
          connectNulls
          legendType="none"
          type="monotone"
          fill="url(#colorUniswap)"
          strokeWidth="2px"
          dot={false}
          activeDot={false}
          stroke={colors[mode].violet.violet600}
          dataKey="market"
        />
        <ReferenceLine
          y={parsedAvgBuyPrice}
          label={
            <Label
              value={parsedAvgBuyPrice}
              position="insideBottomLeft"
              fill={colors[mode].violet.violet600}
              stroke={colors[mode].violet.violet600}
              opacity={0.8}
            />
          }
          strokeWidth="4px"
          stroke={colors[mode].violet.violet600}
          opacity={0.8}
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
        <Typography variant="bodySmallRegular">
          <FormattedMessage description="marketPriceLegend" defaultMessage="Market price" />
        </Typography>
      </StyledLegend>
      <StyledLegend>
        <StyledLegendIndicator fill={colors[mode].violet.violet600} />
        <Typography variant="bodySmallRegular">
          <FormattedMessage description="averageBuyPriceLegend" defaultMessage="Average buy price" />
        </Typography>
      </StyledLegend>
    </>
  );
};

export default AveragePriceGraph;
