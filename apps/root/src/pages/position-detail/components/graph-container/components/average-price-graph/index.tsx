import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
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
import { FormattedMessage } from 'react-intl';
import { Typography, Paper, colors, baseColors } from 'ui-library';
import { FullPosition, Token } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS, STABLE_COINS } from '@constants';
import EmptyGraph from '@assets/svg/emptyGraph';
import { formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import GraphTooltip from '../graph-tooltip';
import { useThemeMode } from '@state/config/hooks';

const StyledContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledGraphContainer = styled.div`
  width: 100%;
  align-self: center;
  .recharts-surface {
    overflow: visible;
  }
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
`;

const StyledLegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const StyledLegendIndicator = styled.div<{ fill: string }>`
  width: 12px;
  height: 12px;
  background-color: ${({ fill }) => fill};
  border-radius: 99px;
`;
interface AveragePriceGraphProps {
  position: FullPosition;
}

interface PriceData {
  name: string;
  date: number;
  average: number;
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

  prices = React.useMemo(() => {
    const swappedActions = position.history.filter((state) => state.action === POSITION_ACTIONS.SWAPPED);

    const swappedSummed = swappedActions.reduce<{ summed: BigNumber; market: number; date: number; name: string }[]>(
      (acc, action, index) => {
        const rate =
          position.pair.tokenA.address ===
          ((tokenFromAverage.underlyingTokens[0] && tokenFromAverage.underlyingTokens[0].address) ||
            tokenFromAverage.address)
            ? BigNumber.from(action.pairSwap.ratioUnderlyingAToB)
            : BigNumber.from(action.pairSwap.ratioUnderlyingBToA);

        const prevSummed = (acc[index - 1] && acc[index - 1].summed) || BigNumber.from(0);
        acc.push({
          summed: prevSummed.add(rate),
          market: parseFloat(formatCurrencyAmount(rate, tokenToAverage, 9, 10)),
          date: parseInt(action.createdAtTimestamp, 10),
          name: DateTime.fromSeconds(parseInt(action.createdAtTimestamp, 10)).toFormat('MMM d t'),
        });

        return acc;
      },
      []
    );

    const swappedAverages = swappedSummed.map((swappedItem, index) => ({
      ...swappedItem,
      average: parseFloat(
        formatCurrencyAmount(swappedItem.summed.div(BigNumber.from(index + 1)), tokenToAverage, 9, 10)
      ),
    }));

    return orderBy(swappedAverages, ['date'], ['desc']).reverse();
  }, [position]);

  const averageBuyPrice = (prices[prices.length - 1] && prices[prices.length - 1].average) || 0;

  prices = React.useMemo(
    () => prices.map((price) => ({ ...price, average: averageBuyPrice })),
    [prices, averageBuyPrice]
  );

  // const intersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
  //   // Check if none of the lines are of length 0
  //   if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
  //     return false;
  //   }

  //   const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  //   // Lines are parallel
  //   if (denominator === 0) {
  //     return false;
  //   }

  //   const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  //   const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  //   // is the intersection along the segments
  //   if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
  //     return false;
  //   }

  //   // Return a object with the x and y coordinates of the intersection
  //   const x = x1 + ua * (x2 - x1);
  //   const y = y1 + ua * (y2 - y1);

  //   const line1isHigher = y1 > y3;
  //   const line1isHigherNext = y2 > y4;

  //   return { x, y, line1isHigher, line1isHigherNext };
  // }

  // const dataWithRange = prices.map((d) => ({
  //   ...d,
  //   range:
  //     d.average !== undefined && d.market !== undefined
  //       ? [d.average, d.market]
  //       : []
  // }));

  // // need to find intersections as points where we to change fill color
  // const intersections = prices
  //   .map((d, i) =>
  //     intersect(
  //       i,
  //       d.average,
  //       i + 1,
  //       prices[i + 1]?.average,
  //       i,
  //       d.market,
  //       i + 1,
  //       prices[i + 1]?.market
  //     )
  //   )
  //   .filter((d) => d && !isNaN(d.x));

  // // filtering out segments without intersections & duplicates (in case end market 2 segments are also
  // // start of 2 next segments)
  // const filteredIntersections = intersections.filter(
  //   (d, i) => i === intersections.length - 1 || (d as { x: number, y: number, line1isHigher: boolean, line1isHigherNext: boolean }).x !== (intersections[i - 1] as { x: number, y: number, line1isHigher: boolean, line1isHigherNext: boolean })?.x
  // ) as { x: number, y: number, line1isHigher: boolean, line1isHigherNext: boolean }[];

  const noData = prices.length === 0;

  // const getIntersectionColor = (_intersection: { x: number, y: number, line1isHigher: boolean, line1isHigherNext: boolean }, isLast?: boolean) => {
  //   if (isLast) {
  //     return _intersection.line1isHigherNext ? "red" : "blue";
  //   }

  //   return _intersection.line1isHigher ? "red" : "blue";
  // };

  if (noData) {
    return (
      <StyledCenteredWrapper>
        <EmptyGraph size="100px" />
        <Typography variant="h6">
          <FormattedMessage
            description="No data available"
            defaultMessage="There is no data available about this position yet"
          />
        </Typography>
      </StyledCenteredWrapper>
    );
  }

  return (
    <StyledContainer elevation={0}>
      <StyledGraphContainer>
        <ResponsiveContainer height={200}>
          <ComposedChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[mode].violet.violet600} stopOpacity={0.5} />
                <stop offset="95%" stopColor={colors[mode].violet.violet600} stopOpacity={0} />
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
              stroke={colors[mode].violet.violet600}
              dataKey="market"
            />
            <CartesianGrid vertical={false} stroke={baseColors.disabledText} />
            <ReferenceLine
              y={averageBuyPrice}
              label={
                <Label
                  value={averageBuyPrice}
                  position="insideBottomLeft"
                  fill={colors[mode].aqua.aqua600}
                  stroke={colors[mode].aqua.aqua600}
                  opacity={0.8}
                />
              }
              strokeWidth="3px"
              stroke={colors[mode].aqua.aqua600}
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
            {/* <defs>
              <linearGradient id="areaGradient">
                {filteredIntersections.length ? (
                  filteredIntersections.map((intersection, i) => {
                    const nextIntersection = filteredIntersections[i + 1];

                    let closeColor = "";
                    let startColor = "";

                    const isLast = i === filteredIntersections.length - 1;

                    if (isLast) {
                      closeColor = getIntersectionColor(intersection);
                      startColor = getIntersectionColor(intersection, true);
                    } else {
                      closeColor = getIntersectionColor(intersection);
                      startColor = getIntersectionColor(nextIntersection);
                    }

                    const offset =
                      intersection.x /
                      (prices.filter(
                        (d) =>
                          d.average !== undefined && d.market !== undefined
                      ).length -
                        1);

                    return (
                      <>
                        <stop
                          offset={offset}
                          stopColor={closeColor}
                          stopOpacity={0.9}
                        />
                        <stop
                          offset={offset}
                          stopColor={startColor}
                          stopOpacity={0.9}
                        />
                      </>
                    );
                  })
                ) : (
                  <stop
                    offset={0}
                    stopColor={
                      prices[0].average > prices[0].market ? "red" : "blue"
                    }
                  />
                )}
              </linearGradient>
            </defs> */}
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
      </StyledGraphContainer>
    </StyledContainer>
  );
};

export const Legends = () => {
  const mode = useThemeMode();
  return (
    <StyledHeader>
      <StyledLegendContainer>
        <StyledLegend>
          <StyledLegendIndicator fill={colors[mode].violet.violet600} />
          <Typography variant="bodySmall">
            <FormattedMessage description="marketPriceLegend" defaultMessage="Market price" />
          </Typography>
        </StyledLegend>
        <StyledLegend>
          <StyledLegendIndicator fill={colors[mode].aqua.aqua600} />
          <Typography variant="bodySmall">
            <FormattedMessage description="averageBuyPriceLegend" defaultMessage="Average buy price" />
          </Typography>
        </StyledLegend>
      </StyledLegendContainer>
    </StyledHeader>
  );
};

export default AveragePriceGraph;
