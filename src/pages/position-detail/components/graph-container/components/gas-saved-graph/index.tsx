import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, Line, ComposedChart, Tooltip } from 'recharts';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { FullPosition } from '@types';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { POSITION_ACTIONS } from '@constants';
import EmptyGraph from '@assets/svg/emptyGraph';
import usePriceService from '@hooks/usePriceService';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { formatUnits } from '@ethersproject/units';
import GasSavedTooltip from './tooltip';

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

interface PriceData {
  name: string;
  date: number;
  gasSaved: number;
  gasSavedRaw: BigNumber;
}

type Prices = PriceData[];

interface GasSavedGraphProps {
  position: FullPosition;
}

const POINT_LIMIT = 30;

const tickFormatter = (value: string) => {
  const precisionRegex = new RegExp(/e\+?/);
  const preciseValue = Number(value).toPrecision(5);

  if (precisionRegex.test(preciseValue)) {
    return preciseValue;
  }

  return parseFloat(preciseValue).toString();
};

const GasSavedGraph = ({ position }: GasSavedGraphProps) => {
  const [prices, setPrices] = React.useState<Prices>([]);
  const [isLoadingPrices, setIsLoadingPrices] = React.useState(false);
  const [hasLoadedPrices, setHasLoadedPrices] = React.useState(false);
  const priceService = usePriceService();

  React.useEffect(() => {
    const fetchGasSaved = async () => {
      if (!position) {
        return;
      }
      try {
        const filteredPositionActions = position.history.filter((action) => action.action === POSITION_ACTIONS.SWAPPED);

        const protocolTokenHistoricPrices = await priceService.getProtocolHistoricPrices(
          filteredPositionActions.map(({ createdAtTimestamp }) => createdAtTimestamp),
          position.chainId
        );

        const { estimatedGas: gasUsed, estimatedOptimismGas: opGasUsed } = await priceService.getZrxGasSwapQuote(
          position.from,
          position.to,
          BigNumber.from(position.rate),
          position.chainId
        );

        const newPrices: Prices = filteredPositionActions.map(
          ({ createdAtTimestamp, transaction: { gasPrice, overhead, l1GasPrice } }) => {
            const oeGas = opGasUsed?.add(overhead || '0').mul(l1GasPrice || '0') || BigNumber.from(0);

            return {
              date: parseInt(createdAtTimestamp, 10),
              name: DateTime.fromSeconds(parseInt(createdAtTimestamp, 10)).toFormat('MMM d t'),
              gasSavedRaw: BigNumber.from(gasPrice || '0')
                .mul(BigNumber.from(gasUsed))
                .add(BigNumber.from(oeGas))
                .mul(protocolTokenHistoricPrices[createdAtTimestamp]),
              gasSaved: 0,
            };
          }
        );

        setPrices(newPrices);
      } finally {
        setIsLoadingPrices(false);
        setHasLoadedPrices(true);
      }
    };

    if (prices.length === 0 && !isLoadingPrices && !hasLoadedPrices) {
      setIsLoadingPrices(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      fetchGasSaved();
    }
  }, [position, isLoadingPrices]);

  const noData = prices.length === 0;
  const hasActions = position.history.filter((action) => action.action === POSITION_ACTIONS.SWAPPED).length !== 0;

  const mappedPrices = prices
    .reduce<Prices>(
      (acc, price, index) => [
        ...acc,
        {
          ...price,
          // 18 for protocolToken decimals and 18 for usd decimals
          gasSaved: parseFloat(formatUnits(price.gasSavedRaw, 36)) + (acc[index - 1]?.gasSaved || 0),
        },
      ],
      []
    )
    .slice(-POINT_LIMIT);

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
            <Line
              connectNulls
              legendType="none"
              type="monotone"
              strokeWidth="3px"
              stroke="#DCE2F9"
              dot={{ strokeWidth: '3px', stroke: '#DCE2F9', fill: '#DCE2F9' }}
              strokeDasharray="5 5"
              dataKey="gasSaved"
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
              tickFormatter={tickFormatter}
              // tickFormatter={(tick: string) => `${tick}%`}
            />
            <Tooltip
              content={({ payload, label }) => (
                <GasSavedTooltip
                  payload={payload}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  label={label}
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
          <FormattedMessage description="gasSavedBullet" defaultMessage="Gas saved in USD" />
        </Typography>
      </StyledLegend>
    </StyledLegendContainer>
  </StyledHeader>
);

export default GasSavedGraph;
