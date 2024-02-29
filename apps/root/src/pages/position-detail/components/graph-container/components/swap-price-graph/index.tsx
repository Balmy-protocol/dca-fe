import React from 'react';

import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import styled from 'styled-components';
import { Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from 'recharts';
import { FormattedMessage } from 'react-intl';
import { Typography, Paper, colors, baseColors } from 'ui-library';
import { DCAPositionSwappedAction, Position, Token } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { FREQUENCY_TO_FORMAT, FREQUENCY_TO_MULTIPLIER, FREQUENCY_TO_PERIOD, STABLE_COINS } from '@constants';
import EmptyGraph from '@assets/svg/emptyGraph';
import { formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import usePriceService from '@hooks/usePriceService';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import GraphTooltip from '../graph-tooltip';
import { useThemeMode } from '@state/config/hooks';
import { ActionTypeAction } from '@mean-finance/sdk';

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
          swappedActions[0].tx.timestamp.toString()
        );

        const defiLlamaData =
          defillamaPrices.map(({ rate, timestamp }) => ({
            date: timestamp.toString(),
            tokenPrice: rate.toString(),
          })) || [];

        const mappedDefiLlamaData = map(defiLlamaData, ({ date, tokenPrice }) => ({
          name: DateTime.fromSeconds(parseInt(date, 10)).toFormat(
            FREQUENCY_TO_FORMAT[position.swapInterval.toString()]
          ),
          market: parseFloat(tokenPrice),
          date: parseInt(date, 10),
        }));

        const swapData = swappedActions.reduce<{ swap: number; date: number; name: string }[]>((acc, action) => {
          const rate =
            action.tokenA.address ===
            ((tokenFromAverage.underlyingTokens[0] && tokenFromAverage.underlyingTokens[0].address) ||
              tokenFromAverage.address)
              ? BigInt(action.ratioAToB)
              : BigInt(action.ratioBToA);

          acc.push({
            swap: parseFloat(formatCurrencyAmount(rate, tokenToAverage, 9, 10)),
            date: action.tx.timestamp,
            name: DateTime.fromSeconds(action.tx.timestamp).toFormat('MMM d t'),
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
  // const [defillamaprices, isLoadingDefillamaPrices] = useGraphPrice(tokenA, tokenB, tabIndex);

  const noData = prices.length === 0;
  const hasActions = position.history?.filter((state) => state.action === ActionTypeAction.SWAPPED).length !== 0;

  // const getIntersectionColor = (_intersection: { x: number, y: number, line1isHigher: boolean, line1isHigherNext: boolean }, isLast?: boolean) => {
  //   if (isLast) {
  //     return _intersection.line1isHigherNext ? "red" : "blue";
  //   }

  //   return _intersection.line1isHigher ? "red" : "blue";
  // };

  if (noData && hasActions) {
    return (
      <StyledCenteredWrapper>
        {isLoadingPrices && <CenteredLoadingIndicator />}
        {!isLoadingPrices && (
          <>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No price available"
                defaultMessage="We could not fetch the price of one of the tokens"
              />
            </Typography>
          </>
        )}
      </StyledCenteredWrapper>
    );
  }

  if (noData) {
    return (
      <StyledCenteredWrapper>
        {isLoadingPrices && <CenteredLoadingIndicator />}
        {!isLoadingPrices && (
          <>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No data available"
                defaultMessage="There is no data available about this position yet"
              />
            </Typography>
          </>
        )}
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
            <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke={colors[mode].aqua.aqua600}
              dot={{ strokeWidth: '3px', stroke: colors[mode].aqua.aqua600, fill: colors[mode].aqua.aqua600 }}
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
            <FormattedMessage description="swapPriceLegend" defaultMessage="Swap" />
          </Typography>
        </StyledLegend>
      </StyledLegendContainer>
    </StyledHeader>
  );
};

export default AveragePriceGraph;
