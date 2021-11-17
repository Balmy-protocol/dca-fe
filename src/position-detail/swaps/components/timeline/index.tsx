import React from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import SettingsIcon from '@material-ui/icons/Settings';
import CreatedIcon from '@material-ui/icons/NewReleases';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { FullPosition, PairSwaps } from 'types';
import { DateTime } from 'luxon';
import { formatCurrencyAmount } from 'utils/currency';
import { STABLE_COINS } from 'config/constants';
import { getFrequencyLabel } from 'utils/parsing';

const StyledCard = styled(Card)``;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 3px;
  font-size: 15px;
`;

const StyledTimeline = styled(Grid)`
  position: relative;
  padding: 0px 0px 0px 10px;
  &:before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    width: 4px;
    height: 100%;
    background: #0088cc;
  }
`;

const StyledTimelineContainer = styled(Grid)`
  position: relative;
`;

const StyledCenteredGrid = styled(Grid)`
  display: flex;
  align-items: center;
`;

const StyledRightGrid = styled(Grid)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledTimelineIcon = styled.div`
  position: absolute;
  left: -24px;
  top: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  text-align: center;
  font-size: 2rem;
  background: white;

  i {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const StyledTimelineContent = styled.div`
  padding: 20px 0px 15px 45px;
  position: relative;
  &:before {
    content: '';
    background: #d4d4d4;
    width: 20px;
    height: 20px;
    left: 35px;
    top: 35px;
    display: block;
    position: absolute;
    transform: rotate(45deg);
    border-radius: 0 0 0 2px;
  }
`;

const StyledTimelineContentText = styled(Grid)`
  padding: 10px 20px;
`;

const StyledTimelineContentTitle = styled(Grid)`
  padding: 10px 20px;
  background-color: #d4d4d4;
`;

interface PositionTimelineProps {
  swaps: PairSwaps[];
  position: FullPosition;
}

const PositionTimeline = ({ swaps, position }: PositionTimelineProps) => {
  let history = [];

  const mappedSwaps = swaps.map((pairSwap) => {
    const TooltipMessage = (
      <FormattedMessage
        description="pairSwapDetails"
        defaultMessage="1 {from} = {swapRate} {to}"
        values={{
          b: (chunks: any) => <b>{chunks}</b>,
          from: STABLE_COINS.includes(position.to.symbol) ? position.to.symbol : position.from.symbol,
          to: STABLE_COINS.includes(position.to.symbol) ? position.from.symbol : position.to.symbol,
          swapRate: STABLE_COINS.includes(position.to.symbol)
            ? formatCurrencyAmount(BigNumber.from(pairSwap.ratePerUnitAToBWithFee), position.pair.tokenB)
            : position.pair.tokenA.address === position.from.address
            ? formatCurrencyAmount(BigNumber.from(pairSwap.ratePerUnitAToBWithFee), position.pair.tokenB)
            : formatCurrencyAmount(BigNumber.from(pairSwap.ratePerUnitBToAWithFee), position.pair.tokenA),
        }}
      />
    );

    return {
      icon: <CompareArrowsIcon />,
      content: (
        <>
          <StyledCenteredGrid item xs={12}>
            <Typography variant="body1" component="span">
              <FormattedMessage
                description="pairSwapDetails"
                defaultMessage="Swapped <b>{rate} {from}</b> to <b>{result} {to}</b>"
                values={{
                  b: (chunks: any) => <b>{chunks}</b>,
                  result:
                    position.pair.tokenA.address === position.from.address
                      ? formatCurrencyAmount(
                          BigNumber.from(pairSwap.ratePerUnitAToBWithFee)
                            .mul(BigNumber.from(position.current.rate))
                            .div(BigNumber.from('10').pow(position.from.decimals)),
                          position.to
                        )
                      : formatCurrencyAmount(
                          BigNumber.from(pairSwap.ratePerUnitBToAWithFee)
                            .mul(BigNumber.from(position.current.rate))
                            .div(BigNumber.from('10').pow(position.from.decimals)),
                          position.to
                        ),
                  from: position.from.symbol,
                  to: position.to.symbol,
                  rate: formatCurrencyAmount(BigNumber.from(position.current.rate), position.from),
                }}
              />
            </Typography>
            <Tooltip title={TooltipMessage} arrow placement="top">
              <StyledHelpOutlineIcon fontSize="inherit" />
            </Tooltip>
          </StyledCenteredGrid>
          <StyledRightGrid item xs={12}>
            <Tooltip
              title={DateTime.fromSeconds(parseInt(pairSwap.executedAtTimestamp, 10)).toLocaleString(
                DateTime.DATETIME_FULL
              )}
              arrow
              placement="top"
            >
              <Typography variant="body2" component="span">
                {DateTime.fromSeconds(parseInt(pairSwap.executedAtTimestamp, 10)).toRelative()}
              </Typography>
            </Tooltip>
          </StyledRightGrid>
        </>
      ),
      title: <FormattedMessage description="timelineTypeSwap" defaultMessage="Swap Executed" />,
      toOrder: pairSwap.executedAtTimestamp,
    };
  });

  const mappedPositionHistory = position.history.map((positionState, index) => ({
    icon: index === 0 ? <CreatedIcon /> : <SettingsIcon />,
    content: (
      <>
        <Grid item xs={12}>
          <Typography variant="body1">
            <FormattedMessage
              description="positionModifiedRate"
              defaultMessage="Rate: <b>{rate} {from}</b>"
              values={{
                b: (chunks: any) => <b>{chunks}</b>,
                rate: formatCurrencyAmount(BigNumber.from(positionState.rate), position.from),
                from: position.from.symbol,
              }}
            />
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <FormattedMessage
              description="positionModifiedSwaps"
              defaultMessage="Set to run for <b>{swaps} {frequency}</b>"
              values={{
                b: (chunks: any) => <b>{chunks}</b>,
                swaps: parseInt(positionState.lastSwap, 10) - parseInt(positionState.startingSwap, 10) + 1,
                frequency: getFrequencyLabel(position.swapInterval.interval, positionState.remainingSwaps),
              }}
            />
          </Typography>
        </Grid>
        <StyledRightGrid item xs={12}>
          <Tooltip
            title={DateTime.fromSeconds(parseInt(positionState.createdAtTimestamp, 10)).toLocaleString(
              DateTime.DATETIME_FULL
            )}
            arrow
            placement="top"
          >
            <Typography variant="body2" component="span">
              {DateTime.fromSeconds(parseInt(positionState.createdAtTimestamp, 10)).toRelative()}
            </Typography>
          </Tooltip>
        </StyledRightGrid>
      </>
    ),
    title:
      index === 0 ? (
        <FormattedMessage description="timelineTypeCreated" defaultMessage="Position Created" />
      ) : (
        <FormattedMessage description="timelineTypeModified" defaultMessage="Position Modified" />
      ),
    toOrder: positionState.createdAtTimestamp,
  }));

  history = orderBy([...mappedPositionHistory, ...mappedSwaps], ['toOrder'], ['desc']);

  return (
    <StyledTimeline container>
      {history.map((historyItem) => (
        <StyledTimelineContainer item xs={12}>
          <StyledTimelineIcon>{historyItem.icon}</StyledTimelineIcon>
          <StyledTimelineContent>
            <StyledCard variant="outlined">
              <Grid container>
                <StyledTimelineContentTitle item xs={12}>
                  <Typography variant="h6">{historyItem.title}</Typography>
                </StyledTimelineContentTitle>
                <Grid item xs={12}>
                  <StyledTimelineContentText container>{historyItem.content}</StyledTimelineContentText>
                </Grid>
              </Grid>
            </StyledCard>
          </StyledTimelineContent>
        </StyledTimelineContainer>
      ))}
    </StyledTimeline>
  );
};
export default PositionTimeline;
