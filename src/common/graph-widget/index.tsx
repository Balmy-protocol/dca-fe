import React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useQuery } from '@apollo/client';
import styled from 'styled-components';
import { Chart } from 'react-charts';
import AutoSizer from 'react-virtualized-auto-sizer';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import getPool from 'graphql/getPool.graphql';
import { Token } from 'types';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { toSignificantFromBigDecimal } from 'utils/currency';

interface GraphWidgetProps {
  from: Token;
  to: Token;
  client: ApolloClient<NormalizedCacheObject>;
}

interface Price {
  date: number;
  token0Price: string;
  token1Price: string;
}

interface PoolsResponseData {
  pools: {
    id: string;
    poolDayData: Price[];
  }[];
}

type graphToken = Token | { address: string; symbol: string; decimals: number };

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

const PERIODS = [14, 30];

const GraphWidget = ({ from, to, client }: GraphWidgetProps) => {
  let tokenA: graphToken = { address: '', symbol: '', decimals: 1 };
  let tokenB: graphToken = { address: '', symbol: '', decimals: 1 };
  let prices: Price[] = [];
  const [tabIndex, setTabIndex] = React.useState(0);
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();

  if (to && from) {
    if (from.address < to.address) {
      tokenA = from;
      tokenB = to;
    } else {
      tokenA = to;
      tokenB = from;
    }
  }

  const { loading: loadingPool, data } = useQuery<PoolsResponseData>(getPool, {
    variables: {
      tokenA: tokenA.address,
      tokenB: tokenB.address,
      from: parseInt(DateTime.now().minus({ days: PERIODS[tabIndex] }).toFormat('X'), 10),
    },
    skip: !(from && to),
    client,
  });

  const { pools } = data || {};

  if (pools && pools[0] && pools[0].poolDayData) {
    prices = [...pools[0].poolDayData];
    prices = mockedData;
    prices.reverse();
  }

  const graphData = React.useMemo(
    () => [
      {
        label: 'Series 1',
        data: prices.map(({ date, token1Price }) => [
          DateTime.fromSeconds(date).toFormat('MMM d t'),
          toSignificantFromBigDecimal(token1Price, 6),
        ]),
      },
    ],
    [prices]
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom', show: false },
      { type: 'linear', position: 'left', show: false },
    ],
    []
  );

  const tooltip = React.useMemo(
    () => ({
      render: ({ datum }: { datum: { yValue: string } }) => {
        return (
          <Typography variant="body2">{`${((datum && datum.yValue) || '').toString()} ${tokenB.symbol}`}</Typography>
        );
      },
    }),
    [tokenA, tokenB]
  );

  const isLoading = loadingPool;
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
              <StyledGraph>
                <AutoSizer>
                  {({ height, width }) => (
                    <div style={{ height, width }}>
                      <Chart data={graphData} axes={axes} primaryCursor tooltip={tooltip} />
                    </div>
                  )}
                </AutoSizer>
              </StyledGraph>
              <StyledGraphAxis />
              <StyledGraphAxisLabels>
                <Typography variant="caption">
                  {DateTime.fromSeconds(prices[0].date).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromSeconds(prices[prices.length - 1].date).toLocaleString({
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
