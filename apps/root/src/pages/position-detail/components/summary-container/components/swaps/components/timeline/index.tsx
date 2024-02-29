import React, { useState } from 'react';

import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import {
  Grid,
  Link,
  Typography,
  Tooltip,
  CompareArrowsIcon,
  OpenInNewIcon,
  SettingsIcon,
  DeleteSweepIcon,
  NewReleasesIcon as CreatedIcon,
  HelpOutlineIcon,
  CardGiftcardIcon,
  FingerprintIcon,
  Theme,
  baseColors,
  colors,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  DCAPositionCreatedAction,
  DCAPositionModifiedAction,
  DCAPositionPermissionsModifiedAction,
  DCAPositionSwappedAction,
  DCAPositionTerminatedAction,
  DCAPositionTransferredAction,
  DCAPositionWithdrawnAction,
  Position,
  PositionWithHistory,
} from '@types';
import { DateTime } from 'luxon';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { STABLE_COINS, STRING_PERMISSIONS, isCompanionAddress } from '@constants';
import { getFrequencyLabel } from '@common/utils/parsing';
import { buildEtherscanAddress, buildEtherscanTransaction } from '@common/utils/etherscan';
import Address from '@common/components/address';
import { withStyles } from 'tss-react/mui';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import CustomChip from '@common/components/custom-chip';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { ActionTypeAction } from '@mean-finance/sdk';
import { usePositionPrices } from '@state/position-details/hooks';
import { sdkPermissionsToPermissionData } from '@common/utils/sdk';

const DarkTooltip = withStyles(Tooltip, (theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 3px;
  font-size: 15px;
`;

const StyledLink = styled(Link)<{ $isFirst?: boolean }>`
  margin: ${({ $isFirst }) => ($isFirst ? '0px 5px 0px 0px' : '0px 5px')};
  display: flex;
`;

const StyledTimeline = styled(Grid)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    position: relative;
    padding: 0px 0px 0px 21px;
    &:before {
      content: '';
      position: absolute;
      left: 21px;
      top: 5px;
      width: 4px;
      bottom: 0;
      border-left: 3px dashed ${colors[mode].violet.violet100};
    }
  `}
`;

const StyledTimelineContainer = styled(Grid)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  &:first-child {
    :before {
      content: '';
      position: absolute;
      bottom: calc(50% + 21px);
      width: 4px;
      left: 0;
      top: 0;
      background: ${colors[mode].violet.violet200};
    }
  }
  &:last-child {
    margin-bottom: 0px;
    :before {
      content: '';
      position: absolute;
      top: calc(50% - 21px);
      width: 4px;
      left: 0;
      bottom: 0;
      background: ${colors[mode].violet.violet200};
    }
  }
  `}
`;

const StyledCenteredGrid = styled(Grid)`
  display: flex;
  align-items: center;
`;

const StyledTitleEnd = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledTimelineIcon = styled.div`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    position: absolute;
    left: -21px;
    top: calc(50% - 21px);
    width: 43px;
    height: 43px;
    border-radius: 50%;
    text-align: center;
    border: 1px solid ${colors[mode].violet.violet100};
    background: ${colors[mode].violet.violet200};

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
  padding: 0px;
  position: relative;
  text-align: start;
  padding: 0px 10px 0px 22px;
  overflow-wrap: anywhere;
  flex-grow: 1;
`;

const StyledTimelineContentText = styled(Grid)``;

const StyledTimelineContentTitle = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitleMainText = styled(Typography)``;

const StyledTimelineWrappedContent = styled(Typography)`
  display: flex;
  align-items: center;
  white-space: break-spaces;
  gap: 5px;
  flex-wrap: wrap;
`;

interface PositionTimelineProps {
  position: PositionWithHistory;
  filter: 0 | 1 | 2 | 3; // 0 - all; 1 - swaps; 2 - modifications; 3 - withdraws
}

const buildSwappedItem = (
  positionState: DCAPositionSwappedAction,
  position: Position,
  chainId: number,
  fromPrice?: bigint,
  toPrice?: bigint
) => ({
  icon: <CompareArrowsIcon />,
  content: () => {
    const { swapped, rate, generatedByYield, tokenA, tokenB } = positionState;
    const yieldRate = generatedByYield?.rate || 0n;
    const yieldFrom = BigInt(yieldRate) - BigInt(rate);
    const to =
      position.to.address === tokenA.address
        ? {
            ...tokenA,
            ...position.to,
          }
        : {
            ...tokenB,
            ...position.to,
          };
    const from =
      position.from.address === tokenA.address
        ? {
            ...tokenA,
            ...position.from,
          }
        : {
            ...tokenB,
            ...position.from,
          };

    const { price: oldToPrice } = to;
    const { price: oldFromPrice } = from;

    const currentToUsd = parseUsdPrice(to, swapped, toPrice);
    const toUsd = parseUsdPrice(to, swapped, parseNumberUsdPriceToBigInt(oldToPrice));
    const currentFromUsd = parseUsdPrice(from, rate, fromPrice);
    const fromUsd = parseUsdPrice(from, rate, parseNumberUsdPriceToBigInt(oldFromPrice));
    const currentFromYieldUsd = parseUsdPrice(from, yieldRate, fromPrice);
    const fromYieldUsd = parseUsdPrice(from, yieldRate, parseNumberUsdPriceToBigInt(oldFromPrice));

    const showToPrices = !!toUsd && !!currentToUsd;
    const showFromPrices = !!fromUsd && !!currentFromUsd;
    const showFromYieldPrices = !!fromYieldUsd && !!currentFromYieldUsd;

    const [showToCurrentPrice, setShouldShowToCurrentPrice] = useState(true);
    const [showFromCurrentPrice, setShouldShowFromCurrentPrice] = useState(true);
    const [showFromYieldCurrentPrice, setShouldShowFromYieldCurrentPrice] = useState(true);
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    let tokenFrom = STABLE_COINS.includes(position.to.symbol) ? position.from : position.to;
    let tokenTo = STABLE_COINS.includes(position.to.symbol) ? position.to : position.from;
    tokenFrom =
      tokenFrom.address === PROTOCOL_TOKEN_ADDRESS
        ? { ...wrappedProtocolToken, symbol: tokenFrom.symbol, underlyingTokens: tokenFrom.underlyingTokens }
        : tokenFrom;
    tokenTo =
      tokenTo.address === PROTOCOL_TOKEN_ADDRESS
        ? { ...wrappedProtocolToken, symbol: tokenTo.symbol, underlyingTokens: tokenTo.underlyingTokens }
        : tokenTo;

    const TooltipMessage = (
      <FormattedMessage
        description="pairSwapDetails"
        defaultMessage="1 {from} = {currencySymbol}{swapRate} {to}"
        values={{
          from: tokenFrom.symbol,
          to: STABLE_COINS.includes(tokenTo.symbol) ? 'USD' : tokenTo.symbol,
          swapRate:
            positionState.tokenA.address ===
            ((tokenFrom.underlyingTokens[0] && tokenFrom.underlyingTokens[0].address) || tokenFrom.address)
              ? formatCurrencyAmount(BigInt(positionState.ratioAToBWithFee), tokenTo, 4)
              : formatCurrencyAmount(BigInt(positionState.ratioBToAWithFee), tokenTo, 4),
          currencySymbol: STABLE_COINS.includes(tokenTo.symbol) ? '$' : '',
        }}
      />
    );

    return (
      <>
        <StyledCenteredGrid item xs={12}>
          <StyledTimelineWrappedContent variant="body">
            <StyledTitleMainText variant="body">
              <FormattedMessage description="pairSwapDetails" defaultMessage="Swapped:" />
            </StyledTitleMainText>
            <CustomChip
              icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}
              pointer
              extraText={
                showFromPrices && (
                  <DarkTooltip
                    title={
                      showFromCurrentPrice
                        ? 'Displaying current value. Click to show value on day of withdrawal'
                        : 'Estimated value on day of withdrawal'
                    }
                    arrow
                    placement="top"
                    onClick={() => setShouldShowFromCurrentPrice(!showFromCurrentPrice)}
                  >
                    <div>(${showFromCurrentPrice ? currentFromUsd?.toFixed(2) : fromUsd?.toFixed(2)} USD)</div>
                  </DarkTooltip>
                )
              }
            >
              <Typography variant="body">{formatCurrencyAmount(BigInt(rate), position.from, 4)}</Typography>
            </CustomChip>
            {yieldFrom > 0n && (
              <>
                <Typography variant="bodySmall" color={baseColors.disabledText}>
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography>
                <CustomChip
                  icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}
                  pointer
                  extraText={
                    showFromYieldPrices && (
                      <DarkTooltip
                        title={
                          showFromYieldCurrentPrice
                            ? 'Displaying current value. Click to show value on day of withdrawal'
                            : 'Estimated value on day of withdrawal'
                        }
                        arrow
                        placement="top"
                        onClick={() => setShouldShowFromYieldCurrentPrice(!showFromYieldCurrentPrice)}
                      >
                        <div>
                          (${showFromYieldCurrentPrice ? currentFromYieldUsd?.toFixed(2) : fromYieldUsd?.toFixed(2)}{' '}
                          USD)
                        </div>
                      </DarkTooltip>
                    )
                  }
                >
                  <Typography variant="body">{formatCurrencyAmount(yieldFrom, position.from, 4)}</Typography>
                </CustomChip>
              </>
            )}
            <FormattedMessage description="pairSwapDetailsFor" defaultMessage="for" />
            <CustomChip
              icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.to} />}
              pointer
              extraText={
                showToPrices && (
                  <DarkTooltip
                    title={
                      showToCurrentPrice
                        ? 'Displaying current value. Click to show value on day of withdrawal'
                        : 'Estimated value on day of withdrawal'
                    }
                    arrow
                    placement="top"
                    onClick={() => setShouldShowToCurrentPrice(!showToCurrentPrice)}
                  >
                    <div>(${showToCurrentPrice ? currentToUsd?.toFixed(2) : toUsd?.toFixed(2)} USD)</div>
                  </DarkTooltip>
                )
              }
            >
              <Typography variant="body">{formatCurrencyAmount(BigInt(swapped), position.to, 4)}</Typography>
            </CustomChip>
          </StyledTimelineWrappedContent>
          <Tooltip title={TooltipMessage} arrow placement="top">
            <StyledHelpOutlineIcon fontSize="inherit" />
          </Tooltip>
        </StyledCenteredGrid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeSwap" defaultMessage="Swap Executed" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildCreatedItem = (positionState: DCAPositionCreatedAction, position: Position) => ({
  icon: <CreatedIcon />,
  content: () => {
    const intl = useIntl();

    return (
      <>
        <Grid item xs={12}>
          <StyledTimelineWrappedContent variant="body">
            <StyledTitleMainText variant="body">
              <FormattedMessage description="positionCreatedRate" defaultMessage="Rate:" />
            </StyledTitleMainText>
            <CustomChip icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}>
              <Typography variant="body">{formatCurrencyAmount(positionState.rate, position.from)}</Typography>
            </CustomChip>
          </StyledTimelineWrappedContent>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body"
            component="p"
            style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
          >
            <StyledTitleMainText variant="body">
              <FormattedMessage description="positionCreatedSwaps" defaultMessage="Set to run for:" />
            </StyledTitleMainText>
            {` ${getFrequencyLabel(intl, position.swapInterval.toString(), positionState.swaps.toString())}`}
          </Typography>
        </Grid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeCreated" defaultMessage="Position Created" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildTransferedItem = (positionState: DCAPositionTransferredAction, position: Position) => ({
  icon: <CardGiftcardIcon />,
  content: () => (
    <>
      <Grid item xs={12}>
        <Typography
          variant="body"
          component="p"
          style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
        >
          <StyledTitleMainText variant="body">
            <FormattedMessage description="transferedFrom" defaultMessage="Transfered from:" />
          </StyledTitleMainText>
          <StyledLink
            href={buildEtherscanAddress(positionState.from, position.chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <Address address={positionState.from} />
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </StyledLink>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography
          variant="body"
          component="p"
          style={{ display: 'flex', alignItems: 'center', whiteSpace: 'break-spaces' }}
        >
          <StyledTitleMainText variant="body">
            <FormattedMessage description="transferedTo" defaultMessage="Transfered to:" />
          </StyledTitleMainText>
          <StyledLink href={buildEtherscanAddress(positionState.to, position.chainId)} target="_blank" rel="noreferrer">
            <Address address={positionState.to} />
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </StyledLink>
        </Typography>
      </Grid>
    </>
  ),
  title: <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position Transfered" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildPermissionsModifiedItem = (
  positionState: DCAPositionPermissionsModifiedAction,
  position: Position,
  chainId: number
) => ({
  icon: <FingerprintIcon />,
  content: () => {
    const intl = useIntl();
    return (
      <>
        <Grid item xs={12}>
          {Object.values(sdkPermissionsToPermissionData(positionState.permissions)).map((permission, index) => (
            <Typography variant="body" key={permission.operator}>
              {permission.permissions.length ? (
                <>
                  <StyledLink
                    href={buildEtherscanAddress(permission.operator, position.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    $isFirst={index === 0}
                    sx={{ display: 'inline-block !important' }}
                  >
                    {isCompanionAddress(permission.operator, chainId).isCompanion ? (
                      `${
                        (isCompanionAddress(permission.operator, chainId).isOldCompanion && 'Old ') || ''
                      }Mean Finance Companion`
                    ) : (
                      <Address address={permission.operator} />
                    )}
                    <OpenInNewIcon style={{ fontSize: '1rem' }} />
                  </StyledLink>
                  <FormattedMessage
                    description="positionPermissionsModified only"
                    defaultMessage="will only be able to"
                  />
                  {permission.permissions.map(
                    (permissionString, permissionIndex) =>
                      ` ${
                        permissionIndex === permission.permissions.length - 1 && permission.permissions.length > 1
                          ? 'and '
                          : ''
                      }${intl.formatMessage(STRING_PERMISSIONS[permissionString]).toLowerCase()}${
                        permissionIndex !== permission.permissions.length - 1 &&
                        permissionIndex !== permission.permissions.length - 2
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
                  <StyledLink
                    href={buildEtherscanAddress(permission.operator, position.chainId)}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ display: 'inline-block !important' }}
                  >
                    {isCompanionAddress(permission.operator, chainId).isCompanion ? (
                      `${
                        (isCompanionAddress(permission.operator, chainId).isOldCompanion && 'Old ') || ''
                      }Mean Finance Companion`
                    ) : (
                      <Address address={permission.operator} />
                    )}
                    <OpenInNewIcon style={{ fontSize: '1rem' }} />
                  </StyledLink>
                </>
              )}
            </Typography>
          ))}
        </Grid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position permissions modified" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildModifiedRateAndDurationItem = (positionState: DCAPositionModifiedAction, position: Position) => ({
  icon: <SettingsIcon />,
  content: () => {
    const rate = positionState.rate;
    const oldRate = positionState.oldRate;
    const intl = useIntl();
    return (
      <>
        <Grid item xs={12}>
          <StyledTimelineWrappedContent variant="body">
            <FormattedMessage
              description="positionModifiedRateFrom"
              defaultMessage="{increaseDecrease} rate from"
              values={{
                increaseDecrease: BigInt(oldRate) < BigInt(rate) ? 'Increased' : 'Decreased',
              }}
            />
            <CustomChip icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}>
              <Typography variant="body">{formatCurrencyAmount(BigInt(oldRate), position.from)}</Typography>
            </CustomChip>
            <FormattedMessage description="positionModifiedRateTo" defaultMessage="to" />
            <CustomChip icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}>
              <Typography variant="body">{formatCurrencyAmount(BigInt(rate), position.from)}</Typography>
            </CustomChip>
          </StyledTimelineWrappedContent>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body">
            <FormattedMessage
              description="positionModifiedSwaps"
              defaultMessage="{increaseDecrease} duration to run for {frequency} from {oldFrequency}"
              values={{
                increaseDecrease:
                  BigInt(positionState.oldRemainingSwaps) < BigInt(positionState.remainingSwaps)
                    ? 'Increased'
                    : 'Decreased',
                frequency: getFrequencyLabel(
                  intl,
                  position.swapInterval.toString(),
                  positionState.remainingSwaps.toString()
                ),
                oldFrequency: getFrequencyLabel(
                  intl,
                  position.swapInterval.toString(),
                  positionState.oldRemainingSwaps.toString()
                ),
              }}
            />
          </Typography>
        </Grid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeModified" defaultMessage="Position Modified" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildWithdrawnItem = (
  positionState: DCAPositionWithdrawnAction,
  position: Position,
  chainId: number,
  fromPrice?: bigint,
  toPrice?: bigint
) => ({
  icon: <OpenInNewIcon />,
  content: () => {
    const { withdrawn, generatedByYield, toPrice: oldToPrice } = positionState;
    const { to } = position;
    const yieldAmount = generatedByYield?.withdrawn;

    const currentToUsd = parseUsdPrice(to, withdrawn, toPrice);
    const toUsd = parseUsdPrice(to, withdrawn, parseNumberUsdPriceToBigInt(oldToPrice));
    const currentToYieldUsd = parseUsdPrice(to, yieldAmount, toPrice);
    const toYieldUsd = parseUsdPrice(to, yieldAmount, parseNumberUsdPriceToBigInt(oldToPrice));

    const showPrices = !!currentToUsd && !!toUsd;
    const [showCurrentPrice, setShouldShowCurrentPrice] = useState(true);
    const showYieldPrices = !!currentToYieldUsd && !!toYieldUsd;

    const [showCurrentYieldPrice, setShouldShowCurrentYieldPrice] = useState(true);

    return (
      <>
        <Grid item xs={12}>
          <StyledTimelineWrappedContent variant="body">
            <FormattedMessage description="positionWithdrawn" defaultMessage="Withdraw" />
            <CustomChip
              icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.to} />}
              pointer
              extraText={
                showPrices && (
                  <DarkTooltip
                    title={
                      showCurrentPrice
                        ? 'Displaying current value. Click to show value on day of withdrawal'
                        : 'Estimated value on day of withdrawal'
                    }
                    arrow
                    placement="top"
                    onClick={() => setShouldShowCurrentPrice(!showCurrentPrice)}
                  >
                    <div>(${showCurrentPrice ? currentToUsd.toFixed(2) : toUsd.toFixed(2)} USD)</div>
                  </DarkTooltip>
                )
              }
            >
              <Typography variant="body">{formatCurrencyAmount(BigInt(withdrawn), position.to)}</Typography>
            </CustomChip>
            {!!yieldAmount && (
              <>
                <FormattedMessage description="positionWithdrawn" defaultMessage="+ yield" />
                <CustomChip
                  icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.to} />}
                  pointer
                  extraText={
                    showYieldPrices && (
                      <DarkTooltip
                        title={
                          showCurrentYieldPrice
                            ? 'Displaying current value. Click to show value on day of withdrawal'
                            : 'Estimated value on day of withdrawal'
                        }
                        arrow
                        placement="top"
                        onClick={() => setShouldShowCurrentYieldPrice(!showCurrentYieldPrice)}
                      >
                        <div>(${showCurrentYieldPrice ? currentToYieldUsd.toFixed(2) : toYieldUsd.toFixed(2)} USD)</div>
                      </DarkTooltip>
                    )
                  }
                >
                  <Typography variant="body">{formatCurrencyAmount(yieldAmount, position.to)}</Typography>
                </CustomChip>
              </>
            )}
            <FormattedMessage description="positionWithdrawnSecond" defaultMessage=" from position" />
          </StyledTimelineWrappedContent>
        </Grid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Withdrew" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildTerminatedItem = (
  positionState: DCAPositionTerminatedAction,
  position: Position,
  chainId: number,
  fromPrice?: bigint,
  toPrice?: bigint
) => ({
  icon: <DeleteSweepIcon />,
  // content: () => <></>,
  content: () => {
    const { withdrawnSwapped, withdrawnRemaining, toPrice: oldToPrice, fromPrice: oldFromPrice } = positionState;

    const { to, from } = position;

    const currentToUsd = parseUsdPrice(to, withdrawnSwapped, toPrice);
    const toUsd = parseUsdPrice(to, withdrawnSwapped, parseNumberUsdPriceToBigInt(oldToPrice));
    const currentFromUsd = parseUsdPrice(from, withdrawnRemaining, fromPrice);
    const fromUsd = parseUsdPrice(from, withdrawnRemaining, parseNumberUsdPriceToBigInt(oldFromPrice));

    const showToPrices = !!toUsd;
    const [showToCurrentPrice, setShouldShowToCurrentPrice] = useState(true);

    const showFromPrices = !!fromUsd;
    const [showFromCurrentPrice, setShouldShowFromCurrentPrice] = useState(true);

    if (BigInt(withdrawnSwapped) <= 0n && BigInt(withdrawnRemaining) <= 0n) {
      return <></>;
    }

    return (
      <>
        <Grid item xs={12}>
          <StyledTimelineWrappedContent variant="body">
            <StyledTitleMainText variant="body">
              <FormattedMessage description="positionTerminated" defaultMessage="Withdrawn:" />
            </StyledTitleMainText>
            {BigInt(withdrawnSwapped) > 0n && (
              <CustomChip
                icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.to} />}
                pointer
                extraText={
                  showToPrices && (
                    <DarkTooltip
                      title={
                        showToCurrentPrice
                          ? 'Displaying current value. Click to show value on day of withdrawal'
                          : 'Estimated value on day of withdrawal'
                      }
                      arrow
                      placement="top"
                      onClick={() => setShouldShowToCurrentPrice(!showToCurrentPrice)}
                    >
                      <div>(${showToCurrentPrice ? currentToUsd.toFixed(2) : toUsd.toFixed(2)} USD)</div>
                    </DarkTooltip>
                  )
                }
              >
                <Typography variant="body">{formatCurrencyAmount(BigInt(withdrawnSwapped), position.to)}</Typography>
              </CustomChip>
            )}
            {BigInt(withdrawnRemaining) > 0n && BigInt(withdrawnSwapped) > 0n && (
              <FormattedMessage description="positionTerminatedAnd" defaultMessage=" and " />
            )}
            {BigInt(withdrawnRemaining) > 0n && (
              <CustomChip
                icon={<ComposedTokenIcon isInChip size={4.5} tokenBottom={position.from} />}
                pointer
                extraText={
                  showFromPrices && (
                    <DarkTooltip
                      title={
                        showFromCurrentPrice
                          ? 'Displaying current value. Click to show value on day of withdrawal'
                          : 'Estimated value on day of withdrawal'
                      }
                      arrow
                      placement="top"
                      onClick={() => setShouldShowFromCurrentPrice(!showFromCurrentPrice)}
                    >
                      <div>(${showFromCurrentPrice ? currentFromUsd.toFixed(2) : fromUsd.toFixed(2)} USD)</div>
                    </DarkTooltip>
                  )
                }
              >
                <Typography variant="body">
                  {formatCurrencyAmount(BigInt(withdrawnRemaining), position.from)}
                </Typography>
              </CustomChip>
            )}
          </StyledTimelineWrappedContent>
        </Grid>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Closed" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const MESSAGE_MAP = {
  [ActionTypeAction.CREATED]: buildCreatedItem,
  [ActionTypeAction.MODIFIED]: buildModifiedRateAndDurationItem,
  [ActionTypeAction.SWAPPED]: buildSwappedItem,
  [ActionTypeAction.WITHDRAWN]: buildWithdrawnItem,
  [ActionTypeAction.TERMINATED]: buildTerminatedItem,
  [ActionTypeAction.TRANSFERRED]: buildTransferedItem,
  [ActionTypeAction.MODIFIED_PERMISSIONS]: buildPermissionsModifiedItem,
};

const FILTERS = {
  0: [
    ActionTypeAction.CREATED,
    ActionTypeAction.MODIFIED,
    ActionTypeAction.MODIFIED_PERMISSIONS,
    ActionTypeAction.SWAPPED,
    ActionTypeAction.TERMINATED,
    ActionTypeAction.TRANSFERRED,
    ActionTypeAction.WITHDRAWN,
  ],
  1: [ActionTypeAction.SWAPPED],
  2: [
    ActionTypeAction.CREATED,
    ActionTypeAction.MODIFIED,
    ActionTypeAction.TRANSFERRED,
    ActionTypeAction.TERMINATED,
    ActionTypeAction.MODIFIED_PERMISSIONS,
  ],
  3: [ActionTypeAction.WITHDRAWN],
};

const PositionTimeline = ({ position, filter }: PositionTimelineProps) => {
  let history = [];

  const prices = usePositionPrices(position.id);
  const toPrice = prices?.toPrice;
  const fromPrice = prices?.fromPrice;

  const mappedPositionHistory = position.history
    .filter((positionState) => FILTERS[filter].includes(positionState.action))
    // @ts-expect-error ts will not get the type correctly based on the message map
    .map((positionState) =>
      MESSAGE_MAP[positionState.action](positionState, position, position.chainId, fromPrice, toPrice)
    );

  history = orderBy(mappedPositionHistory, ['time'], ['desc']);

  return (
    <StyledTimeline container>
      {history.map((historyItem) => (
        <StyledTimelineContainer item xs={12} key={historyItem.id}>
          <StyledTimelineIcon>{historyItem.icon}</StyledTimelineIcon>
          <StyledTimelineContent>
            <Grid container>
              <StyledTimelineContentTitle item xs={12}>
                <Typography variant="body" fontWeight={500}>
                  {historyItem.title}
                </Typography>
                <StyledTitleEnd>
                  <Tooltip
                    title={DateTime.fromSeconds(historyItem.time).toLocaleString(DateTime.DATETIME_FULL)}
                    arrow
                    placement="top"
                  >
                    <StyledTitleMainText variant="bodySmall">
                      {DateTime.fromSeconds(historyItem.time).toRelative()}
                    </StyledTitleMainText>
                  </Tooltip>
                  <Typography variant="bodySmall">
                    <StyledLink
                      href={buildEtherscanTransaction(historyItem.id, position.chainId)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <OpenInNewIcon fontSize="inherit" />
                    </StyledLink>
                  </Typography>
                </StyledTitleEnd>
              </StyledTimelineContentTitle>
              <Grid item xs={12}>
                <StyledTimelineContentText container>
                  <historyItem.content />
                </StyledTimelineContentText>
              </Grid>
            </Grid>
          </StyledTimelineContent>
        </StyledTimelineContainer>
      ))}
    </StyledTimeline>
  );
};
export default PositionTimeline;
