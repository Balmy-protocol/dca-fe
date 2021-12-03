import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { FullPosition } from 'types';
import Typography from '@material-ui/core/Typography';
import TokenIcon from 'common/token-icon';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from 'utils/currency';
import Divider from '@material-ui/core/Divider';

import { getFrequencyLabel } from 'utils/parsing';
import { STRING_SWAP_INTERVALS } from 'config/constants';

interface DetailsProps {
  position: FullPosition;
}

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  *:not(:first-child) {
    margin-left: 4px;
  }
  margin-bottom: 10px;
`;

const StyledPaper = styled(Paper)`
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-grow: 1;
`;

const Details = ({ position }: DetailsProps) => (
  <StyledPaper>
    <Grid container spacing={1} direction="column" wrap="nowrap">
      <Grid item xs={12}>
        <StyledCardTitleHeader>
          <TokenIcon token={position.from} size="24px" />
          <Typography variant="body1">{position.from.symbol}</Typography>
          <ArrowRight size="20px" />
          <TokenIcon token={position.to} size="24px" />
          <Typography variant="body1">{position.to.symbol}</Typography>
        </StyledCardTitleHeader>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">
              <FormattedMessage description="positionDetailsHistoricallySwappedTitle" defaultMessage="Swapped:" />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              <FormattedMessage
                description="positionDetailsHistoricallySwapped"
                defaultMessage="{swapped} {to}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  swapped: formatCurrencyAmount(BigNumber.from(position.totalSwapped), position.to),
                  to: position.to.symbol,
                }}
              />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">
              <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="Available to withdraw:" />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              <FormattedMessage
                description="positionDetailsToWithdraw"
                defaultMessage="{toWithdraw} {to}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  toWithdraw: formatCurrencyAmount(BigNumber.from(position.current.idleSwapped), position.to),
                  to: position.to.symbol,
                }}
              />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">
              <FormattedMessage description="positionDetailsCurrentRateTitle" defaultMessage="Rate:" />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              <FormattedMessage
                description="positionDetailsCurrentRate"
                defaultMessage="{rate} {from} {frequency}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  rate: formatCurrencyAmount(BigNumber.from(position.current.rate), position.from),
                  from: position.from.symbol,
                  frequency:
                    STRING_SWAP_INTERVALS[position.swapInterval.interval as keyof typeof STRING_SWAP_INTERVALS].every,
                }}
              />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">
              <FormattedMessage description="positionDetailsRemainingFundsTitle" defaultMessage="Remaining funds:" />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              <FormattedMessage
                description="positionDetailsRemainingFunds"
                defaultMessage="{funds} {from}"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  funds: formatCurrencyAmount(BigNumber.from(position.current.remainingLiquidity), position.from),
                  from: position.from.symbol,
                }}
              />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body1">
              <FormattedMessage description="positionDetailsRemainingSwaps" defaultMessage="Remaining time:" />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">
              {getFrequencyLabel(position.swapInterval.interval, position.totalSwaps)}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider variant="middle" />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">
          <FormattedMessage
            description="positionDetailsCreatedAt"
            defaultMessage="Created at {created}"
            values={{
              created: DateTime.fromSeconds(parseInt(position.createdAtTimestamp, 10)).toLocaleString(
                DateTime.DATETIME_FULL
              ),
            }}
          />
        </Typography>
      </Grid>
    </Grid>
  </StyledPaper>
);
export default Details;
