import React, { useState } from 'react';
import {
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
  WalletMoneyIcon,
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
} from '@types';
import { formatCurrencyAmount, parseNumberUsdPriceToBigInt, parseUsdPrice } from '@common/utils/currency';
import { getTimeFrequencyLabel, usdFormatter } from '@common/utils/parsing';
import { buildEtherscanAddress, buildEtherscanTransaction } from '@common/utils/etherscan';
import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import {
  StyledTimelineArrowIcon,
  StyledTimelineCurrentValueBold,
  StyledTimelineCurrentValueRegular,
  StyledTimelineLink,
  timelineCurrentPriceMessage,
  TimelineItemAmount,
  TimelineItemAmountText,
  TimelineItemAmountTextUsd,
  TimelineItemAmountUsd,
  TimelineItemSubTitle,
  TimelineItemTitle,
  timelinePrevPriceMessage,
} from '@common/components/timeline-controls/common';
import { DCAPositionAction } from '@balmy/sdk';
import { DateTime } from 'luxon';
import { StyledTimelineTitleDate, StyledTimelineTitleEnd } from '../timeline';

const buildDcaTimelineHeader = (title: React.ReactElement, action: DCAPositionAction, chainId: number) => (
  <>
    <TimelineItemSubTitle>{title}</TimelineItemSubTitle>
    <ContainerBox flexDirection="column" gap={1}>
      <StyledTimelineTitleEnd>
        <Tooltip title={DateTime.fromSeconds(action.tx.timestamp).toLocaleString(DateTime.DATETIME_MED)}>
          <StyledTimelineTitleDate>{DateTime.fromSeconds(action.tx.timestamp).toRelative()}</StyledTimelineTitleDate>
        </Tooltip>
        <Typography variant="bodyRegular">
          <StyledTimelineLink
            href={buildEtherscanTransaction(action.tx.hash, chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <OpenInNewIcon fontSize="inherit" />
          </StyledTimelineLink>
        </Typography>
      </StyledTimelineTitleEnd>
    </ContainerBox>
  </>
);

export const buildDcaSwappedItem = (positionState: DCAPositionSwappedAction, position: Position) => ({
  icon: RepeatIcon,
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
          <TimelineItemTitle>
            <FormattedMessage description="positionSwapSwapped" defaultMessage="Swapped" />
          </TimelineItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.from} size={5} />
            <ContainerBox flexDirection="column">
              <ContainerBox gap={1} alignItems="center">
                <TimelineItemAmount>
                  {formatCurrencyAmount({ amount: rate, token: position.from, intl })}
                </TimelineItemAmount>
                {!!fromUsd && (
                  <Tooltip
                    title={intl.formatMessage(
                      showFromCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                    )}
                  >
                    <TimelineItemAmountUsd onClick={() => setShouldShowFromCurrentPrice(!showFromCurrentPrice)}>
                      (${fromUsd})
                    </TimelineItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
              {!!yieldFrom && (
                <ContainerBox gap={1} alignItems="center">
                  <TimelineItemAmountText>
                    <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                    {` `}
                    {formatCurrencyAmount({ amount: yieldFrom, token: position.from, intl })}
                  </TimelineItemAmountText>
                  {!!fromYieldUsd && (
                    <Tooltip
                      title={intl.formatMessage(
                        showFromYieldCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                      )}
                    >
                      <TimelineItemAmountTextUsd
                        onClick={() => setShouldShowFromYieldCurrentPrice(!showFromYieldCurrentPrice)}
                      >
                        (${fromYieldUsd})
                      </TimelineItemAmountTextUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
              )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <TimelineItemTitle>
            <FormattedMessage description="positionSwapReceived" defaultMessage="Received" />
          </TimelineItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.to} size={5} />
            <ContainerBox>
              <ContainerBox gap={1} alignItems="center">
                <TimelineItemAmount>
                  {formatCurrencyAmount({ amount: swapped, token: position.to, intl })}
                </TimelineItemAmount>
                {!!toUsd && (
                  <Tooltip
                    title={intl.formatMessage(
                      showToCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                    )}
                  >
                    <TimelineItemAmountUsd onClick={() => setShouldShowToCurrentPrice(!showToCurrentPrice)}>
                      (${toUsd})
                    </TimelineItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeSwap" defaultMessage="Swap Executed" />,
      positionState,
      position.chainId
    ),
});

export const buildDcaCreatedItem = (positionState: DCAPositionCreatedAction, position: Position) => ({
  icon: ChartSquareIcon,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);

    const { fromPrice } = positionState;
    const currentFromPrice = position.from.price;

    return (
      <>
        <ContainerBox flexDirection="column">
          <TimelineItemTitle>
            <FormattedMessage description="positionCreatedRate" defaultMessage="Rate" />
          </TimelineItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={position.from} size={5} />
            <ContainerBox gap={1} alignItems="center">
              <TimelineItemAmount>
                {formatCurrencyAmount({ amount: positionState.rate, token: position.from, intl })}
              </TimelineItemAmount>
              {fromPrice && (
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
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
          <TimelineItemTitle>
            <FormattedMessage description="positionCreatedDuration" defaultMessage="Duration" />
          </TimelineItemTitle>
          <ContainerBox>
            <TimelineItemAmount>
              {getTimeFrequencyLabel(intl, position.swapInterval.toString(), positionState.swaps.toString())}
            </TimelineItemAmount>
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeCreated" defaultMessage="Position Created" />,
      positionState,
      position.chainId
    ),
});

export const buildDcaTransferedItem = (positionState: DCAPositionTransferredAction, position: Position) => ({
  icon: CardGiftcardIcon,
  content: () => (
    <>
      <ContainerBox flexDirection="column">
        <TimelineItemTitle>
          <FormattedMessage description="transferedFrom" defaultMessage="Transfered from" />
        </TimelineItemTitle>
        <ContainerBox>
          <TimelineItemAmount>
            <StyledTimelineLink
              href={buildEtherscanAddress(positionState.from, position.chainId)}
              target="_blank"
              rel="noreferrer"
            >
              <Address address={positionState.from} trimAddress />
              <OpenInNewIcon style={{ fontSize: '1rem' }} />
            </StyledTimelineLink>
          </TimelineItemAmount>
        </ContainerBox>
      </ContainerBox>
      <ContainerBox flexDirection="column">
        <TimelineItemTitle>
          <FormattedMessage description="transferedTo" defaultMessage="Transfered to:" />
        </TimelineItemTitle>
        <ContainerBox>
          <TimelineItemAmount>
            <StyledTimelineLink
              href={buildEtherscanAddress(positionState.to, position.chainId)}
              target="_blank"
              rel="noreferrer"
            >
              <Address address={positionState.to} trimAddress />
              <OpenInNewIcon style={{ fontSize: '1rem' }} />
            </StyledTimelineLink>
          </TimelineItemAmount>
        </ContainerBox>
      </ContainerBox>
    </>
  ),
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeTransfered" defaultMessage="Position Transfered" />,
      positionState,
      position.chainId
    ),
});

export const buildDcaModifiedPermissionsItem = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionState: DCAPositionPermissionsModifiedAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: Position
) => ({
  icon: () => <></>,
  content: () => <></>,
  header: () => <></>,
});

export const buildDcaModifiedRateAndDurationItem = (positionState: DCAPositionModifiedAction, position: Position) => ({
  icon: SettingsIcon,
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
              <StyledTimelineCurrentValueBold>
                {formatCurrencyAmount({ amount: oldRemainingLiquidity, token: from, sigFigs: 2, intl })} {from.symbol}
              </StyledTimelineCurrentValueBold>
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
              >
                <StyledTimelineCurrentValueRegular onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  (${usdFormatter(oldRemainingLiquidityUsd, 2)})
                </StyledTimelineCurrentValueRegular>
              </Tooltip>
            </ContainerBox>
            <StyledTimelineArrowIcon />
            {oldRemainingLiquidity === remainingLiquidity ? (
              <StyledTimelineCurrentValueBold>=</StyledTimelineCurrentValueBold>
            ) : (
              <ContainerBox gap={0.5} alignItems="center">
                <TimelineItemAmount>
                  {formatCurrencyAmount({ amount: remainingLiquidity, token: from, sigFigs: 2, intl })} {from.symbol}
                </TimelineItemAmount>
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
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
            <StyledTimelineCurrentValueBold>
              {getTimeFrequencyLabel(intl, swapInterval.toString(), oldRemainingSwaps.toString())}
            </StyledTimelineCurrentValueBold>
            <StyledTimelineArrowIcon />
            {remainingSwaps === oldRemainingSwaps ? (
              <StyledTimelineCurrentValueBold>=</StyledTimelineCurrentValueBold>
            ) : (
              <TimelineItemAmount>
                {getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString())}
              </TimelineItemAmount>
            )}
          </ContainerBox>
          <ContainerBox flexDirection="column" alignItems="start">
            <Typography variant="bodySmallRegular">
              <FormattedMessage description="rate" defaultMessage="Rate" />
            </Typography>
            <ContainerBox gap={0.5} alignItems="center">
              <StyledTimelineCurrentValueBold>
                {formatCurrencyAmount({ amount: oldRate, token: from, sigFigs: 2, intl })} {from.symbol}
              </StyledTimelineCurrentValueBold>
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
              >
                <StyledTimelineCurrentValueRegular onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  (${usdFormatter(oldRateUsd, 2)})
                </StyledTimelineCurrentValueRegular>
              </Tooltip>
              {hasYield && (
                <StyledTimelineCurrentValueRegular>
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </StyledTimelineCurrentValueRegular>
              )}
            </ContainerBox>
            <StyledTimelineArrowIcon />
            {oldRate === rate ? (
              <StyledTimelineCurrentValueBold>=</StyledTimelineCurrentValueBold>
            ) : (
              <ContainerBox gap={0.5} alignItems="center">
                <TimelineItemAmount>
                  {formatCurrencyAmount({ amount: rate, token: from, sigFigs: 2, intl })} {from.symbol}
                </TimelineItemAmount>
                <Tooltip
                  title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
                >
                  <Typography variant="bodyRegular" onClick={() => setShowCurrentPrice((prev) => !prev)}>
                    (${usdFormatter(rateUsd, 2)})
                  </Typography>
                </Tooltip>
                {hasYield && (
                  <TimelineItemAmountText>
                    <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                  </TimelineItemAmountText>
                )}
              </ContainerBox>
            )}
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeModified" defaultMessage="Position Modified" />,
      positionState,
      position.chainId
    ),
});

export const buildDcaWithdrawnItem = (positionState: DCAPositionWithdrawnAction, position: Position) => ({
  icon: WalletMoneyIcon,
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
          <TimelineItemTitle>
            <FormattedMessage description="positionWithdrawWithdrawn" defaultMessage="Withdrawn" />
          </TimelineItemTitle>
          <ContainerBox alignItems="center" gap={2}>
            <TokenIcon token={to} size={5} />
            <ContainerBox flexDirection="column">
              <ContainerBox gap={1} alignItems="center">
                <TimelineItemAmount>{formatCurrencyAmount({ amount: withdrawn, token: to, intl })}</TimelineItemAmount>
                {!!toUsd && (
                  <Tooltip
                    title={intl.formatMessage(
                      showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                    )}
                  >
                    <TimelineItemAmountUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                      (${toUsd})
                    </TimelineItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
              {!!yieldAmount && (
                <ContainerBox gap={1} alignItems="center">
                  <TimelineItemAmountText>
                    <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                    {` `}
                    {formatCurrencyAmount({ amount: yieldAmount, token: to, intl })}
                  </TimelineItemAmountText>
                  {!!toYieldUsd && (
                    <Tooltip
                      title={intl.formatMessage(
                        showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                      )}
                    >
                      <TimelineItemAmountTextUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                        (${toYieldUsd})
                      </TimelineItemAmountTextUsd>
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
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Withdrew" />,
      positionState,
      position.chainId
    ),
});

export const buildDcaTerminatedItem = (positionState: DCAPositionTerminatedAction, position: Position) => ({
  icon: DeleteSweepIcon,
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
            <TimelineItemTitle>
              <FormattedMessage description="positionCloseWithdrawnSwapped" defaultMessage="Withdrawn Swapped" />
            </TimelineItemTitle>
            <ContainerBox alignItems="center" gap={2}>
              <TokenIcon token={to} size={5} />
              <ContainerBox flexDirection="column">
                <ContainerBox gap={1} alignItems="center">
                  <TimelineItemAmount>
                    {formatCurrencyAmount({ amount: withdrawnSwapped, token: to, intl })}
                  </TimelineItemAmount>
                  {!!toUsd && (
                    <Tooltip
                      title={intl.formatMessage(
                        showToCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                      )}
                    >
                      <TimelineItemAmountUsd onClick={() => setShowToCurrentPrice((prev) => !prev)}>
                        (${toUsd})
                      </TimelineItemAmountUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
                {!!yieldToAmount && (
                  <ContainerBox gap={1} alignItems="center">
                    <TimelineItemAmountText>
                      <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                      {` `}
                      {formatCurrencyAmount({ amount: yieldToAmount, token: to, intl })}
                    </TimelineItemAmountText>
                    {!!toYieldUsd && (
                      <Tooltip
                        title={intl.formatMessage(
                          showToCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                        )}
                      >
                        <TimelineItemAmountTextUsd onClick={() => setShowToCurrentPrice((prev) => !prev)}>
                          (${toYieldUsd})
                        </TimelineItemAmountTextUsd>
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
            <TimelineItemTitle>
              <FormattedMessage description="positionCloseWithdrawnFunds" defaultMessage="Withdrawn Funds" />
            </TimelineItemTitle>
            <ContainerBox alignItems="center" gap={2}>
              <TokenIcon token={from} size={5} />
              <ContainerBox flexDirection="column">
                <ContainerBox gap={1} alignItems="center">
                  <TimelineItemAmount>
                    {formatCurrencyAmount({ amount: withdrawnRemaining, token: from, intl })}
                  </TimelineItemAmount>
                  {!!fromUsd && (
                    <Tooltip
                      title={intl.formatMessage(
                        showFromCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                      )}
                    >
                      <TimelineItemAmountUsd onClick={() => setShowFromCurrentPrice((prev) => !prev)}>
                        (${fromUsd})
                      </TimelineItemAmountUsd>
                    </Tooltip>
                  )}
                </ContainerBox>
                {!!yieldFromAmount && (
                  <ContainerBox gap={1} alignItems="center">
                    <TimelineItemAmountText>
                      <FormattedMessage defaultMessage="+ yield" description="plusYield" />
                      {` `}
                      {formatCurrencyAmount({ amount: yieldFromAmount, token: from, intl })}
                    </TimelineItemAmountText>
                    {!!fromYieldUsd && (
                      <Tooltip
                        title={intl.formatMessage(
                          showFromCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                        )}
                      >
                        <TimelineItemAmountTextUsd onClick={() => setShowFromCurrentPrice((prev) => !prev)}>
                          (${fromYieldUsd})
                        </TimelineItemAmountTextUsd>
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
  header: () =>
    buildDcaTimelineHeader(
      <FormattedMessage description="timelineTypeWithdrawn" defaultMessage="Position Closed" />,
      positionState,
      position.chainId
    ),
});
