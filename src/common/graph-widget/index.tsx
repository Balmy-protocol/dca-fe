import React from 'react';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import map from 'lodash/map';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import getPoolPrices from 'graphql/getPoolPrices.graphql';
import { AvailablePair, GetPairPriceResponseData, GetPairResponseSwapData, Token } from 'types';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { formatCurrencyAmount, toSignificantFromBigDecimal } from 'utils/currency';
import { ETH, WETH } from 'mocks/tokens';
import { BigNumber } from 'ethers';
import useDCAGraphql from 'hooks/useDCAGraphql';
import useUNIGraphql from 'hooks/useUNIGraphql';
import useAvailablePairs from 'hooks/useAvailablePairs';
import getPairPrices from 'graphql/getPairPrices.graphql';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { STABLE_COINS } from 'config/constants';

interface GraphWidgetProps {
  from: Token;
  to: Token;
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

const StyledPaper = styled(Paper)`
  padding: 8px;
  position: relative;
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const StyledTitleContainer = styled(Paper)`
  padding: 25px;
  border-radius: 10px;
  flex-grow: 0;
  background-color: #f6f6f6;
  border: 1px solid #f5f5f5;
  margin-bottom: 15px;
`;

const StyledGraphContainer = styled(Paper)`
  padding: 17px;
  flex-grow: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const StyledGraphAxis = styled.div`
  height: 0px;
  border: 1px dotted #b8b8b8;
  flex-grow: 0;
  margin-top: 20px;
`;

const StyledGraphAxisLabels = styled.div`
  flex-grow: 0;
  margin-top: 7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTabsContainer = styled(Paper)`
  padding: 17px;
  flex-grow: 0;
  display: flex;
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const PERIODS = [7, 30];

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
};
const GraphWidget = ({ from, to }: GraphWidgetProps) => {
  const client = useDCAGraphql();
  const uniClient = useUNIGraphql();
  let tokenA: GraphToken = EMPTY_GRAPH_TOKEN;
  let tokenB: GraphToken = EMPTY_GRAPH_TOKEN;
  let uniData: UniMappedPrice[] = [];
  let swapData: GetPairResponseSwapData[] = [];
  let prices: Prices = [];
  const [tabIndex, setTabIndex] = React.useState(0);
  const tabsStyles = appleTabsStylesHook.useTabs();
  const availablePairs = useAvailablePairs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  const dateFilter = React.useMemo(
    () => parseInt(DateTime.now().minus({ days: PERIODS[tabIndex] }).toFormat('X'), 10),
    [tabIndex]
  );
  const currentNetwork = useCurrentNetwork();

  if (to && from) {
    if (from.address < to.address) {
      tokenA = {
        ...(from.address === ETH.address ? WETH(currentNetwork.chainId) : from),
        symbol: from.symbol,
        isBaseToken: STABLE_COINS.includes(from.symbol),
      };
      tokenB = {
        ...(to.address === ETH.address ? WETH(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
    } else {
      tokenA = {
        ...(to.address === ETH.address ? WETH(currentNetwork.chainId) : to),
        symbol: to.symbol,
        isBaseToken: STABLE_COINS.includes(to.symbol),
      };
      tokenB = {
        ...(from.address === ETH.address ? WETH(currentNetwork.chainId) : from),
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
      name: DateTime.fromSeconds(parseInt(date, 10)).toFormat('MMM d t'),
      Uniswap: parseFloat(tokenPrice),
      date,
    }));
    const mappedSwapData = map(swapData, ({ executedAtTimestamp, ratePerUnitAToB, ratePerUnitBToA }) => ({
      name: DateTime.fromSeconds(parseInt(executedAtTimestamp, 10)).toFormat('MMM d t'),
      'Mean Finance':
        parseFloat(
          formatCurrencyAmount(
            BigNumber.from(tokenA.isBaseToken ? ratePerUnitBToA : ratePerUnitAToB),
            tokenA.isBaseToken ? tokenA : tokenB
          )
        ) || null,
      date: executedAtTimestamp,
    }));

    return orderBy([...mappedUniData, ...mappedSwapData], ['date'], ['desc']).reverse();
  }, [uniData, swapData]);

  const tooltipFormatter = (value: string) =>
    `1 ${tokenA.isBaseToken ? tokenB.symbol : tokenA.symbol} = ${tokenA.isBaseToken ? '$' : ''}${value} ${
      tokenA.isBaseToken ? '' : tokenB.symbol
    }`;
  const isLoading = loadingPool || loadingMeanData;
  const noData = prices.length === 0;

  return (
    <StyledPaper elevation={3}>
      <StyledTitleContainer elevation={0}>
        <Typography variant="body1">
          <FormattedMessage
            description="graph description"
            defaultMessage="{from}/{to} Chart"
            values={{
              from: tokenA.symbol,
              to: tokenB.symbol,
            }}
          />
        </Typography>
      </StyledTitleContainer>
      <StyledTabsContainer elevation={0}>
        <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
          <Tab classes={tabItemStyles} disableRipple label="1W" />
          <Tab classes={tabItemStyles} disableRipple label="1M" />
        </Tabs>
      </StyledTabsContainer>
      {isLoading ? (
        <CenteredLoadingIndicator />
      ) : (
        <>
          {noData ? (
            <StyledCenteredWrapper>
              <Typography variant="h6">
                <FormattedMessage
                  description="No data available"
                  defaultMessage="There is no data available about this pair"
                />
              </Typography>
            </StyledCenteredWrapper>
          ) : (
            <StyledGraphContainer elevation={0}>
              <ResponsiveContainer width="100%">
                <LineChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line connectNulls type="monotone" dataKey="Uniswap" stroke="#BD00FF" dot={false} />
                  {swapData.length && <Line connectNulls type="monotone" dataKey="Mean Finance" stroke="#36a3f5" />}
                  <XAxis hide dataKey="name" />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
              <StyledGraphAxis />
              <StyledGraphAxisLabels>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(prices[0].date, 10)).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(prices[prices.length - 1].date, 10)).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </StyledGraphAxisLabels>
            </StyledGraphContainer>
          )}
        </>
      )}
    </StyledPaper>
  );
};

export default React.memo(GraphWidget);
