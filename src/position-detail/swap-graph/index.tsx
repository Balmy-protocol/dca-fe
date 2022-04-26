import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { ActionState, FullPosition } from 'types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS } from 'config/constants';
import { formatUnits } from '@ethersproject/units';
import { useThemeMode } from 'state/config/hooks';

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

const StyledGraphContainer = styled(Paper)`
  padding: 17px;
  flex-grow: 1;
  display: flex;
  width: 100%;
  border-radius: 20px;
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;
interface SwapsGraphProps {
  position: FullPosition;
}

interface PriceData {
  name: string;
  date: number;
}

interface PriceDataAccum extends PriceData {
  [x: string]: string | number;
}

type PricesAccum = PriceDataAccum[];

type Prices = PriceData[];

const buildSwapItemForGraph = (
  position: FullPosition,
  { createdAtTimestamp, swapped, rate }: ActionState,
  acc: PricesAccum
) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]:
    parseFloat(formatUnits(BigNumber.from(swapped), position.to.decimals)) +
    (((acc[acc.length - 1] && acc[acc.length - 1][position.to.symbol]) as number) || 0),
  [position.from.symbol]:
    (((acc[acc.length - 1] && acc[acc.length - 1][position.from.symbol]) as number) || 0) -
    parseFloat(formatUnits(BigNumber.from(rate), position.from.decimals)),
  date: parseInt(createdAtTimestamp, 10),
});

const buildWithdrewItemForGraph = (position: FullPosition, { createdAtTimestamp }: ActionState, acc: PricesAccum) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]: 0,
  [position.from.symbol]: (acc[acc.length - 1] && acc[acc.length - 1][position.from.symbol]) || 0,
  date: parseInt(createdAtTimestamp, 10),
});

const buildCreatedItemForGraph = (
  position: FullPosition,
  { createdAtTimestamp, remainingSwaps, rate }: ActionState
) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]: 0,
  [position.from.symbol]: parseFloat(
    formatUnits(BigNumber.from(rate).mul(BigNumber.from(remainingSwaps)), position.from.decimals)
  ),
  date: parseInt(createdAtTimestamp, 10),
});

const buildModifiedRateAndDurationItemForGraph = (
  position: FullPosition,
  { createdAtTimestamp, oldRemainingSwaps, oldRate, remainingSwaps, rate }: ActionState,
  acc: PricesAccum
) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]: (acc[acc.length - 1] && acc[acc.length - 1][position.to.symbol]) || 0,
  [position.from.symbol]:
    parseFloat(
      formatUnits(
        BigNumber.from(rate)
          .mul(BigNumber.from(remainingSwaps))
          .sub(BigNumber.from(oldRate).mul(BigNumber.from(oldRemainingSwaps))),
        position.from.decimals
      )
    ) + (((acc[acc.length - 1] && acc[acc.length - 1][position.from.symbol]) as number) || 0),
  date: parseInt(createdAtTimestamp, 10),
});

const buildEmptyItemForGraph = (position: FullPosition, { createdAtTimestamp }: ActionState, acc: PricesAccum) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]: (acc[acc.length - 1] && acc[acc.length - 1][position.to.symbol]) || 0,
  [position.from.symbol]: (acc[acc.length - 1] && acc[acc.length - 1][position.from.symbol]) || 0,
  date: parseInt(createdAtTimestamp, 10),
});

const buildTerminatedItemForGraph = (position: FullPosition, { createdAtTimestamp }: ActionState) => ({
  name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
  [position.to.symbol]: 0,
  [position.from.symbol]: 0,
  date: parseInt(createdAtTimestamp, 10),
});

const ITEM_MAP = {
  [POSITION_ACTIONS.CREATED]: buildCreatedItemForGraph,
  [POSITION_ACTIONS.SWAPPED]: buildSwapItemForGraph,
  [POSITION_ACTIONS.WITHDREW]: buildWithdrewItemForGraph,
  [POSITION_ACTIONS.MODIFIED_DURATION]: buildModifiedRateAndDurationItemForGraph,
  [POSITION_ACTIONS.MODIFIED_RATE]: buildModifiedRateAndDurationItemForGraph,
  [POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION]: buildModifiedRateAndDurationItemForGraph,
  [POSITION_ACTIONS.TERMINATED]: buildTerminatedItemForGraph,
};

const SwapsGraph = ({ position }: SwapsGraphProps) => {
  let prices: Prices = [];

  const mode = useThemeMode();

  prices = React.useMemo(() => {
    const orderedSwaps = orderBy(position.history, ['createdAtTimestamp'], ['asc']);
    const mappedSwapData = orderedSwaps
      .filter(
        (positionState) =>
          positionState.action !== POSITION_ACTIONS.TRANSFERED &&
          positionState.action !== POSITION_ACTIONS.PERMISSIONS_MODIFIED
      )
      .reduce(
        (acc, positionState) => [
          ...acc,
          (ITEM_MAP[positionState.action] && ITEM_MAP[positionState.action](position, positionState, acc)) ||
            buildEmptyItemForGraph(position, positionState, acc),
        ],
        []
      );

    return orderBy(mappedSwapData, ['date'], ['desc']).reverse();
  }, [position]);

  const tooltipFormatter = (value: string, name: string) => `${value} ${name}`;

  const noData = position.history.length === 0;

  return (
    <StyledGraphContainer>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h4">
            <FormattedMessage description="PositionGraph" defaultMessage="Your position through time" />
          </Typography>
        </Grid>
        <Grid item xs={12} style={{ display: 'flex', flexDirection: 'column' }}>
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
            <>
              <ResponsiveContainer width="100%">
                <AreaChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#36a3f5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#36a3f5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BD00FF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#BD00FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    connectNulls
                    type="monotone"
                    dataKey={position.from.symbol}
                    stroke="#BD00FF"
                    fillOpacity={1}
                    yAxisId={1}
                    fill="url(#colorPv)"
                  />
                  <Area
                    connectNulls
                    type="monotone"
                    dataKey={position.to.symbol}
                    stroke="#36a3f5"
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                  <XAxis hide dataKey="name" />
                  <YAxis hide domain={['auto', 'auto']} dataKey={position.to.symbol} />
                  <YAxis hide domain={['auto', 'auto']} dataKey={position.from.symbol} yAxisId={1} />
                  <Tooltip
                    contentStyle={{ backgroundColor: mode === 'light' ? '#ffffff' : '#424242' }}
                    formatter={tooltipFormatter}
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
              <StyledGraphAxis />
              <StyledGraphAxisLabels>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(position.history[0].createdAtTimestamp, 10)).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromSeconds(
                    parseInt(position.history[position.history.length - 1].createdAtTimestamp, 10)
                  ).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </StyledGraphAxisLabels>
            </>
          )}
        </Grid>
      </Grid>
    </StyledGraphContainer>
  );
};
export default SwapsGraph;
