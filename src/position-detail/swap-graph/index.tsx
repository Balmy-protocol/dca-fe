import React from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { FullPosition, GetPairSwapsData, PairSwaps } from 'types';
import getPairSwaps from 'graphql/getPairSwaps.graphql';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import { formatCurrencyAmount } from 'utils/currency';
import { parseUnits } from '@ethersproject/units';

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
  swaps: PairSwaps[];
}

const SwapsGraph = ({ position, swaps }: SwapsGraphProps) => {
  let prices: any = [];

  prices = React.useMemo(() => {
    const orderedSwaps = orderBy(swaps, ['executedAtTimestamp'], ['asc']);
    const mappedSwapData = orderedSwaps.reduce(
      (acc, { executedAtTimestamp, ratePerUnitAToBWithFee, ratePerUnitBToAWithFee }) => [
        ...acc,
        {
          name: DateTime.fromSeconds(parseInt(executedAtTimestamp, 10)).toFormat('MMM d t'),
          [position.to.symbol]:
            parseFloat(
              position.pair.tokenA.address === position.from.address
                ? formatCurrencyAmount(
                    BigNumber.from(ratePerUnitAToBWithFee)
                      .mul(BigNumber.from(position.current.rate))
                      .div(BigNumber.from('10').pow(position.from.decimals)),
                    position.to
                  )
                : formatCurrencyAmount(
                    BigNumber.from(ratePerUnitBToAWithFee)
                      .mul(BigNumber.from(position.current.rate))
                      .div(BigNumber.from('10').pow(position.from.decimals)),
                    position.to
                  )
            ) + ((acc[acc.length - 1] && acc[acc.length - 1][position.to.symbol]) || 0),
          date: executedAtTimestamp,
        },
      ],
      []
    );

    position.createdAtTimestamp;

    mappedSwapData.push({
      name: DateTime.fromSeconds(parseInt(position.createdAtTimestamp, 10)).toFormat('MMM d t'),
      [position.to.symbol]: parseFloat('0'),
      date: position.createdAtTimestamp,
    });

    return orderBy(mappedSwapData, ['date'], ['desc']).reverse();
  }, [swaps]);

  const tooltipFormatter = (value: string, name: string) => `${value} ${position.to.symbol}`;

  const noData = swaps.length === 0;

  return (
    <StyledGraphContainer>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h4">
            <FormattedMessage description="PositionGraph" defaultMessage="Swapped through time" />
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
                <LineChart data={prices} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line connectNulls type="monotone" dataKey={position.to.symbol} stroke="#36a3f5" />
                  <XAxis hide dataKey="name" />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
              <StyledGraphAxis />
              <StyledGraphAxisLabels>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(swaps[swaps.length - 1].executedAtTimestamp, 10)).toLocaleString({
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption">
                  {DateTime.fromSeconds(parseInt(swaps[0].executedAtTimestamp, 10)).toLocaleString({
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
