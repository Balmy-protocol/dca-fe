import React, { useState } from 'react';
import {
  EarnPosition,
  EarnPositionAction,
  EarnPositionCreatedAction,
  EarnPositionDelayedWithdrawalClaimedAction,
  EarnPositionIncreasedAction,
  EarnPositionPermissionsModifiedAction,
  EarnPositionTransferredAction,
  EarnPositionWithdrewAction,
  Token,
} from 'common-types';
import {
  CardGiftcardIcon,
  ChartSquareIcon,
  ContainerBox,
  ExportIcon,
  MoneyReceiveIcon,
  ReceiptIcon,
  Tooltip,
  Typography,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  StyledTimelineLink,
  timelineCurrentPriceMessage,
  TimelineItemAmount,
  TimelineItemAmountUsd,
  TimelineItemSubTitle,
  TimelineItemTitle,
  timelinePrevPriceMessage,
} from '@common/components/timeline-controls/common';
import TokenIcon from '@common/components/token-icon';
import {
  formatCurrencyAmount,
  formatUsdAmount,
  isSameToken,
  parseNumberUsdPriceToBigInt,
  parseUsdPrice,
} from '@common/utils/currency';
import { buildEtherscanAddress, buildEtherscanTransaction } from '@common/utils/etherscan';
import Address from '@common/components/address';
import { TokenNetworksTooltipTitle } from '@pages/home/components/token-icon-multichain';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { find } from 'lodash';
import { BalanceToken } from '@hooks/useMergedTokensBalances';
import { StyledTimelineTitleEnd } from '../timeline';
import { Address as ViemAddress } from 'viem';
import TimelineTimeItem from '../timeline-time-item';

const buildEarnTimelineTransactionData = (action: EarnPositionAction, chainId: number, owner: ViemAddress) => () => (
  <ContainerBox flexDirection="column" gap={1}>
    <StyledTimelineTitleEnd>
      <TimelineTimeItem timestamp={action.tx.timestamp} />
      <Typography variant="bodyRegular">
        <StyledTimelineLink href={buildEtherscanTransaction(action.tx.hash, chainId)} target="_blank" rel="noreferrer">
          <ExportIcon fontSize="small" />
        </StyledTimelineLink>
      </Typography>
    </StyledTimelineTitleEnd>
    <Typography variant="labelRegular">
      <Address address={owner} trimAddress />
    </Typography>
  </ContainerBox>
);

export const buildEarnCreatedItem = (positionState: EarnPositionCreatedAction, position: EarnPosition) => ({
  icon: ChartSquareIcon,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);
    const asset = position.strategy.asset;
    const assetPrice = positionState.assetPrice;
    const currentAssetPrice = asset.price;
    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-create" defaultMessage="Created" />
        </TimelineItemSubTitle>
        <ContainerBox alignItems="center" gap={2}>
          <TokenIcon token={asset} size={5} />
          <ContainerBox gap={1} alignItems="center">
            <TimelineItemAmount>
              {formatCurrencyAmount({ amount: positionState.deposited.amount, token: asset, intl })}
            </TimelineItemAmount>
            {assetPrice && (
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
              >
                <TimelineItemAmountUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  ($
                  {parseUsdPrice(
                    asset,
                    positionState.deposited.amount,
                    parseNumberUsdPriceToBigInt(showCurrentPrice ? currentAssetPrice : assetPrice)
                  )}
                  )
                </TimelineItemAmountUsd>
              </Tooltip>
            )}
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  transactionData: buildEarnTimelineTransactionData(positionState, position.strategy.farm.chainId, position.owner),
});

export const buildEarnIncreasedItem = (positionState: EarnPositionIncreasedAction, position: EarnPosition) => ({
  icon: MoneyReceiveIcon,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);
    const asset = position.strategy.asset;
    const assetPrice = positionState.assetPrice;
    const currentAssetPrice = asset.price;
    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-increase" defaultMessage="Deposit" />
        </TimelineItemSubTitle>
        <ContainerBox alignItems="center" gap={2}>
          <TokenIcon token={asset} size={5} />
          <ContainerBox gap={1} alignItems="center">
            <TimelineItemAmount>
              {formatCurrencyAmount({ amount: positionState.deposited.amount, token: asset, intl })}
            </TimelineItemAmount>
            {assetPrice && (
              <Tooltip
                title={intl.formatMessage(showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage)}
              >
                <TimelineItemAmountUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  ($
                  {parseUsdPrice(
                    asset,
                    positionState.deposited.amount,
                    parseNumberUsdPriceToBigInt(showCurrentPrice ? currentAssetPrice : assetPrice)
                  )}
                  )
                </TimelineItemAmountUsd>
              </Tooltip>
            )}
          </ContainerBox>
        </ContainerBox>
      </>
    );
  },
  transactionData: buildEarnTimelineTransactionData(positionState, position.strategy.farm.chainId, position.owner),
});

export const buildEarnTransferedItem = (positionState: EarnPositionTransferredAction, position: EarnPosition) => ({
  icon: CardGiftcardIcon,
  content: () => (
    <>
      <TimelineItemSubTitle>
        <FormattedMessage description="earn.timeline.title.vault-position-transfered" defaultMessage="Transfered" />
      </TimelineItemSubTitle>
      <ContainerBox>
        <TimelineItemAmount>
          <StyledTimelineLink
            href={buildEtherscanAddress(positionState.from, position.strategy.farm.chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <Address address={positionState.from} trimAddress />
            <ExportIcon fontSize="small" />
          </StyledTimelineLink>
        </TimelineItemAmount>
      </ContainerBox>
      <TimelineItemTitle>
        <FormattedMessage description="earn.timeline.transfered-to" defaultMessage="Transfered to" />
      </TimelineItemTitle>
      <ContainerBox>
        <TimelineItemAmount>
          <StyledTimelineLink
            href={buildEtherscanAddress(positionState.to, position.strategy.farm.chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <Address address={positionState.to} trimAddress />
            <ExportIcon fontSize="small" />
          </StyledTimelineLink>
        </TimelineItemAmount>
      </ContainerBox>
    </>
  ),
  transactionData: buildEarnTimelineTransactionData(positionState, position.strategy.farm.chainId, position.owner),
});

export const buildEarnWithdrawnItem = (positionState: EarnPositionWithdrewAction, position: EarnPosition) => ({
  icon: ReceiptIcon,
  content: () => {
    const intl = useIntl();
    const [showCurrentPrice, setShowCurrentPrice] = useState(true);

    const withdrawnTokens = positionState.withdrawn.map((data) => data.token);
    const getCurrentPrice = React.useCallback(
      (token: Token) => {
        if (isSameToken(token, position.strategy.asset)) {
          return position.strategy.asset.price;
        }

        const rewardToken = find(position.strategy.rewards.tokens, (rewToken) => isSameToken(rewToken, token));

        if (rewardToken) {
          return rewardToken.price;
        }
      },
      [position.strategy.asset, position.strategy.rewards]
    );

    const singleWithdraw = withdrawnTokens.length === 1;
    const singleWithdrawData = positionState.withdrawn[0];
    const singleWithdrawCurrentPrice = getCurrentPrice(singleWithdrawData.token);

    const { totalWithdrawnUsd, totalWithdrawnUsdCurrent, withdrawTokensBreakdown } = React.useMemo(
      () =>
        positionState.withdrawn.reduce<{
          totalWithdrawnUsd: number;
          totalWithdrawnUsdCurrent: number;
          withdrawTokensBreakdown: BalanceToken[];
        }>(
          (acc, data) => {
            const currentPrice = getCurrentPrice(data.token);
            // eslint-disable-next-line no-param-reassign
            acc.totalWithdrawnUsd += Number(data.amount.amountInUSD);
            // eslint-disable-next-line no-param-reassign
            acc.totalWithdrawnUsdCurrent += Number(data.amount.amountInUnits) * (currentPrice || 0);

            acc.withdrawTokensBreakdown.push({
              token: data.token,
              isLoadingPrice: false,
              balance: data.amount.amount,
              balanceUsd: Number(data.amount.amountInUSD),
              price: showCurrentPrice ? currentPrice : data.token.price,
            });
            return acc;
          },
          {
            totalWithdrawnUsd: 0,
            totalWithdrawnUsdCurrent: 0,
            withdrawTokensBreakdown: [],
          }
        ),
      [positionState.withdrawn, getCurrentPrice, showCurrentPrice]
    );

    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-withdrew" defaultMessage="Withdrew" />
        </TimelineItemSubTitle>
        <ContainerBox alignItems="center" gap={2}>
          {singleWithdraw ? (
            <>
              <TokenIcon token={singleWithdrawData.token} size={5} />
              <ContainerBox gap={1} alignItems="center">
                <TimelineItemAmount>
                  {formatCurrencyAmount({
                    amount: singleWithdrawData.amount.amount,
                    token: singleWithdrawData.token,
                    intl,
                  })}
                </TimelineItemAmount>
                {singleWithdrawCurrentPrice && (
                  <Tooltip
                    title={intl.formatMessage(
                      showCurrentPrice ? timelineCurrentPriceMessage : timelinePrevPriceMessage
                    )}
                  >
                    <TimelineItemAmountUsd onClick={() => setShowCurrentPrice((prev) => !prev)}>
                      ($
                      {parseUsdPrice(
                        singleWithdrawData.token,
                        singleWithdrawData.amount.amount,
                        parseNumberUsdPriceToBigInt(
                          showCurrentPrice ? singleWithdrawCurrentPrice : singleWithdrawData.token.price
                        )
                      )}
                      )
                    </TimelineItemAmountUsd>
                  </Tooltip>
                )}
              </ContainerBox>
            </>
          ) : (
            <>
              <ComposedTokenIcon size={5} tokens={withdrawnTokens} />
              <Tooltip
                title={
                  <ContainerBox flexDirection="column" gap={2}>
                    <TokenNetworksTooltipTitle balanceTokens={withdrawTokensBreakdown} isTokenBreakdown />
                    <Typography variant="bodyExtraSmall">
                      {showCurrentPrice ? (
                        <FormattedMessage
                          defaultMessage="Displaying curent values"
                          description="earn.timeline.withdrawn.currentValues"
                        />
                      ) : (
                        <FormattedMessage
                          defaultMessage="Estimated values on day of the event"
                          description="earn.timeline.withdrawn.previousValues"
                        />
                      )}
                    </Typography>
                  </ContainerBox>
                }
              >
                <TimelineItemAmount onClick={() => setShowCurrentPrice((prev) => !prev)}>
                  ${formatUsdAmount({ amount: showCurrentPrice ? totalWithdrawnUsdCurrent : totalWithdrawnUsd, intl })}
                </TimelineItemAmount>
              </Tooltip>
            </>
          )}
        </ContainerBox>
      </>
    );
  },
  transactionData: buildEarnTimelineTransactionData(positionState, position.strategy.farm.chainId, position.owner),
});

// TODO: create this components in BLY-3071
export const buildEarnDelayedWithdrawalClaimedItem = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionState: EarnPositionDelayedWithdrawalClaimedAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: EarnPosition
) => ({
  icon: () => <></>,
  content: () => <></>,
  transactionData: () => <></>,
});

export const buildEarnPermissionsModifiedItem = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionState: EarnPositionPermissionsModifiedAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: EarnPosition
) => ({
  icon: () => <></>,
  content: () => <></>,
  transactionData: () => <></>,
});
