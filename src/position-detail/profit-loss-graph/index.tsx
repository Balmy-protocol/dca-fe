import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, Line, ComposedChart, Tooltip } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { FullPosition } from 'types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS } from 'config/constants';
// import GraphTooltip from 'common/graph-tooltip';
import EmptyGraph from 'assets/svg/emptyGraph';
import useWeb3Service from 'hooks/useWeb3Service';
import ProfitLossTooltip from './tooltip';

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
interface ProfitLossGraphProps {
  position: FullPosition;
}

interface PriceData {
  name: string;
  date: number;
  profitLoss: string;
  tokenAPrice: BigNumber;
  tokenBPrice: BigNumber;
  summedRate: BigNumber;
  summedBougth: BigNumber;
}

type Prices = PriceData[];

// interface TokenWithBase extends Token {
//   isBaseToken: boolean;
// }

const MODIFY_ACTIONS = [
  POSITION_ACTIONS.MODIFIED_DURATION,
  POSITION_ACTIONS.MODIFIED_RATE,
  POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
];
const SWAPPED_ACTIONS = [POSITION_ACTIONS.SWAPPED];
const ACTIONS_TO_FILTER = [...MODIFY_ACTIONS, ...SWAPPED_ACTIONS];

const ProfitLossGraph = ({ position }: ProfitLossGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const web3Service = useWeb3Service();

  React.useEffect(() => {
    const fetchTokenRate = async () => {
      if (!position) {
        return;
      }
      try {
        const filteredPositionActions = position.history.filter((action) => ACTIONS_TO_FILTER.includes(action.action));

        let tokenAPrice: BigNumber | null = null;
        let tokenBPrice: BigNumber | null = null;
        let summedRate = BigNumber.from(0);
        let summedBougth = BigNumber.from(0);
        let summedSwapped = BigNumber.from(0);
        const newPrices: Prices = [];
        let previousRate = BigNumber.from(0);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < filteredPositionActions.length; i++) {
          const positionAction = filteredPositionActions[i];
          const currentRate = BigNumber.from(positionAction.rate);

          if (!tokenAPrice || !tokenBPrice || MODIFY_ACTIONS.includes(positionAction.action)) {
            // eslint-disable-next-line no-await-in-loop
            const [fetchedTokenAPrice, fetchedTokenBPrice] = await web3Service.getUsdHistoricPrice(
              [position.from, position.to],
              positionAction.createdAtTimestamp
            );

            if (tokenAPrice && tokenBPrice) {
              tokenAPrice = tokenAPrice.mul(previousRate).div(fetchedTokenAPrice.div(currentRate));
              tokenBPrice = tokenBPrice.mul(previousRate).div(fetchedTokenBPrice.div(currentRate));
            }

            if (!tokenAPrice) {
              tokenAPrice = fetchedTokenAPrice;
            }
            if (!tokenBPrice) {
              tokenBPrice = fetchedTokenBPrice;
            }
          }

          if (SWAPPED_ACTIONS.includes(positionAction.action)) {
            summedRate = summedRate.add(currentRate);
            summedBougth = summedBougth.add(
              currentRate
                .mul(tokenAPrice)
                .mul(BigNumber.from(10).pow(position.to.decimals))
                .div(BigNumber.from(10).pow(position.from.decimals))
                .div(tokenBPrice)
            );
            summedSwapped = summedSwapped.add(BigNumber.from(positionAction.swapped));
            const profitPercentage = (summedSwapped.mul(10000).div(summedBougth).sub(10000).toNumber() / 100).toFixed(
              2
            );
            newPrices.push({
              date: parseInt(positionAction.createdAtTimestamp, 10),
              name: DateTime.fromSeconds(parseInt(positionAction.createdAtTimestamp, 10)).toFormat('MMM d t'),
              profitLoss: profitPercentage,
              tokenAPrice,
              tokenBPrice,
              summedRate,
              summedBougth,
            });
          }

          previousRate = currentRate;
        }

        setPrices(newPrices);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    if (prices.length === 0 && !isLoadingPrices) {
      setIsLoadingPrices(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      fetchTokenRate();
    }
  }, [position, isLoadingPrices]);

  // prices = React.useMemo(() => {
  //   return [];
  // }, [position]);

  const noData = prices.length === 0;

  // const totalSwapped = BigNumber.from(position.totalSwapped);
  // const profitPercentage =
  //   (initiallySwapped && (totalSwapped.mul(10000).div(initiallySwapped).sub(10000).toNumber() / 100).toFixed(2)) || 0;

  // console.log(profitPercentage);

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
            <FormattedMessage description="profitLossPercentage" defaultMessage="Profit loss percetage over time" />
          </Typography>
        </StyledTitleContainer>
        <StyledLegendContainer>
          <StyledLegend>
            <StyledLegendIndicator fill="#DCE2F9" />
            <Typography variant="body2">
              <FormattedMessage description="averageBuyPriceLegend" defaultMessage="Profit/Loss percentage" />
            </Typography>
          </StyledLegend>
        </StyledLegendContainer>
      </StyledHeader>
      <StyledGraphContainer>
        <ResponsiveContainer height={200}>
          <ComposedChart
            data={orderBy(prices, ['date'], ['desc']).reverse()}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <defs>
              <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7C37ED" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* <Area
              connectNulls
              legendType="none"
              type="monotone"
              fill="url(#colorUniswap)"
              strokeWidth="2px"
              dot={false}
              activeDot={false}
              stroke="#7C37ED"
              dataKey="current"
            /> */}
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" />
            <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#DCE2F9"
              dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
              strokeDasharray="5 5"
              dataKey="profitLoss"
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
            <YAxis
              strokeWidth="0px"
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tickFormatter={(tick: string) => `${tick}%`}
            />
            <Tooltip
              content={({ payload, label }) => (
                <ProfitLossTooltip
                  payload={payload}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  label={label}
                  tokenA={position.from}
                  tokenB={position.to}
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
export default ProfitLossGraph;
