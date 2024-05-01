import React, { useState } from 'react';

import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import {
  Grid,
  Link,
  Typography,
  Tooltip,
  RepeatIcon,
  OpenInNewIcon,
  SettingsIcon,
  DeleteSweepIcon,
  CardGiftcardIcon,
  colors,
  ContainerBox,
  ChartSquareIcon,
  ArrowRightIcon,
  WalletMoneyIcon,
  Skeleton,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import {
  DCAPositionCreatedAction,
  DCAPositionModifiedAction,
  DCAPositionSwappedAction,
  DCAPositionTerminatedAction,
  DCAPositionTransferredAction,
  DCAPositionWithdrawnAction,
  Position,
  PositionWithHistory,
} from '@types';
import { DateTime } from 'luxon';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { buildEtherscanAddress, buildEtherscanTransaction } from '@common/utils/etherscan';
import Address from '@common/components/address';
import { ActionTypeAction } from '@mean-finance/sdk';
import { usePositionPrices } from '@state/position-details/hooks';
import { compact } from 'lodash';
import TokenIcon from '@common/components/token-icon';
import { SPACING } from 'ui-library/src/theme/constants';

const StyledLink = styled(Link)<{ $isFirst?: boolean }>`
  margin: ${({ $isFirst }) => ($isFirst ? '0px 5px 0px 0px' : '0px 5px')};
  display: flex;
`;

const StyledTimeline = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    position: relative;
    padding: 0px 0px 0px ${spacing(6)};
    &:before {
      content: '';
      position: absolute;
      left: ${spacing(6)};
      top: 5px;
      width: 4px;
      bottom: ${spacing(15)};
      border-left: 3px dashed ${colors[mode].border.border1};
    }
  `}
`;

const StyledTimelineContainer = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
  position: relative;
  margin-bottom: ${spacing(8)};
  `}
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
      spacing,
    },
  }) => `
    position: absolute;
    color: ${colors[mode].accent.accent600};
    left: -${spacing(7.5)};
    top: 0px;
    width: ${spacing(15)};
    height: ${spacing(15)};
    border-radius: 50%;
    text-align: center;
    border: 1px solid ${colors[mode].border.border1};
    background: ${colors[mode].background.secondary};

    i, .MuiSkeleton-root {
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
  ${({ theme: { spacing } }) => `
    padding: 0px 0px 0px ${spacing(13)};
  `}
  position: relative;
  text-align: start;
  overflow-wrap: anywhere;
  flex-grow: 1;
`;

const StyledTimelineContentTitle = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitleDate = styled(Typography).attrs(() => ({ variant: 'bodySmallLabel' }))``;

const ItemAmount = styled(Typography).attrs(() => ({ variant: 'bodyBold' }))``;
const ItemAmountText = styled(Typography).attrs(() => ({ variant: 'bodyRegular' }))``;
const ItemAmountTextUsd = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyRegular', color: colors[mode].typography.typo3 })
)``;
const ItemAmountUsd = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodyBold', color: colors[mode].typography.typo3 })
)``;
const ItemTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodySmallLabel', color: colors[mode].typography.typo2 })
)``;
const ItemSubTitle = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
  }) => ({ variant: 'bodySmallBold', color: colors[mode].typography.typo2 })
)``;

interface PositionTimelineProps {
  position?: PositionWithHistory;
  filter: 0 | 1 | 2 | 3; // 0 - all; 1 - swaps; 2 - modifications; 3 - withdraws
  isLoading: boolean;
}

const currentPriceMessage = defineMessage({
  defaultMessage: 'Displaying current value. Click to show value on day of the event',
});
const prevPriceMessage = defineMessage({ defaultMessage: 'Estimated value on day of the event' });

const buildSwappedItem = (positionState: DCAPositionSwappedAction, position: Position) => ({
  icon: <RepeatIcon size={SPACING(6)} color="inherit" />,
  content: () => {
    const intl = useIntl();
    const { swapped, rate: baseRate, generatedByYield, tokenA, tokenB } = positionState;
    const yieldFrom = generatedByYield?.rate;
    const rate = baseRate - (yieldFrom || 0n);
    const to =
      position.to.address === tokenA.address
        ? {
            ...tokenA,
            ...position.to,
            price: tokenA.price,
          }
        : {
            ...tokenB,
            ...position.to,
            price: tokenB.price,
          };
    const from =
      position.from.address === tokenA.address
        ? {
            ...tokenA,
            ...position.from,
            price: tokenA.price,
          }
        : {
            ...tokenB,
            ...position.from,
            price: tokenB.price,
          };

    const { price: oldToPrice } = to;
    const { price: oldFromPrice } = from;
    const [showToCurrentPrice, setShouldShowToCurrentPrice] = useState(true);
    const [showFromCurrentPrice, setShouldShowFromCurrentPrice] = useState(true);
    const [showFromYieldCurrentPrice, setShouldShowFromYieldCurrentPrice] = useState(true);

    const fromUsd = parseUsdPrice(
      from,
      rate,
      parseNumberUsdPriceToBigInt(showFromCurrentPrice ? position.from.price : oldFromPrice)
    );
    const toUsd = parseUsdPrice(
      to,
      swapped,
      parseNumberUsdPriceToBigInt(showToCurrentPrice ? position.to.price : oldToPrice)
    );
    const fromYieldUsd = parseUsdPrice(
      from,
      yieldFrom,
      parseNumberUsdPriceToBigInt(showFromYieldCurrentPrice ? position.from.price : oldFromPrice)
    );

    return (
      <>
        <ContainerBox flexDirection="column">
          <ItemTitle>
            <FormattedMessage description="positionSwapSwapped" defaultMessage="Swapped" />
          </ItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.from} size={5} />
            <ContainerBox flexDirection="column">
              <ContainerBox gap={1} alignItems="center">
                <ItemAmount>{formatCurrencyAmount({ amount: rate, token: position.from, intl })}</ItemAmount>
                {!!fromUsd && (
                  <Tooltip
                    title={intl.formatMessage(showFromCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                    arrow
                    placement="top"
                  >
                    <ItemAmountUsd onClick={() => setShouldShowFromCurrentPrice(!showFromCurrentPrice)}>
                      (${fromUsd})
                    </ItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
              {!!yieldFrom && (
                <ContainerBox gap={1} alignItems="center">
                  <ItemAmountText>
                    <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                    {` `}
                    {formatCurrencyAmount({ amount: yieldFrom, token: position.from, intl })}
                  </ItemAmountText>
                  {!!fromYieldUsd && (
                    <Tooltip
                      title={intl.formatMessage(showFromYieldCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                      arrow
                      placement="top"
                    >
                      <ItemAmountTextUsd onClick={() => setShouldShowFromYieldCurrentPrice(!showFromYieldCurrentPrice)}>
                        (${fromYieldUsd})
                      </ItemAmountTextUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
              )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <ItemTitle>
            <FormattedMessage description="positionSwapReceived" defaultMessage="Received" />
          </ItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.to} size={5} />
            <ContainerBox>
              <ContainerBox gap={1} alignItems="center">
                <ItemAmount>{formatCurrencyAmount({ amount: swapped, token: position.to, intl })}</ItemAmount>
                {!!toUsd && (
                  <Tooltip
                    title={intl.formatMessage(showToCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                    arrow
                    placement="top"
                  >
                    <ItemAmountUsd onClick={() => setShouldShowToCurrentPrice(!showToCurrentPrice)}>
                      (${toUsd})
                    </ItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeSwap" defaultMessage="Swap Executed" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildCreatedItem = (positionState: DCAPositionCreatedAction, position: Position) => ({
  icon: <ChartSquareIcon size={SPACING(6)} color="inherit" />,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);

    const { fromPrice } = positionState;
    const currentFromPrice = position.from.price;

    return (
      <>
        <ContainerBox flexDirection="column">
          <ItemTitle>
            <FormattedMessage description="positionCreatedRate" defaultMessage="Rate" />
          </ItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.from} size={5} />
            <ContainerBox gap={1} alignItems="center">
              <ItemAmount>
                {formatCurrencyAmount({ amount: positionState.rate, token: position.from, intl })}
              </ItemAmount>
              {fromPrice && (
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="bodyRegular"
                    color={({ palette: { mode } }) => colors[mode].typography.typo3}
                    onClick={() => setShowCurrentPrice(!showCurrentPrice)}
                  >
                    ($
                    {parseUsdPrice(
                      position.from,
                      positionState.rate,
                      parseNumberUsdPriceToBigInt(showCurrentPrice ? currentFromPrice : fromPrice)
                    )}
                    )
                  </Typography>
                </Tooltip>
              )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <ItemTitle>
            <FormattedMessage description="positionCreatedDuration" defaultMessage="Duration" />
          </ItemTitle>
          <ContainerBox>
            <ItemAmount>
              {getTimeFrequencyLabel(intl, position.swapInterval.toString(), positionState.swaps.toString())}
            </ItemAmount>
          </ContainerBox>
        </ContainerBox>
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
      <ContainerBox flexDirection="column">
        <ItemTitle>
          <FormattedMessage description="transferedFrom" defaultMessage="Transfered from" />
        </ItemTitle>
        <ContainerBox>
          <ItemAmount>
            <StyledLink
              href={buildEtherscanAddress(positionState.from, position.chainId)}
              target="_blank"
              rel="noreferrer"
            >
              <Address address={positionState.from} trimAddress />
              <OpenInNewIcon style={{ fontSize: '1rem' }} />
            </StyledLink>
          </ItemAmount>
        </ContainerBox>
      </ContainerBox>
      <ContainerBox flexDirection="column">
        <ItemTitle>
          <FormattedMessage description="transferedTo" defaultMessage="Transfered to:" />
        </ItemTitle>
        <ContainerBox>
          <ItemAmount>
            <StyledLink
              href={buildEtherscanAddress(positionState.to, position.chainId)}
              target="_blank"
              rel="noreferrer"
            >
              <Address address={positionState.to} trimAddress />
              <OpenInNewIcon style={{ fontSize: '1rem' }} />
            </StyledLink>
          </ItemAmount>
        </ContainerBox>
      </ContainerBox>
    </>
  ),
  title: <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position Transfered" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const StyledCurrentValueBold = styled(Typography).attrs({ variant: 'bodyBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4}
    `}
`;
const StyledCurrentValueRegular = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo4}
    `}
`;

const StyledArrowIcon = styled(ArrowRightIcon)`
  transform: rotate(90deg);
  font-size: ${({ theme }) => theme.spacing(4)};
`;

const buildModifiedRateAndDurationItem = (positionState: DCAPositionModifiedAction, position: Position) => ({
  icon: <SettingsIcon />,
  content: () => {
    const { from, swapInterval, yields } = position;
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);
    const fromPrice = from.price;
    const oldFromPrice = positionState.fromPrice;
    const rate = positionState.rate;
    const oldRate = positionState.oldRate;
    const remainingSwaps = positionState.remainingSwaps;
    const oldRemainingSwaps = positionState.oldRemainingSwaps;
    const remainingLiquidity = rate * BigInt(remainingSwaps);
    const oldRemainingLiquidity = oldRate * BigInt(oldRemainingSwaps);

    const oldRateUsd = parseUsdPrice(
      from,
      oldRate,
      parseNumberUsdPriceToBigInt(showCurrentPrice ? fromPrice : oldFromPrice)
    );
    const rateUsd = parseUsdPrice(from, rate, parseNumberUsdPriceToBigInt(showCurrentPrice ? fromPrice : oldFromPrice));
    const oldRemainingLiquidityUsd = parseUsdPrice(
      from,
      oldRemainingLiquidity,
      parseNumberUsdPriceToBigInt(showCurrentPrice ? fromPrice : oldFromPrice)
    );
    const remainingLiquidityUsd = parseUsdPrice(
      from,
      remainingLiquidity,
      parseNumberUsdPriceToBigInt(showCurrentPrice ? fromPrice : oldFromPrice)
    );

    const hasYield = !!yields.from;

    const intl = useIntl();
    return (
      <>
        <ContainerBox justifyContent="space-between" gap={2}>
          <ContainerBox flexDirection="column" alignItems="start">
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="totalInvested" defaultMessage="Total invested" />
            </Typography>
            <ContainerBox gap={0.5} alignItems="center">
              <StyledCurrentValueBold>
                {formatCurrencyAmount({ amount: oldRemainingLiquidity, token: from, sigFigs: 2, intl })} {from.symbol}
              </StyledCurrentValueBold>
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                arrow
                placement="top"
              >
                <StyledCurrentValueRegular onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  (${usdFormatter(oldRemainingLiquidityUsd, 2)})
                </StyledCurrentValueRegular>
              </Tooltip>
            </ContainerBox>
            <StyledArrowIcon />
            {oldRemainingLiquidity === remainingLiquidity ? (
              <StyledCurrentValueBold>=</StyledCurrentValueBold>
            ) : (
              <ContainerBox gap={0.5} alignItems="center">
                <ItemAmount>
                  {formatCurrencyAmount({ amount: remainingLiquidity, token: from, sigFigs: 2, intl })} {from.symbol}
                </ItemAmount>
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                  arrow
                  placement="top"
                >
                  <Typography variant="bodyRegular" onClick={() => setShowCurrentPrice((prev) => !prev)}>
                    (${usdFormatter(remainingLiquidityUsd, 2)})
                  </Typography>
                </Tooltip>
              </ContainerBox>
            )}
          </ContainerBox>
          <ContainerBox flexDirection="column" alignItems="start">
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="duration" defaultMessage="Duration" />
            </Typography>
            <StyledCurrentValueBold>
              {getTimeFrequencyLabel(intl, swapInterval.toString(), oldRemainingSwaps.toString())}
            </StyledCurrentValueBold>
            <StyledArrowIcon />
            {remainingSwaps === oldRemainingSwaps ? (
              <StyledCurrentValueBold>=</StyledCurrentValueBold>
            ) : (
              <ItemAmount>{getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString())}</ItemAmount>
            )}
          </ContainerBox>
          <ContainerBox flexDirection="column" alignItems="start">
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="rate" defaultMessage="Rate" />
            </Typography>
            <ContainerBox gap={0.5} alignItems="center">
              <StyledCurrentValueBold>
                {formatCurrencyAmount({ amount: oldRate, token: from, sigFigs: 2, intl })} {from.symbol}
              </StyledCurrentValueBold>
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                arrow
                placement="top"
              >
                <StyledCurrentValueRegular onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  (${usdFormatter(oldRateUsd, 2)})
                </StyledCurrentValueRegular>
              </Tooltip>
              {hasYield && (
                <StyledCurrentValueRegular>
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </StyledCurrentValueRegular>
              )}
            </ContainerBox>
            <StyledArrowIcon />
            {oldRate === rate ? (
              <StyledCurrentValueBold>=</StyledCurrentValueBold>
            ) : (
              <ContainerBox gap={0.5} alignItems="center">
                <ItemAmount>
                  {formatCurrencyAmount({ amount: rate, token: from, sigFigs: 2, intl })} {from.symbol}
                </ItemAmount>
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                  arrow
                  placement="top"
                >
                  <Typography variant="bodyRegular" onClick={() => setShowCurrentPrice((prev) => !prev)}>
                    (${usdFormatter(rateUsd, 2)})
                  </Typography>
                </Tooltip>
                {hasYield && (
                  <ItemAmountText>
                    <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                  </ItemAmountText>
                )}
              </ContainerBox>
            )}
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeModified" defaultMessage="Position Modified" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildWithdrawnItem = (positionState: DCAPositionWithdrawnAction, position: Position) => ({
  icon: <WalletMoneyIcon size={SPACING(6)} color="inherit" />,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);
    const { withdrawn: baseWithdrawn, generatedByYield, toPrice: oldToPrice } = positionState;
    const { to } = position;
    const toPrice = to.price;

    const yieldAmount = generatedByYield?.withdrawn;
    const withdrawn = baseWithdrawn - (yieldAmount || 0n);

    const toUsd = parseUsdPrice(to, withdrawn, parseNumberUsdPriceToBigInt(showCurrentPrice ? toPrice : oldToPrice));
    const toYieldUsd = parseUsdPrice(
      to,
      yieldAmount,
      parseNumberUsdPriceToBigInt(showCurrentPrice ? toPrice : oldToPrice)
    );

    return (
      <>
        <ContainerBox flexDirection="column">
          <ItemTitle>
            <FormattedMessage description="positionWithdrawWithdrawn" defaultMessage="Withdrawn" />
          </ItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={to} size={5} />
            <ContainerBox flexDirection="column">
              <ContainerBox gap={1} alignItems="center">
                <ItemAmount>{formatCurrencyAmount({ amount: withdrawn, token: to, intl })}</ItemAmount>
                {!!toUsd && (
                  <Tooltip
                    title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                    arrow
                    placement="top"
                  >
                    <ItemAmountUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>(${toUsd})</ItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
              {!!yieldAmount && (
                <ContainerBox gap={1} alignItems="center">
                  <ItemAmountText>
                    <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                    {` `}
                    {formatCurrencyAmount({ amount: yieldAmount, token: to, intl })}
                  </ItemAmountText>
                  {!!toYieldUsd && (
                    <Tooltip
                      title={intl.formatMessage(showCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                      arrow
                      placement="top"
                    >
                      <ItemAmountTextUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                        (${toYieldUsd})
                      </ItemAmountTextUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
              )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  title: <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Withdrew" />,
  time: positionState.tx.timestamp,
  id: positionState.tx.hash,
});

const buildTerminatedItem = (positionState: DCAPositionTerminatedAction, position: Position) => ({
  icon: <DeleteSweepIcon />,
  // content: () => <></>,
  content: () => {
    const {
      withdrawnSwapped: baseWithdrawnSwapped,
      withdrawnRemaining: baseWithdrawnRemaining,
      generatedByYield,
      toPrice: oldToPrice,
      fromPrice: oldFromPrice,
    } = positionState;
    const intl = useIntl();
    const [showToCurrentPrice, setShowToCurrentPrice] = useState(true);
    const [showFromCurrentPrice, setShowFromCurrentPrice] = useState(true);
    const { to, from } = position;
    const toPrice = to.price;
    const fromPrice = from.price;

    const yieldToAmount = generatedByYield?.withdrawnSwapped;
    const withdrawnSwapped = baseWithdrawnSwapped - (yieldToAmount || 0n);
    const yieldFromAmount = generatedByYield?.withdrawnRemaining;
    const withdrawnRemaining = baseWithdrawnRemaining - (yieldFromAmount || 0n);

    const toUsd = parseUsdPrice(
      to,
      withdrawnSwapped,
      parseNumberUsdPriceToBigInt(showToCurrentPrice ? toPrice : oldToPrice)
    );
    const toYieldUsd = parseUsdPrice(
      to,
      yieldToAmount,
      parseNumberUsdPriceToBigInt(showToCurrentPrice ? toPrice : oldToPrice)
    );
    const fromUsd = parseUsdPrice(
      from,
      withdrawnRemaining,
      parseNumberUsdPriceToBigInt(showFromCurrentPrice ? fromPrice : oldFromPrice)
    );
    const fromYieldUsd = parseUsdPrice(
      from,
      yieldFromAmount,
      parseNumberUsdPriceToBigInt(showFromCurrentPrice ? fromPrice : oldFromPrice)
    );

    if (BigInt(withdrawnSwapped) <= 0n && BigInt(withdrawnRemaining) <= 0n) {
      return <></>;
    }

    return (
      <>
        {withdrawnSwapped > 0n && (
          <ContainerBox flexDirection="column">
            <ItemTitle>
              <FormattedMessage description="positionCloseWithdrawnSwapped" defaultMessage="Withdrawn Swapped" />
            </ItemTitle>
            <ContainerBox alignItems="center" gap={2}>
              <TokenIcon token={to} size={5} />
              <ContainerBox flexDirection="column">
                <ContainerBox gap={1} alignItems="center">
                  <ItemAmount>{formatCurrencyAmount({ amount: withdrawnSwapped, token: to, intl })}</ItemAmount>
                  {!!toUsd && (
                    <Tooltip
                      title={intl.formatMessage(showToCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                      arrow
                      placement="top"
                    >
                      <ItemAmountUsd onClick={() => setShowToCurrentPrice((prev) => !prev)}>(${toUsd})</ItemAmountUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
                {!!yieldToAmount && (
                  <ContainerBox gap={1} alignItems="center">
                    <ItemAmountText>
                      <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                      {` `}
                      {formatCurrencyAmount({ amount: yieldToAmount, token: to, intl })}
                    </ItemAmountText>
                    {!!toYieldUsd && (
                      <Tooltip
                        title={intl.formatMessage(showToCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                        arrow
                        placement="top"
                      >
                        <ItemAmountTextUsd onClick={() => setShowToCurrentPrice((prev) => !prev)}>
                          (${toYieldUsd})
                        </ItemAmountTextUsd>
                      </Tooltip>
                    )}
                  </ContainerBox>
                )}
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        )}
        {withdrawnRemaining > 0n && (
          <ContainerBox flexDirection="column">
            <ItemTitle>
              <FormattedMessage description="positionCloseWithdrawnFunds" defaultMessage="Withdrawn Funds" />
            </ItemTitle>
            <ContainerBox alignItems="center" gap={2}>
              <TokenIcon token={from} size={5} />
              <ContainerBox flexDirection="column">
                <ContainerBox gap={1} alignItems="center">
                  <ItemAmount>{formatCurrencyAmount({ amount: withdrawnRemaining, token: from, intl })}</ItemAmount>
                  {!!fromUsd && (
                    <Tooltip
                      title={intl.formatMessage(showFromCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                      arrow
                      placement="top"
                    >
                      <ItemAmountUsd onClick={() => setShowFromCurrentPrice((prev) => !prev)}>
                        (${fromUsd})
                      </ItemAmountUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
                {!!yieldFromAmount && (
                  <ContainerBox gap={1} alignItems="center">
                    <ItemAmountText>
                      <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                      {` `}
                      {formatCurrencyAmount({ amount: yieldFromAmount, token: from, intl })}
                    </ItemAmountText>
                    {!!fromYieldUsd && (
                      <Tooltip
                        title={intl.formatMessage(showFromCurrentPrice ? currentPriceMessage : prevPriceMessage)}
                        arrow
                        placement="top"
                      >
                        <ItemAmountTextUsd onClick={() => setShowFromCurrentPrice((prev) => !prev)}>
                          (${fromYieldUsd})
                        </ItemAmountTextUsd>
                      </Tooltip>
                    )}
                  </ContainerBox>
                )}
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        )}
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
  [ActionTypeAction.MODIFIED_PERMISSIONS]: () => null,
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

const skeletonRows = Array.from(Array(8).keys());

const TimelineItemSkeleton = ({ key }: { key: number }) => (
  <StyledTimelineContainer key={key}>
    <StyledTimelineIcon>
      <Skeleton variant="circular" width={SPACING(6)} height={SPACING(6)} />
    </StyledTimelineIcon>
    <StyledTimelineContent>
      <Grid container>
        <StyledTimelineContentTitle item xs={12}>
          <ItemAmount>
            <Skeleton variant="text" width="10ch" />
          </ItemAmount>
          <StyledTitleEnd>
            <StyledTitleDate>
              <Skeleton variant="text" width="5ch" />
            </StyledTitleDate>
          </StyledTitleEnd>
        </StyledTimelineContentTitle>
        <Grid item xs={12}>
          <ContainerBox gap={6}>
            <ContainerBox flexDirection="column">
              <ItemTitle>
                <Skeleton variant="text" width="10ch" />
              </ItemTitle>
              <ContainerBox alignItems="center" gap={2}>
                <Skeleton variant="circular" width={SPACING(5)} />
                <ContainerBox gap={1}>
                  <ItemAmount>
                    <Skeleton variant="text" width="5ch" />
                  </ItemAmount>
                </ContainerBox>
              </ContainerBox>
            </ContainerBox>
            <ContainerBox flexDirection="column">
              <ItemTitle>
                <Skeleton variant="text" width="10ch" />
              </ItemTitle>
              <ContainerBox>
                <ItemAmount>
                  <Skeleton variant="text" width="5ch" />
                </ItemAmount>
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        </Grid>
      </Grid>
    </StyledTimelineContent>
  </StyledTimelineContainer>
);

const PositionTimeline = ({ position, filter, isLoading }: PositionTimelineProps) => {
  let history = [];

  const prices = usePositionPrices(position?.id);
  const toPrice = prices?.toPrice;
  const fromPrice = prices?.fromPrice;

  const mappedPositionHistory = compact(
    position?.history
      .filter((positionState) => FILTERS[filter].includes(positionState.action))
      .map((positionState) =>
        // @ts-expect-error ts will not get the type correctly based on the message map
        MESSAGE_MAP[positionState.action](positionState, position, position.chainId, fromPrice, toPrice)
      )
  );

  history = orderBy(mappedPositionHistory, ['time'], ['desc']);

  if (isLoading || !position) {
    return (
      <StyledTimeline flexDirection="column">
        {skeletonRows.map((key) => (
          <TimelineItemSkeleton key={key} />
        ))}
      </StyledTimeline>
    );
  }

  return (
    <StyledTimeline flexDirection="column">
      {history.map((historyItem) => (
        <StyledTimelineContainer key={historyItem.id}>
          <StyledTimelineIcon>{historyItem.icon}</StyledTimelineIcon>
          <StyledTimelineContent>
            <Grid container>
              <StyledTimelineContentTitle item xs={12}>
                <ItemSubTitle>{historyItem.title}</ItemSubTitle>
                <StyledTitleEnd>
                  <Tooltip
                    title={DateTime.fromSeconds(historyItem.time).toLocaleString(DateTime.DATETIME_MED)}
                    arrow
                    placement="top"
                  >
                    <StyledTitleDate>{DateTime.fromSeconds(historyItem.time).toRelative()}</StyledTitleDate>
                  </Tooltip>
                  <Typography variant="bodyRegular">
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
                <ContainerBox gap={6} flexWrap="wrap">
                  <historyItem.content />
                </ContainerBox>
              </Grid>
            </Grid>
          </StyledTimelineContent>
        </StyledTimelineContainer>
      ))}
    </StyledTimeline>
  );
};
export default PositionTimeline;
