import React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
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
import getPool from 'graphql/getPool.graphql';
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

interface Price {
  name: string;
  Uniswap: number;
  'Mean Finance': number | null;
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

type graphToken = TokenWithBase;

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

const StyledGraph = styled.div`
  flex-grow: 1;
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

const mockedData = [
  {
    date: 1620604800,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18757',
    token0Price: '46.39432408662232590979904512692854',
    token1Price: '0.02155436079061979941377177773122095',
  },
  {
    date: 1620518400,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18756',
    token0Price: '2907.03864404869264090740198005893',
    token1Price: '0.0003439926751738254801792666997970276',
  },
  {
    date: 1620432000,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18755',
    token0Price: '4.295170087228260817199609179566408',
    token1Price: '0.2328196508383944694387373637776135',
  },
  {
    date: 1620345600,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18754',
    token0Price: '4.295170087228260817199609179566408',
    token1Price: '0.2328196508383944694387373637776135',
  },
  {
    date: 1620259200,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18753',
    token0Price: '37.10419708975148470304056210791087',
    token1Price: '0.02695112894051031917403075175128912',
  },
  {
    date: 1620172800,
    id: '0x40fde2952a0674a3e77707af270af09800657293-18752',
    token0Price: '115.3018787973154413619826736887575',
    token1Price: '0.008672885562930505082580673864334106',
  },
];

const PERIODS = [7, 30];

const STABLE_COINS = ['DAI', 'USDT', 'USDC', 'BUSD', 'UST'];

const averagePoolPrice = (prices: string[], token: Token) => {
  let result = 0;
  prices.forEach((price) => (result += parseFloat(toSignificantFromBigDecimal(price, 6))));

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
  let tokenA: graphToken = EMPTY_GRAPH_TOKEN;
  let tokenB: graphToken = EMPTY_GRAPH_TOKEN;
  let uniData: UniMappedPrice[] = [];
  let swapData: GetPairResponseSwapData[] = [];
  let prices: any = [];
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
    () => find(availablePairs, { token0: tokenA.address, token1: tokenB.address }) as AvailablePair | null,
    [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]
  );

  const { loading: loadingMeanData, data: pairData } = useQuery<GetPairPriceResponseData>(getPairPrices, {
    variables: {
      id: existingPair?.id,
    },
    skip: !existingPair,
    client,
  });

  const { loading: loadingPool, data } = useQuery<PoolsResponseData>(getPool, {
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
  let aggregatedPoolData: any = {};
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
              values: [...aggregatedPoolData[date], tokenA.isBaseToken ? token0Price : token1Price],
            };
          }
        });
      });

      return Object.keys(aggregatedPoolData).map((singleAggregatedPoolData) => ({
        date: singleAggregatedPoolData,
        tokenPrice: averagePoolPrice(
          aggregatedPoolData[singleAggregatedPoolData].values,
          tokenA.isBaseToken ? tokenB : tokenA
        ),
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

  const tooltipFormatter = (value: string, name: string) =>
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
          <Tab classes={tabItemStyles} disableRipple label={'1W'} />
          <Tab classes={tabItemStyles} disableRipple label={'1M'} />
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
                  {DateTime.fromSeconds(parseInt(uniData[0].date, 10)).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(uniData[uniData.length - 1].date, 10)).toLocaleString({
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
