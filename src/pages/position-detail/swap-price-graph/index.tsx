import React from 'react';
import { BigNumber } from 'ethers';
import map from 'lodash/map';
import findIndex from 'lodash/findIndex';
import styled from 'styled-components';
import { Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { FullPosition, Token } from 'types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import {
  FREQUENCY_TO_FORMAT,
  FREQUENCY_TO_MULTIPLIER,
  FREQUENCY_TO_PERIOD,
  POSITION_ACTIONS,
  STABLE_COINS,
} from 'config/constants';
import GraphTooltip from 'common/graph-tooltip';
import EmptyGraph from 'assets/svg/emptyGraph';
import { formatCurrencyAmount } from 'utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import usePriceService from 'hooks/usePriceService';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';

const StyledContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: transparent;
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
          position.history.filter((state) => state.action === POSITION_ACTIONS.SWAPPED),
          ['createdAtTimestamp'],
          ['desc']
        );
        // const createAction = position.history.filter((state) => state.action === POSITION_ACTIONS.CREATED);

        // console.log(swappedActions.length, FREQUENCY_TO_MULTIPLIER[position.swapInterval.interval], swappedActions.length * FREQUENCY_TO_MULTIPLIER[position.swapInterval.interval], FREQUENCY_TO_PERIOD[position.swapInterval.interval], createAction[0].createdAtTimestamp)
        const defillamaPrices = await priceService.getPriceForGraph(
          tokenA,
          tokenB,
          0,
          position.chainId,
          swappedActions.length * FREQUENCY_TO_MULTIPLIER[position.swapInterval.interval],
          FREQUENCY_TO_PERIOD[position.swapInterval.interval],
          swappedActions[0].createdAtTimestamp
        );

        const defiLlamaData =
          defillamaPrices.map(({ rate, timestamp }) => ({
            date: timestamp.toString(),
            tokenPrice: rate.toString(),
          })) || [];

        const mappedDefiLlamaData = map(defiLlamaData, ({ date, tokenPrice }) => ({
          name: DateTime.fromSeconds(parseInt(date, 10)).toFormat(FREQUENCY_TO_FORMAT[position.swapInterval.interval]),
          market: parseFloat(tokenPrice),
          date: parseInt(date, 10),
        }));

        const swapData = swappedActions.reduce<{ swap: number; date: number; name: string }[]>((acc, action) => {
          const rate =
            position.pair.tokenA.address ===
            ((tokenFromAverage.underlyingTokens[0] && tokenFromAverage.underlyingTokens[0].address) ||
              tokenFromAverage.address)
              ? BigNumber.from(action.pairSwap.ratioUnderlyingAToB)
              : BigNumber.from(action.pairSwap.ratioUnderlyingBToA);

          acc.push({
            swap: parseFloat(formatCurrencyAmount(rate, tokenToAverage, 9, 10)),
            date: parseInt(action.createdAtTimestamp, 10),
            name: DateTime.fromSeconds(parseInt(action.createdAtTimestamp, 10)).toFormat('MMM d t'),
          });

          return acc;
        }, []);

        const mergedMap = orderBy([...mappedDefiLlamaData, ...swapData], ['date'], ['desc']).reverse();

        const index = findIndex(mergedMap, (item) => !!(item as { swap: number }).swap);

        setPrices(mergedMap.slice(index - 1));
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
  const hasActions = position.history.filter((state) => state.action === POSITION_ACTIONS.SWAPPED).length !== 0;

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
                <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7C37ED" stopOpacity={0} />
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
              stroke="#7C37ED"
              dataKey="market"
            />
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" />
            <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#DCE2F9"
              dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
              strokeDasharray="5 5"
              dataKey="swap"
            />
            {/* <Area
              dataKey="range"
              stroke="#8884d8"
              strokeWidth={0}
              fill="url(#areaGradient)"
            /> */}
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

export const Legends = () => (
  <StyledHeader>
    <StyledLegendContainer>
      <StyledLegend>
        <StyledLegendIndicator fill="#7C37ED" />
        <Typography variant="body2">
          <FormattedMessage description="marketPriceLegend" defaultMessage="Market price" />
        </Typography>
      </StyledLegend>
      <StyledLegend>
        <StyledLegendIndicator fill="#DCE2F9" />
        <Typography variant="body2">
          <FormattedMessage description="swapPriceLegend" defaultMessage="Swap" />
        </Typography>
      </StyledLegend>
    </StyledLegendContainer>
  </StyledHeader>
);

export default AveragePriceGraph;
