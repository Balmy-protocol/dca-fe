import React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { Chart } from 'react-charts';
import getPool from 'graphql/getPool.graphql';
import getTokenPrices from 'graphql/getTokenPrices.graphql';

interface GraphWidgetProps {
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  client: ApolloClient<NormalizedCacheObject>;
}
interface Price {
  token0Price: string;
  token1Price: string;
}

const GraphWidget = ({ from, to, fromLabel, toLabel, client }: GraphWidgetProps) => {
  let tokenA;
  let tokenB;
  let tokenALabel;
  let tokenBLabel;
  let poolId = null;
  let prices: Price[] = [];

  if (from < to) {
    tokenA = from;
    tokenB = to;
    tokenALabel = fromLabel;
    tokenBLabel = toLabel;
  } else {
    tokenA = to;
    tokenB = from;
    tokenALabel = toLabel;
    tokenBLabel = fromLabel;
  }

  const { loading: loadingPool, data } = useQuery<{ pools: { id: string }[] }>(getPool, {
    variables: { tokenA, tokenB },
    skip: !(tokenA && tokenB),
    client,
  });

  const { pools } = data || {};

  if (pools && pools.length) {
    poolId = pools[0].id;
  }

  const { loading: loadingPrices, data: dataPrices } = useQuery<{ poolDayDatas: Price[] }>(getTokenPrices, {
    variables: { pool: poolId },
    skip: !poolId,
    client,
  });

  if (dataPrices && dataPrices.poolDayDatas) {
    prices = dataPrices.poolDayDatas;
  }

  const graphData = React.useMemo(
    () => [
      {
        label: 'Series 1',
        data: prices.map(({ token0Price, token1Price }) => [token0Price, token1Price]),
      },
    ],
    [prices]
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'linear', position: 'bottom' },
      { type: 'linear', position: 'left' },
    ],
    []
  );

  const isLoading = loadingPool || loadingPrices;

  return (
    <div style={{ height: '300px' }}>
      {isLoading ? (
        <div>Loadign....</div>
      ) : (
        <>
          <h1>{`${tokenALabel}/${tokenBLabel}`}</h1>
          <Chart data={graphData} axes={axes} />
        </>
      )}
    </div>
  );
};

export default GraphWidget;
