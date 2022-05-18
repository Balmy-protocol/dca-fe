import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { ActionState, FullPosition } from 'types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS } from 'config/constants';
import { formatUnits } from '@ethersproject/units';
import { useThemeMode } from 'state/config/hooks';
import GraphTooltip from 'common/graph-tooltip';
import EmptyGraph from 'assets/svg/emptyGraph';

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
`;

const StyledTitleContainer = styled.div`
  margin-bottom: 15px;
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

const StyledLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`

const StyledLegendIndicator = styled.div<{ fill: string }>`
  width: 12px;
  height: 12px;
  background-color: ${({ fill }) => fill};
  border-radius: 99px;
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

  const noData = position.history.length === 0;

  if (noData) {
    return (
      <StyledCenteredWrapper>
        <EmptyGraph size="100px" />
        <Typography variant="h6">
          <FormattedMessage
            description="No data available"
            defaultMessage="There is no data available about this pair"
          />
        </Typography>
      </StyledCenteredWrapper>
    )
  }

  return (
    <StyledGraphContainer elevation={0}>
      <StyledHeader>
        <StyledTitleContainer>
          <Typography variant="h6">
            <FormattedMessage
              description="averagevsCurrentPrice"
              defaultMessage="Average price vs current price"
            />
          </Typography>
        </StyledTitleContainer>
        <StyledLegendContainer>
          <StyledLegend>
            <StyledLegendIndicator fill="#7C37ED" />
            <Typography variant="body2">
              <FormattedMessage
                description="uniswapLegend"
                defaultMessage="Uniswap"
              />
            </Typography>
          </StyledLegend>
          <StyledLegend>
            <StyledLegendIndicator fill="#DCE2F9" />
            <Typography variant="body2">
              <FormattedMessage
                description="meanFinanceLegend"
                defaultMessage="Mean Finance"
              />
            </Typography>
          </StyledLegend>
        </StyledLegendContainer>
      </StyledHeader>
      <ResponsiveContainer width="100%" minHeight={200}>
        <AreaChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#7C37ED" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area
            connectNulls
            legendType="none"
            fill="url(#colorUniswap)"
            strokeWidth="2px"
            dot={false}
            activeDot={false}
            stroke="#7C37ED"
            dataKey={position.from.symbol}
          />
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" />
          <Area
            connectNulls
            legendType="none"
            type="monotone"
            strokeWidth="3px"
            stroke="#DCE2F9"
            dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9'}}
            strokeDasharray="5 5"
            dataKey={position.to.symbol}
          />
          <XAxis tickMargin={30} minTickGap={30} interval="preserveStartEnd" dataKey="name" axisLine={false} tickLine={false} tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}/>
          <YAxis strokeWidth="0px" domain={['auto', 'auto']} axisLine={false} tickLine={false}/>
          <Tooltip
            content={({ payload, label }) => (
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              <GraphTooltip payload={payload as any} label={label} tokenA={{ ...position.from, isBaseToken: false }} tokenB={{ ...position.to, isBaseToken: false }} />
            )}
          />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </StyledGraphContainer>
  );
};
export default SwapsGraph;
