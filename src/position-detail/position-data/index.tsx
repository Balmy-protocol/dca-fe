import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { FullPosition } from 'types';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import TokenIcon from 'common/token-icon';
import ArrowRight from 'assets/svg/atom/arrow-right';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from 'utils/currency';
import Divider from '@material-ui/core/Divider';

import { getFrequencyLabel } from 'utils/parsing';
import { POSITION_ACTIONS, STABLE_COINS, STRING_SWAP_INTERVALS } from 'config/constants';
import useUsdPrice from 'hooks/useUsdPrice';

interface DetailsProps {
  position: FullPosition;
}

const StyledChip = styled(Chip)`
  margin: 0px 5px;
`;

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

const Details = ({ position }: DetailsProps) => {
  const swappedActions = position.history.filter((history) => history.action === POSITION_ACTIONS.SWAPPED);
  let summedPrices = BigNumber.from(0);
  swappedActions.forEach((action) => {
    // eslint-disable-next-line no-nested-ternary
    const rate = STABLE_COINS.includes(position.to.symbol)
      ? BigNumber.from(action.ratePerUnitBToAWithFee)
      : position.pair.tokenA.address === position.from.address
      ? BigNumber.from(action.ratePerUnitAToBWithFee)
      : BigNumber.from(action.ratePerUnitBToAWithFee);

    summedPrices = summedPrices.add(rate);
  });
  const averageBuyPrice = summedPrices.gt(BigNumber.from(0))
    ? summedPrices.div(swappedActions.length)
    : BigNumber.from(0);
  const tokenFromAverage = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
  const tokenToAverage = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(
    position.from,
    BigNumber.from(position.current.remainingLiquidity)
  );
  const [toPrice, isLoadingToPrice] = useUsdPrice(position.to, BigNumber.from(position.current.idleSwapped));
  const [toFullPrice, isLoadingToFullPrice] = useUsdPrice(position.to, BigNumber.from(position.totalSwapped));
  const showToFullPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToFullPrice && !!toFullPrice;
  const showToPrice = !STABLE_COINS.includes(position.to.symbol) && !isLoadingToPrice && !!toPrice;
  const showFromPrice = !STABLE_COINS.includes(position.from.symbol) && !isLoadingFromPrice && !!fromPrice;

  return (
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
              <Typography
                variant="caption"
                style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
              >
                <FormattedMessage
                  description="positionDetailsHistoricallySwapped"
                  defaultMessage="{swapped} {to}"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    swapped: formatCurrencyAmount(BigNumber.from(position.totalSwapped), position.to),
                    to: position.to.symbol,
                  }}
                />
                {showToFullPrice && (
                  <StyledChip
                    color="primary"
                    size="small"
                    label={
                      <FormattedMessage
                        description="positionDetailsHistoricallySwappedPrice"
                        defaultMessage="({toPrice} USD)"
                        values={{
                          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          toPrice: toFullPrice?.toFixed(2),
                        }}
                      />
                    }
                  />
                )}
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
                <FormattedMessage
                  description="positionDetailsToWithdrawTitle"
                  defaultMessage="Available to withdraw:"
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
              >
                <FormattedMessage
                  description="positionDetailsToWithdraw"
                  defaultMessage="{toWithdraw} {to}"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    toWithdraw: formatCurrencyAmount(BigNumber.from(position.current.idleSwapped), position.to),
                    to: position.to.symbol,
                  }}
                />
                {showToPrice && (
                  <StyledChip
                    color="primary"
                    size="small"
                    label={
                      <FormattedMessage
                        description="positionDetailsToWithdrawPrice"
                        defaultMessage="({toPrice} USD)"
                        values={{
                          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          toPrice: toPrice?.toFixed(2),
                        }}
                      />
                    }
                  />
                )}
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
              <Typography
                variant="caption"
                style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
              >
                <FormattedMessage
                  description="positionDetailsRemainingFunds"
                  defaultMessage="{funds} {from}"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    funds: formatCurrencyAmount(BigNumber.from(position.current.remainingLiquidity), position.from),
                    from: position.from.symbol,
                  }}
                />
                {showFromPrice && (
                  <StyledChip
                    color="primary"
                    size="small"
                    label={
                      <FormattedMessage
                        description="positionDetailsRemainingFundsPrice"
                        defaultMessage="({fromPrice} USD)"
                        values={{
                          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                          fromPrice: fromPrice?.toFixed(2),
                        }}
                      />
                    }
                  />
                )}
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
                <FormattedMessage
                  description="positionDetailsAverageBuyPriceTitle"
                  defaultMessage="Average buy price:"
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                {averageBuyPrice.gt(BigNumber.from(0)) ? (
                  <FormattedMessage
                    description="positionDetailsAverageBuyPrice"
                    defaultMessage="1 {from} = {average} {to}"
                    values={{
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                      from: tokenFromAverage.symbol,
                      to: tokenToAverage.symbol,
                      average: formatCurrencyAmount(averageBuyPrice, tokenToAverage),
                    }}
                  />
                ) : (
                  <FormattedMessage description="positionDetailsAverageBuyPriceNotSwap" defaultMessage="No swaps yet" />
                )}
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
                {parseInt(position.current.remainingSwaps, 10) > 0 ? (
                  getFrequencyLabel(position.swapInterval.interval, position.current.remainingSwaps)
                ) : (
                  <FormattedMessage
                    description="positionDetailsRemainingSwapsNone"
                    defaultMessage="Position finished"
                  />
                )}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider variant="middle" />
        </Grid>
        <Grid item xs={12}>
          <Tooltip
            title={DateTime.fromSeconds(parseInt(position.createdAtTimestamp, 10)).toLocaleString(
              DateTime.DATETIME_FULL
            )}
            arrow
            placement="top"
          >
            <Typography variant="body2" component="span">
              <FormattedMessage
                description="positionDetailsCreatedAt"
                defaultMessage="Created at {created}"
                values={{
                  created: DateTime.fromSeconds(parseInt(position.createdAtTimestamp, 10)).toRelative(),
                }}
              />
            </Typography>
          </Tooltip>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Details;
