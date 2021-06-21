import React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { Chart } from 'react-charts';
import AutoSizer from 'react-virtualized-auto-sizer';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import getPool from 'graphql/getPool.graphql';
import getTokenPrices from 'graphql/getTokenPrices.graphql';
import { Token } from 'common/wallet-context';
import { DateTime } from 'luxon';

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

type graphToken = Token | { address: string; symbol: string };

const GraphWidget = ({ from, to, client }: GraphWidgetProps) => {
  let tokenA: graphToken = { address: '', symbol: '' };
  let tokenB: graphToken = { address: '', symbol: '' };
  let poolId = null;
  let prices: Price[] = [];

  if (to && from) {
    if (from.address < to.address) {
      tokenA = from;
      tokenB = to;
    } else {
      tokenA = to;
      tokenB = from;
    }
  }

  const { loading: loadingPool, data } = useQuery<{ pools: { id: string }[] }>(getPool, {
    variables: { tokenA: tokenA.address, tokenB: tokenB.address },
    skip: !(from && to),
    client,
  });

  const { pools } = data || {};

  if (pools && pools.length) {
    poolId = pools[0].id;
  }

  const { loading: loadingPrices, data: dataPrices } = useQuery<{ poolDayDatas: Price[] }>(getTokenPrices, {
    variables: { pool: poolId, from: parseInt(DateTime.now().minus({ days: 14 }).toFormat('X'), 10) },
    skip: !poolId,
    client,
  });

  if (dataPrices && dataPrices.poolDayDatas) {
    prices = [...dataPrices.poolDayDatas];
    prices.reverse();
  }

  const graphData = React.useMemo(
    () => [
      {
        label: 'Series 1',
        data: prices.map(({ date, token1Price }) => [DateTime.fromSeconds(date).toFormat('MMM d t'), token1Price]),
      },
    ],
    [prices]
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom' },
      { type: 'linear', position: 'left', show: false },
    ],
    []
  );

  // const primaryCursor = React.useMemo(
  //   () => ({
  //     render: ({ formattedValue }: { formattedValue: null | string }) => (
  //       <div style={{
  //         display: 'flex',
  //         alignItems: 'center',
  //       }}>
  //           <Typography variant="body2">{`${(formattedValue || '').toString()}`}</Typography>
  //       </div>
  //     )
  //   }),
  //   [tokenA, tokenB]
  // )

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

  const isLoading = loadingPool || loadingPrices || prices.length === 0;

  return isLoading ? null : (
    <Grid container spacing={2} direction="column">
      <Typography variant="h4">{`${tokenA.symbol}/${tokenB.symbol}`}</Typography>
      <div style={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ height, width }}>
              <Chart
                data={graphData}
                axes={axes}
                primaryCursor
                tooltip={tooltip}
                // secondaryCursor={secondaryCursor}
              />
            </div>
          )}
        </AutoSizer>
      </div>
    </Grid>
  );
};

export default GraphWidget;
