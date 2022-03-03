import React from 'react';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import CallMadeIcon from '@material-ui/icons/CallMade';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import CreatedIcon from '@material-ui/icons/NewReleases';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { ActionState, FullPosition } from 'types';
import { DateTime } from 'luxon';
import { formatCurrencyAmount } from 'utils/currency';
import { COMPANION_ADDRESS, POSITION_ACTIONS, STABLE_COINS, STRING_PERMISSIONS } from 'config/constants';
import { getFrequencyLabel } from 'utils/parsing';
import { buildEtherscanAddress } from 'utils/etherscan';
import Link from '@material-ui/core/Link';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import Address from 'common/address';

const StyledCard = styled(Card)``;

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 3px;
  font-size: 15px;
`;

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.type === 'light' ? '#3f51b5' : '#8699ff'};
  `}
  margin: 0px 5px;
`;

const StyledTimeline = styled(Grid)`
  position: relative;
  padding: 0px 0px 0px 10px;
  margin-top: 10px;
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
  ${({ theme }) => `
    position: relative;
    &:last-child {
      :before {
        content: '';
        position: absolute;
        top: 20px;
        width: 4px;
        bottom: 0;
        background: ${theme.palette.type === 'light' ? '#ffffff' : '#303030'};
      }
    }
  `}
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
  ${({ theme }) => `
    position: absolute;
    left: -24px;
    top: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    text-align: center;
    font-size: 2rem;
    background: ${theme.palette.type === 'light' ? '#eee' : '#424242'};

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
  `}
`;

const StyledTimelineContent = styled.div`
  ${({ theme }) => `
    padding: 20px 0px 15px 45px;
    position: relative;
    &:before {
      content: '';
      background: ${theme.palette.type === 'light' ? '#eee' : '#595959'};
      width: 20px;
      height: 20px;
      left: 35px;
      top: 35px;
      display: block;
      position: absolute;
      transform: rotate(45deg);
      border-radius: 0 0 0 2px;
    }
  `}
`;

const StyledTimelineContentText = styled(Grid)`
  padding: 10px 20px;
`;

const StyledTimelineContentTitle = styled(Grid)`
  ${({ theme }) => `
    padding: 10px 20px;
    background-color: ${theme.palette.type === 'light' ? '#eee' : '#595959'};
  `}
`;

interface PositionTimelineProps {
  position: FullPosition;
  filter: 0 | 1 | 2 | 3; // 0 - all; 1 - swaps; 2 - modifications; 3 - withdraws
}

const buildSwappedItem = (positionState: ActionState, position: FullPosition) => {
  const TooltipMessage = (
    <FormattedMessage
      description="pairSwapDetails"
      defaultMessage="1 {from} = {swapRate} {to}"
      values={{
        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
        from: STABLE_COINS.includes(position.to.symbol) ? position.to.symbol : position.from.symbol,
        to: STABLE_COINS.includes(position.to.symbol) ? position.from.symbol : position.to.symbol,
        // eslint-disable-next-line no-nested-ternary
        swapRate: STABLE_COINS.includes(position.to.symbol)
          ? formatCurrencyAmount(BigNumber.from(positionState.ratePerUnitBToAWithFee), position.pair.tokenA)
          : position.pair.tokenA.address === position.from.address
          ? formatCurrencyAmount(BigNumber.from(positionState.ratePerUnitAToBWithFee), position.pair.tokenB)
          : formatCurrencyAmount(BigNumber.from(positionState.ratePerUnitBToAWithFee), position.pair.tokenA),
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
              defaultMessage="Swapped <b>{rate} {from}</b> for <b>{result} {to}</b>"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                result: formatCurrencyAmount(BigNumber.from(positionState.swapped), position.to),
                from: position.from.symbol,
                to: position.to.symbol,
                rate: formatCurrencyAmount(BigNumber.from(positionState.rate), position.from),
              }}
            />
          </Typography>
          <Tooltip title={TooltipMessage} arrow placement="top">
            <StyledHelpOutlineIcon fontSize="inherit" />
          </Tooltip>
        </StyledCenteredGrid>
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
    title: <FormattedMessage description="timelineTypeSwap" defaultMessage="Swap Executed" />,
    toOrder: parseInt(positionState.createdAtBlock, 10),
  };
};

const buildCreatedItem = (positionState: ActionState, position: FullPosition) => ({
  icon: <CreatedIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionCreatedRate"
            defaultMessage="Rate: <b>{rate} {from}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              rate: formatCurrencyAmount(BigNumber.from(positionState.rate), position.from),
              from: position.from.symbol,
            }}
          />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionCreatedSwaps"
            defaultMessage="Set to run for <b>{frequency}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              swaps: positionState.remainingSwaps,
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
  title: <FormattedMessage description="timelineTypeCreated" defaultMessage="Position Created" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildTransferedItem = (positionState: ActionState, position: FullPosition, chainId: number) => ({
  icon: <CardGiftcardIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="from"
            defaultMessage="From "
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              from: positionState.from,
              to: positionState.to,
            }}
          />
          <StyledLink href={buildEtherscanAddress(positionState.from, chainId)} target="_blank" rel="noreferrer">
            <Address address={positionState.from} />
            <CallMadeIcon style={{ fontSize: '1rem' }} />
          </StyledLink>
          <FormattedMessage
            description="to"
            defaultMessage=" to"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              from: positionState.from,
              to: positionState.to,
            }}
          />
          <StyledLink href={buildEtherscanAddress(positionState.to, chainId)} target="_blank" rel="noreferrer">
            <Address address={positionState.to} />
            <CallMadeIcon style={{ fontSize: '1rem' }} />
          </StyledLink>
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
  title: <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position Transfered" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildPermissionsModifiedItem = (positionState: ActionState, position: FullPosition, chainId: number) => ({
  icon: <FingerprintIcon />,
  content: (
    <>
      <Grid item xs={12}>
        {positionState.permissions.map((permission) => (
          <Typography variant="body1">
            {permission.permissions.length ? (
              <>
                <StyledLink href={buildEtherscanAddress(permission.operator, chainId)} target="_blank" rel="noreferrer">
                  {permission.operator.toLowerCase() === COMPANION_ADDRESS[chainId].toLowerCase() ? (
                    'Mean Finance Companion'
                  ) : (
                    <Address address={permission.operator} />
                  )}
                  <CallMadeIcon style={{ fontSize: '1rem' }} />
                </StyledLink>
                <FormattedMessage
                  description="positionPermissionsModified only"
                  defaultMessage="will only be able to"
                />
                {permission.permissions.map(
                  (permissionString, index) =>
                    ` ${
                      index === permission.permissions.length - 1 && permission.permissions.length > 1 ? 'and ' : ''
                    }${STRING_PERMISSIONS[permissionString].toLowerCase()}${
                      index !== permission.permissions.length - 1 && index !== permission.permissions.length - 2
                        ? ','
                        : ''
                    } `
                )}
                <FormattedMessage
                  description="positionPermissionsModified your position"
                  defaultMessage="your position"
                />
              </>
            ) : (
              <>
                <FormattedMessage
                  description="positionPermissionsModified all"
                  defaultMessage="Removed all permissions for"
                />
                <StyledLink href={buildEtherscanAddress(permission.operator, chainId)} target="_blank" rel="noreferrer">
                  {permission.operator.toLowerCase() === COMPANION_ADDRESS[chainId].toLowerCase() ? (
                    'Mean Finance Companion'
                  ) : (
                    <Address address={permission.operator} />
                  )}
                  <CallMadeIcon style={{ fontSize: '1rem' }} />
                </StyledLink>
              </>
            )}
          </Typography>
        ))}
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
  title: <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position permissions modified" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildModifiedRateItem = (positionState: ActionState, position: FullPosition) => ({
  icon: <SettingsIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionModifiedRate"
            defaultMessage="{increaseDecrease} rate from <b>{oldRate} {from}</b> to <b>{rate} {from}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              increaseDecrease: BigNumber.from(positionState.oldRate).lt(BigNumber.from(positionState.rate))
                ? 'Increased'
                : 'Decreased',
              rate: formatCurrencyAmount(BigNumber.from(positionState.rate), position.from),
              oldRate: formatCurrencyAmount(BigNumber.from(positionState.oldRate), position.from),
              from: position.from.symbol,
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
  title: <FormattedMessage description="timelineTypeModified" defaultMessage="Rate Modified" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildModifiedDurationItem = (positionState: ActionState, position: FullPosition) => ({
  icon: <SettingsIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionModifiedSwaps"
            defaultMessage="{increaseDecrease} duration to run for <b>{frequency}</b> from <b>{oldFrequency}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              increaseDecrease: BigNumber.from(positionState.oldRemainingSwaps).lt(
                BigNumber.from(positionState.remainingSwaps)
              )
                ? 'Increased'
                : 'Decreased',
              frequency: getFrequencyLabel(position.swapInterval.interval, positionState.remainingSwaps),
              oldFrequency: getFrequencyLabel(position.swapInterval.interval, positionState.oldRemainingSwaps),
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
  title: <FormattedMessage description="timelineTypeModified" defaultMessage="Changed duration" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildModifiedRateAndDurationItem = (positionState: ActionState, position: FullPosition) => ({
  icon: <SettingsIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionModifiedRate"
            defaultMessage="{increaseDecrease} rate from <b>{oldRate} {from}</b> to <b>{rate} {from}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              increaseDecrease: BigNumber.from(positionState.oldRate).lt(BigNumber.from(positionState.rate))
                ? 'Increased'
                : 'Decreased',
              rate: formatCurrencyAmount(BigNumber.from(positionState.rate), position.from),
              oldRate: formatCurrencyAmount(BigNumber.from(positionState.oldRate), position.from),
              from: position.from.symbol,
            }}
          />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionModifiedSwaps"
            defaultMessage="{increaseDecrease} duration to run for <b>{frequency}</b> from <b>{oldFrequency}</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              increaseDecrease: BigNumber.from(positionState.oldRemainingSwaps).lt(
                BigNumber.from(positionState.remainingSwaps)
              )
                ? 'Increased'
                : 'Decreased',
              frequency: getFrequencyLabel(position.swapInterval.interval, positionState.remainingSwaps),
              oldFrequency: getFrequencyLabel(position.swapInterval.interval, positionState.oldRemainingSwaps),
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
  title: <FormattedMessage description="timelineTypeModified" defaultMessage="Position Modified" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildWithdrawnItem = (positionState: ActionState, position: FullPosition) => ({
  icon: <CallMadeIcon />,
  content: (
    <>
      <Grid item xs={12}>
        <Typography variant="body1">
          <FormattedMessage
            description="positionWithdrawn"
            defaultMessage="Withdraw <b>{withdraw} {to}</b> from position"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              withdraw: formatCurrencyAmount(BigNumber.from(positionState.withdrawn), position.to),
              to: position.to.symbol,
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
  title: <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Withdrawn" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const buildTerminatedItem = (positionState: ActionState) => ({
  icon: <DeleteSweepIcon />,
  content: (
    <>
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
  title: <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Terminated" />,
  toOrder: parseInt(positionState.createdAtBlock, 10),
});

const MESSAGE_MAP = {
  [POSITION_ACTIONS.CREATED]: buildCreatedItem,
  [POSITION_ACTIONS.MODIFIED_DURATION]: buildModifiedDurationItem,
  [POSITION_ACTIONS.MODIFIED_RATE]: buildModifiedRateItem,
  [POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION]: buildModifiedRateAndDurationItem,
  [POSITION_ACTIONS.SWAPPED]: buildSwappedItem,
  [POSITION_ACTIONS.WITHDREW]: buildWithdrawnItem,
  [POSITION_ACTIONS.TERMINATED]: buildTerminatedItem,
  [POSITION_ACTIONS.TRANSFERED]: buildTransferedItem,
  [POSITION_ACTIONS.PERMISSIONS_MODIFIED]: buildPermissionsModifiedItem,
};

const FILTERS = {
  0: [
    POSITION_ACTIONS.CREATED,
    POSITION_ACTIONS.MODIFIED_DURATION,
    POSITION_ACTIONS.MODIFIED_RATE,
    POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
    POSITION_ACTIONS.SWAPPED,
    POSITION_ACTIONS.WITHDREW,
    POSITION_ACTIONS.TRANSFERED,
    POSITION_ACTIONS.TERMINATED,
    POSITION_ACTIONS.PERMISSIONS_MODIFIED,
  ],
  1: [POSITION_ACTIONS.SWAPPED],
  2: [
    POSITION_ACTIONS.CREATED,
    POSITION_ACTIONS.MODIFIED_DURATION,
    POSITION_ACTIONS.MODIFIED_RATE,
    POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
    POSITION_ACTIONS.TRANSFERED,
    POSITION_ACTIONS.TERMINATED,
    POSITION_ACTIONS.PERMISSIONS_MODIFIED,
  ],
  3: [POSITION_ACTIONS.WITHDREW],
};

const PositionTimeline = ({ position, filter }: PositionTimelineProps) => {
  let history = [];
  const currentNetwork = useCurrentNetwork();

  const mappedPositionHistory = position.history
    .filter((positionState) => FILTERS[filter].includes(positionState.action))
    .map((positionState) => MESSAGE_MAP[positionState.action](positionState, position, currentNetwork.chainId));

  history = orderBy(mappedPositionHistory, ['toOrder'], ['desc']);

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
