import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { ResponsiveContainer, XAxis, YAxis, Legend, Area, Line, ComposedChart, Tooltip } from 'recharts';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import map from 'lodash/map';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import getPoolPrices from 'graphql/getPoolPrices.graphql';
import { AvailablePair, GetPairPriceResponseData, GetPairResponseSwapData, Token } from 'types';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from 'utils/currency';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from 'mocks/tokens';
import { BigNumber } from 'ethers';
import useDCAGraphql from 'hooks/useDCAGraphql';
import useUNIGraphql from 'hooks/useUNIGraphql';
import useAvailablePairs from 'hooks/useAvailablePairs';
import getPairPrices from 'graphql/getPairPrices.graphql';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { FOUR_HOURS, ONE_DAY, STABLE_COINS, TOKEN_TYPE_BASE } from 'config/constants';
import GraphFooter from 'common/graph-footer';
import EmptyGraph from 'assets/svg/emptyGraph';
import MinimalTabs from 'common/minimal-tabs';

interface GraphWidgetProps {
  from: Token | null;
  to: Token | null;
}

interface UniMappedPrice {
  date: string;
  tokenPrice: string;
}
interface UniPrice {
  date: number;
  token0Price: string;
  token1Price: string;
}
interface PoolsResponseData {
  pools: {
    id: string;
    poolHourData: UniPrice[];
  }[];
}

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

interface PriceMeanData {
  name: string;
  'Mean Finance': number | null;
  date: string;
}
interface PriceUniData {
  name: string;
  Uniswap: number;
  date: string;
}

type Prices = (PriceMeanData | PriceUniData)[];

const StyledPaper = styled(Paper)<{ $column?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledGraphContainer = styled(Paper)`
  flex-grow: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: transparent;
  margin-bottom: 30px;

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
  gap: 10px;
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

const PERIODS = [7, 30, 1];

const GRAPH_FILTER = [ONE_DAY.toString(), ONE_DAY.toString(), FOUR_HOURS.toString()];

const averagePoolPrice = (prices: string[]) => {
  let result = 0;
  prices.forEach((price) => {
    result += parseFloat(toSignificantFromBigDecimal(price, 6));
  });

  return toSignificantFromBigDecimal((result / prices.length).toString(), 6);
};

const EMPTY_GRAPH_TOKEN: TokenWithBase = {
  address: '',
  symbol: '',
  decimals: 1,
  isBaseToken: false,
  name: '',
  chainId: 0,
  type: TOKEN_TYPE_BASE,
  underlyingTokens: [],
};
const GraphWidget = ({ from, to }: GraphWidgetProps) => {
  const client = useDCAGraphql();
  const uniClient = useUNIGraphql();
  let tokenA: GraphToken = EMPTY_GRAPH_TOKEN;
  let tokenB: GraphToken = EMPTY_GRAPH_TOKEN;
  let uniData: UniMappedPrice[] = [];
  let swapData: GetPairResponseSwapData[] = [];
  let prices: Prices = [];
  const [selectedItem, setSelectedItem] = React.useState<{ value?: number }[]>([]);
  const [tabIndex, setTabIndex] = React.useState(0);
  const availablePairs = useAvailablePairs();
  const dateFilter = React.useMemo(
    () => parseInt(DateTime.now().minus({ days: PERIODS[tabIndex] }).toFormat('X'), 10),
    [tabIndex]
  );
  const currentNetwork = useCurrentNetwork();

  if (to && from) {
    const toAddress =
      to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId).address : to.address;
    const fromAddress =
      from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId).address : from.address;

    if (fromAddress < toAddress) {
      tokenA = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
      tokenB = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
    } else {
      tokenA = {
        ...(to.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
      tokenB = {
        ...(from.address === PROTOCOL_TOKEN_ADDRESS ? getWrappedProtocolToken(currentNetwork.chainId) : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
    }
  }

  const existingPair = React.useMemo(
    () =>
      find(
        availablePairs,
        (pair) => pair.token0.address === tokenA.address && pair.token1.address === tokenB.address
      ) as AvailablePair | null,
    [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]
  );

  const { loading: loadingMeanData, data: pairData } = useQuery<GetPairPriceResponseData>(getPairPrices, {
    variables: {
      id: existingPair?.id,
      minInterval: GRAPH_FILTER[tabIndex],
    },
    skip: !existingPair,
    client,
  });

  const { loading: loadingPool, data } = useQuery<PoolsResponseData>(getPoolPrices, {
    variables: {
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      from: dateFilter,
    },
    skip: !(from && to),
    client: uniClient,
  });

  const { pools } = data || {};
  const { pair } = pairData || {};
  const aggregatedPoolData: Record<string, { values: string[] }> = {};
  uniData = React.useMemo(() => {
    if (pools && pools[0] && pools[0].poolHourData) {
      pools.forEach((pool) => {
        pool.poolHourData.forEach(({ date, token1Price, token0Price }) => {
          if (!aggregatedPoolData[date]) {
            aggregatedPoolData[date] = {
              values: [tokenA.isBaseToken ? token0Price : token1Price],
            };
          } else {
            aggregatedPoolData[date] = {
              values: [...aggregatedPoolData[date].values, tokenA.isBaseToken ? token0Price : token1Price],
            };
          }
        });
      });

      return Object.keys(aggregatedPoolData).map((singleAggregatedPoolData) => ({
        date: singleAggregatedPoolData,
        tokenPrice: averagePoolPrice(aggregatedPoolData[singleAggregatedPoolData].values),
      }));
    }

    return [];
  }, [pools, loadingPool]);
  swapData = React.useMemo(() => {
    if (pair && pair.swaps) {
      return pair.swaps.filter((swap) => parseInt(swap.executedAtTimestamp, 10) >= dateFilter);
    }

    return [];
  }, [pair, loadingMeanData, dateFilter]);

  prices = React.useMemo(() => {
    const mappedUniData = map(uniData, ({ date, tokenPrice }) => ({
      name: DateTime.fromSeconds(parseInt(date, 10)).toFormat(tabIndex === 2 ? 't' : 'MMM d'),
      Uniswap: parseFloat(tokenPrice),
      date,
    }));
    const mappedSwapData = map(swapData, ({ executedAtTimestamp, ratioUnderlyingAToB, ratioUnderlyingBToA }) => ({
      name: DateTime.fromSeconds(parseInt(executedAtTimestamp, 10)).toFormat(tabIndex === 2 ? 't' : 'MMM d'),
      'Mean Finance':
        parseFloat(
          formatCurrencyAmount(
            BigNumber.from(tokenA.isBaseToken ? ratioUnderlyingBToA : ratioUnderlyingAToB),
            tokenA.isBaseToken ? tokenA : tokenB
          )
        ) || null,
      date: executedAtTimestamp,
    }));

    return orderBy([...mappedUniData, ...mappedSwapData], ['date'], ['desc']).reverse();
  }, [uniData, swapData]);

  const isLoading = loadingPool || loadingMeanData;
  // const isLoading = loadingPool || loadingMeanData || isLoadingOracle;
  const noData = prices.length === 0;

  const selectedItemValue = selectedItem.reduce(
    (acc, item) => item.value || acc,
    (prices &&
      prices.length &&
      ((prices[prices.length - 1] as PriceUniData).Uniswap ||
        (prices[prices.length - 1] as PriceMeanData)['Mean Finance'])) ||
      0
  );

  if (isLoading) {
    return (
      <StyledPaper variant="outlined" $column>
        <CenteredLoadingIndicator />
        <GraphFooter />
      </StyledPaper>
    );
  }

  if (!from || !to) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No pair selected"
                defaultMessage="Select a pair to view its price history"
              />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
        <GraphFooter />
      </StyledPaper>
    );
  }

  if (noData) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No data available"
                defaultMessage="There is no data available about this pair"
              />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
        <GraphFooter />
      </StyledPaper>
    );
  }

  return (
    <StyledPaper variant="outlined" $column>
      <StyledGraphContainer elevation={0}>
        <StyledHeader>
          <StyledTitleContainer>
            <Typography variant="h6">
              <FormattedMessage
                description="graph description"
                defaultMessage="{from}/{to}"
                values={{
                  from: tokenA.symbol,
                  to: tokenB.symbol,
                }}
              />
            </Typography>
            <MinimalTabs
              options={[
                { key: 2, label: 'Day' },
                { key: 0, label: 'Week' },
                { key: 1, label: 'Month' },
              ]}
              selected={{ key: tabIndex, label: '' }}
              onChange={({ key }) => setTabIndex(key as number)}
            />
          </StyledTitleContainer>
          <StyledLegendContainer>
            <Typography variant="h6">
              <FormattedMessage
                description="graph selectedItemValue"
                defaultMessage="{prefix}{value} {token}"
                values={{
                  prefix: tokenA.isBaseToken ? '$' : '',
                  value: selectedItemValue,
                  token: tokenA.isBaseToken ? 'USD' : tokenB.symbol,
                }}
              />
            </Typography>
          </StyledLegendContainer>
          <StyledLegendContainer>
            {!!uniData.length && (
              <StyledLegend>
                <StyledLegendIndicator fill="#7C37ED" />
                <Typography variant="body2">
                  <FormattedMessage description="uniswapLegend" defaultMessage="Uniswap" />
                </Typography>
              </StyledLegend>
            )}
            {!!swapData.length && (
              <StyledLegend>
                <StyledLegendIndicator fill="#DCE2F9" />
                <Typography variant="body2">
                  <FormattedMessage description="meanFinanceLegend" defaultMessage="Mean Finance" />
                </Typography>
              </StyledLegend>
            )}
          </StyledLegendContainer>
        </StyledHeader>
        <ResponsiveContainer width="100%">
          <ComposedChart
            data={prices}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            style={{ overflow: 'visible' }}
            onMouseMove={({ activePayload }) => activePayload && setSelectedItem(activePayload)}
            onMouseLeave={() => setSelectedItem([])}
          >
            <defs>
              <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7C37ED" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" /> */}
            {uniData.length && (
              <Area
                legendType="none"
                name="uniswap"
                connectNulls
                dataKey="Uniswap"
                fill="url(#colorUniswap)"
                strokeWidth="2px"
                dot={false}
                activeDot={false}
                stroke="#7C37ED"
              />
            )}
            {swapData.length && (
              <Line
                legendType="none"
                connectNulls
                dataKey="Mean Finance"
                type="monotone"
                strokeWidth="3px"
                stroke="#DCE2F9"
                dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
                strokeDasharray="5 5"
              />
            )}
            <XAxis
              tickMargin={30}
              minTickGap={30}
              interval="preserveStartEnd"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              // tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}
            />
            <YAxis strokeWidth="0px" domain={['auto', 'auto']} axisLine={false} tickLine={false} hide />
            <Tooltip content={<></>} />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </StyledGraphContainer>
      <GraphFooter />
    </StyledPaper>
  );
};

export default React.memo(GraphWidget);
