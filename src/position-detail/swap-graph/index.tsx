import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { FullPosition, Token } from 'types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS, STABLE_COINS } from 'config/constants';
import GraphTooltip from 'common/graph-tooltip';
import EmptyGraph from 'assets/svg/emptyGraph';
import { formatCurrencyAmount } from 'utils/currency';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';

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

const StyledContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: transparent;
  margin-bottom: 30px;
`;

const StyledGraphContainer = styled.div`
  width: 90%;
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
`;

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

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

const EMPTY_GRAPH_TOKEN: TokenWithBase = {
  address: '',
  symbol: '',
  decimals: 1,
  isBaseToken: false,
  name: '',
  chainId: 0,
};

const SwapsGraph = ({ position }: SwapsGraphProps) => {
  let prices: Prices = [];
  const currentNetwork = useCurrentNetwork();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

  let tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  let tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
  tokenFromAverage =
    tokenFromAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenFromAverage.symbol }
      : tokenFromAverage;
  tokenToAverage =
    tokenToAverage.address === PROTOCOL_TOKEN_ADDRESS
      ? { ...wrappedProtocolToken, symbol: tokenFromAverage.symbol }
      : tokenToAverage;

  const tokenA: GraphToken = {
    ...tokenFromAverage,
    isBaseToken: STABLE_COINS.includes(tokenFromAverage.symbol),
  };
  const tokenB: GraphToken = {
    ...tokenToAverage,
    isBaseToken: STABLE_COINS.includes(tokenToAverage.symbol),
  };

  prices = React.useMemo(() => {
    const swappedActions = position.history.filter((state) => state.action === POSITION_ACTIONS.SWAPPED);

    const swappedSummed = swappedActions.reduce<{ summed: BigNumber; current: number; date: number; name: string }[]>(
      (acc, action, index) => {
        const rate =
          position.pair.tokenA.address === tokenFromAverage.address
            ? BigNumber.from(action.ratePerUnitAToBWithFee)
            : BigNumber.from(action.ratePerUnitBToAWithFee);

        const prevSummed = (acc[index - 1] && acc[index - 1].summed) || BigNumber.from(0);
        acc.push({
          summed: prevSummed.add(rate),
          current: parseFloat(formatCurrencyAmount(rate, tokenToAverage)),
          date: parseInt(action.createdAtTimestamp, 10),
          name: DateTime.fromSeconds(parseInt(action.createdAtTimestamp, 10)).toFormat('MMM d t'),
        });

        return acc;
      },
      []
    );

    const swappedAverages = swappedSummed.map((swappedItem, index) => ({
      ...swappedItem,
      average: parseFloat(formatCurrencyAmount(swappedItem.summed.div(BigNumber.from(index + 1)), tokenToAverage)),
    }));

    return orderBy(swappedAverages, ['date'], ['desc']).reverse();
  }, [position]);

  const noData = prices.length === 0;

  if (noData) {
    return (
      <StyledCenteredWrapper>
        <EmptyGraph size="100px" />
        <Typography variant="h6">
          <FormattedMessage
            description="No data available"
            defaultMessage="There is no data available about this position yet"
          />
        </Typography>
      </StyledCenteredWrapper>
    );
  }

  return (
    <StyledContainer elevation={0}>
      <StyledHeader>
        <StyledTitleContainer>
          <Typography variant="h6">
            <FormattedMessage description="averagevsCurrentPrice" defaultMessage="Market price vs DCA price" />
          </Typography>
        </StyledTitleContainer>
        <StyledLegendContainer>
          <StyledLegend>
            <StyledLegendIndicator fill="#7C37ED" />
            <Typography variant="body2">
              <FormattedMessage description="currentPriceLegend" defaultMessage="Market price" />
            </Typography>
          </StyledLegend>
          <StyledLegend>
            <StyledLegendIndicator fill="#DCE2F9" />
            <Typography variant="body2">
              <FormattedMessage description="averageBuyPriceLegend" defaultMessage="DCA price" />
            </Typography>
          </StyledLegend>
        </StyledLegendContainer>
      </StyledHeader>
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
              dataKey="current"
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
              dataKey="average"
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
            <Tooltip
              content={({ payload, label }) => (
                <GraphTooltip
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  payload={payload as any}
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
export default SwapsGraph;
