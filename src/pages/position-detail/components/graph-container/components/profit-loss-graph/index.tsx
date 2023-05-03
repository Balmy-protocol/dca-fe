import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ComposedChart,
  Tooltip,
  Area,
  ReferenceLine,
} from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { ActionState, FullPosition } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS } from '@constants';
import EmptyGraph from '@assets/svg/emptyGraph';
import usePriceService from '@hooks/usePriceService';
import { formatUnits } from '@ethersproject/units';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import ProfitLossTooltip from './tooltip';

const StyledContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: transparent;
`;

const StyledGraphContainer = styled.div`
  width: 100%;
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

const StyledLegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
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
  swappedIfLumpSum: BigNumber;
  swappedIfDCA: BigNumber;
  percentage: BigNumber;
}

interface SubPosition {
  amountLeft: BigNumber;
  ratePerUnit: BigNumber;
}

type Prices = PriceData[];

// interface TokenWithBase extends Token {
//   isBaseToken: boolean;
// }

const tickFormatter = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return `${parseFloat(preciseValue).toString()}%`;
};

const POINT_LIMIT = 30;

const MODIFY_ACTIONS = [
  POSITION_ACTIONS.MODIFIED_DURATION,
  POSITION_ACTIONS.MODIFIED_RATE,
  POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
];
const SWAPPED_ACTIONS = [POSITION_ACTIONS.SWAPPED];
const CREATED_ACTIONS = [POSITION_ACTIONS.CREATED];
const ACTIONS_TO_FILTER = [...MODIFY_ACTIONS, ...SWAPPED_ACTIONS, ...CREATED_ACTIONS];

const getFunds = (positionAction: ActionState) => {
  const { rate, oldRate, rateUnderlying, oldRateUnderlying, remainingSwaps, oldRemainingSwaps } = positionAction;

  const previousRate = BigNumber.from(oldRateUnderlying || oldRate);
  const currentRate = BigNumber.from(rateUnderlying || rate);
  const previousRemainingSwaps = BigNumber.from(oldRemainingSwaps);
  const currentRemainingSwaps = BigNumber.from(remainingSwaps);
  const oldFunds = previousRate.mul(previousRemainingSwaps);
  const newFunds = currentRate.mul(currentRemainingSwaps);

  return {
    oldFunds,
    newFunds,
  };
};

const isIncrease = (positionAction: ActionState) => {
  const { action } = positionAction;

  if (!MODIFY_ACTIONS.includes(action)) {
    return false;
  }

  const { oldFunds, newFunds } = getFunds(positionAction);

  return newFunds.gt(oldFunds);
};

const isReduce = (positionAction: ActionState) => {
  const { action } = positionAction;

  if (!MODIFY_ACTIONS.includes(action)) {
    return false;
  }
  const { oldFunds, newFunds } = getFunds(positionAction);

  return newFunds.lt(oldFunds);
};

const ProfitLossGraph = ({ position }: ProfitLossGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const [hasLoadedPrices, setHasLoadedPrices] = React.useState(false);
  const priceService = usePriceService();

  React.useEffect(() => {
    const fetchTokenRate = async () => {
      if (!position) {
        return;
      }
      try {
        const filteredPositionActions = position.history.filter((action) => ACTIONS_TO_FILTER.includes(action.action));
        const newPrices: Prices = [];

        const fromMagnitude = BigNumber.from(10).pow(position.from.decimals);
        const toMagnitude = BigNumber.from(10).pow(position.to.decimals);
        const subPositions: SubPosition[] = [];

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < filteredPositionActions.length; i++) {
          const positionAction = filteredPositionActions[i];
          const { action, rate: rawRate, depositedRateUnderlying, rateUnderlying } = positionAction;
          const rate = depositedRateUnderlying || rateUnderlying || rawRate;
          const currentRate = BigNumber.from(rate || 0);
          const currentRemainingSwaps = BigNumber.from(positionAction.remainingSwaps || 0);

          if (CREATED_ACTIONS.includes(action)) {
            // eslint-disable-next-line no-await-in-loop
            const fetchedPrices = await priceService.getUsdHistoricPrice(
              [position.from, position.to],
              positionAction.createdAtTimestamp,
              position.chainId
            );

            const fetchedTokenFromPrice = fetchedPrices[position.from.address];
            const fetchedTokenToPrice = fetchedPrices[position.to.address];
            const deposited = currentRemainingSwaps.mul(currentRate);

            const originalRatePerUnitFromToTo = fetchedTokenFromPrice.mul(toMagnitude).div(fetchedTokenToPrice);
            subPositions.push({ amountLeft: deposited, ratePerUnit: originalRatePerUnitFromToTo });

            newPrices.push({
              date: parseInt(positionAction.createdAtTimestamp, 10),
              name: DateTime.fromSeconds(parseInt(positionAction.createdAtTimestamp, 10)).toFormat('MMM d t'),
              swappedIfLumpSum: BigNumber.from(0),
              swappedIfDCA: BigNumber.from(0),
              percentage: BigNumber.from(0),
            });
          }

          if (isIncrease(positionAction)) {
            const { oldFunds, newFunds } = getFunds(positionAction);

            const amountAdded = newFunds.sub(oldFunds);

            // eslint-disable-next-line no-await-in-loop
            const fetchedPrices = await priceService.getUsdHistoricPrice(
              [position.from, position.to],
              positionAction.createdAtTimestamp,
              position.chainId
            );

            const fetchedTokenFromPrice = fetchedPrices[position.from.address];
            const fetchedTokenToPrice = fetchedPrices[position.to.address];

            const ratePerUnit = fetchedTokenFromPrice.mul(toMagnitude).div(fetchedTokenToPrice);

            subPositions.push({ amountLeft: amountAdded, ratePerUnit });
          }

          if (isReduce(positionAction)) {
            const { oldFunds, newFunds } = getFunds(positionAction);

            let amountWithdrawn = oldFunds.sub(newFunds);

            for (let j = subPositions.length - 1; j >= 0 && amountWithdrawn.gt(0); j -= 1) {
              const { amountLeft } = subPositions[j];
              if (amountWithdrawn.gte(amountLeft)) {
                subPositions.splice(j, 1);
                amountWithdrawn = amountWithdrawn.sub(amountLeft);
              } else {
                subPositions[j].amountLeft = subPositions[j].amountLeft.sub(amountWithdrawn);
                amountWithdrawn = BigNumber.from(0);
              }
            }
          }

          if (SWAPPED_ACTIONS.includes(action)) {
            const totalDeposited = subPositions.reduce(
              (acc, subPosition) => acc.add(subPosition.amountLeft),
              BigNumber.from(0)
            );
            const oldSwappedIfLumpSum =
              (newPrices[newPrices.length - 1] && newPrices[newPrices.length - 1].swappedIfLumpSum) ||
              BigNumber.from(0);
            const oldSwappedIfDCA =
              (newPrices[newPrices.length - 1] && newPrices[newPrices.length - 1].swappedIfDCA) || BigNumber.from(0);
            let swappedIfLumpSum = BigNumber.from(oldSwappedIfLumpSum);
            const swappedIfDCA = BigNumber.from(oldSwappedIfDCA).add(
              BigNumber.from(positionAction.swappedUnderlying || positionAction.swapped)
            );

            for (let j = subPositions.length - 1; j >= 0; j -= 1) {
              const { amountLeft, ratePerUnit } = subPositions[j];
              // We do it this way, first multiply and then divide, and avoid losing precision
              const lumpSum = currentRate.mul(amountLeft).mul(ratePerUnit).div(totalDeposited).div(fromMagnitude);

              swappedIfLumpSum = swappedIfLumpSum.add(lumpSum);

              let spentFromPosition = currentRate.mul(amountLeft).div(totalDeposited);
              if (!currentRate.mul(amountLeft).mod(totalDeposited).isZero()) {
                // We are rounding up, so that we are not left with really small amounts that are very difficult to spen
                spentFromPosition = spentFromPosition.add(1);
              }

              const remainingLeft = amountLeft.sub(spentFromPosition);
              if (remainingLeft.lte(0)) {
                subPositions.splice(j, 1);
              } else {
                subPositions[j].amountLeft = remainingLeft;
              }
            }

            const percentage = swappedIfDCA.mul(toMagnitude).div(swappedIfLumpSum).div(toMagnitude);

            newPrices.push({
              date: parseInt(positionAction.createdAtTimestamp, 10),
              name: DateTime.fromSeconds(parseInt(positionAction.createdAtTimestamp, 10)).toFormat('MMM d t'),
              swappedIfLumpSum,
              swappedIfDCA,
              percentage,
            });
          }
        }

        setPrices(newPrices);
      } finally {
        setIsLoadingPrices(false);
        setHasLoadedPrices(true);
      }
    };

    if (prices.length === 0 && !isLoadingPrices && !hasLoadedPrices) {
      setIsLoadingPrices(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      fetchTokenRate();
    }
  }, [position, isLoadingPrices]);

  const noData = prices.length === 0;
  const hasActions = position.history.filter((action) => SWAPPED_ACTIONS.includes(action.action)).length !== 0;

  const mappedPrices = prices.map((price) => {
    const swappedIfDCA = formatUnits(price.swappedIfDCA, position.to.decimals);
    const swappedIfLumpSum = formatUnits(price.swappedIfLumpSum, position.to.decimals);

    let percentage = 0;

    if (parseFloat(swappedIfLumpSum) > 0) {
      percentage = (parseFloat(swappedIfDCA) / parseFloat(swappedIfLumpSum) - 1) * 100;
    }

    return {
      ...price,
      swappedIfDCA: parseFloat(swappedIfDCA),
      swappedIfLumpSum: parseFloat(swappedIfLumpSum),
      rawSwappedIfDCA: price.swappedIfDCA,
      rawSwappedIfLumpSum: price.swappedIfLumpSum,
      percentage,
      rawPercentage: price.percentage,
    };
  });

  const gradientOffset = () => {
    const dataMax = Math.max(...mappedPrices.map((i) => i.percentage));
    const dataMin = Math.min(...mappedPrices.map((i) => i.percentage));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  if (noData && hasActions) {
    return (
      <StyledCenteredWrapper>
        {isLoadingPrices && <CenteredLoadingIndicator />}
        {!isLoadingPrices && (
          <>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No price available"
                defaultMessage="We could not fetch the price of one of the tokens"
              />
            </Typography>
          </>
        )}
      </StyledCenteredWrapper>
    );
  }

  if (noData) {
    return (
      <StyledCenteredWrapper>
        {isLoadingPrices && <CenteredLoadingIndicator />}
        {!isLoadingPrices && (
          <>
            <EmptyGraph size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="No data available"
                defaultMessage="There is no data available about this position yet"
              />
            </Typography>
          </>
        )}
      </StyledCenteredWrapper>
    );
  }

  return (
    <StyledContainer elevation={0}>
      <StyledGraphContainer>
        <ResponsiveContainer height={200}>
          <ComposedChart
            data={orderBy(mappedPrices, ['date'], ['desc']).reverse()}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <defs>
              <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7C37ED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.2)" />
            <ReferenceLine y={0} stroke="#7C37ED" strokeDasharray="3 3" />
            {/* <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#DCE2F9"
              dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
              strokeDasharray="5 5"
              dataKey="swappedIfDCA"
            />
            <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#7C37ED"
              dot={{ strokeWidth: '3px', stroke: '#7C37ED', fill: '#7C37ED' }}
              strokeDasharray="5 5"
              dataKey="swappedIfLumpSum"
            /> */}
            <Area
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#DCE2F9"
              dot={mappedPrices.length <= POINT_LIMIT && { strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
              strokeDasharray="5 5"
              dataKey="percentage"
              fill="url(#splitColor)"
            />
            <defs>
              <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C37ED" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#7C37ED" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off * 0.05} stopColor="#238636" stopOpacity={1} />
                <stop offset={off} stopColor="#238636" stopOpacity={0.1} />
                <stop offset={off} stopColor="#9d3f3f" stopOpacity={0.1} />
                <stop offset={off * 1.95} stopColor="#9d3f3f" stopOpacity={1} />
              </linearGradient>
            </defs>
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
              tickFormatter={tickFormatter}
              // tickFormatter={(tick: string) => `${tick}%`}
            />
            <Tooltip
              content={({ payload, label }) => (
                <ProfitLossTooltip
                  payload={payload}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  label={label}
                  tokenTo={position.to}
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

export const Legends = () => (
  <StyledHeader>
    <StyledLegendContainer>
      <StyledLegend>
        <StyledLegendIndicator fill="#DCE2F9" />
        <Typography variant="body2">
          <FormattedMessage description="swappedIfDca" defaultMessage="DCA vs Lump Sum Profit %" />
        </Typography>
      </StyledLegend>
    </StyledLegendContainer>
  </StyledHeader>
);

export default ProfitLossGraph;
