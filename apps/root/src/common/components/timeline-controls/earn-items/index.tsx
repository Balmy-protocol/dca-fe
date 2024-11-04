import React from 'react';
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
import { CardGiftcardIcon, ContainerBox, ExportIcon, MoneyReceiveIcon, ReceiptIcon, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import {
  StyledTimelineLink,
  TimelineItemAmount,
  TimelineItemSubTitle,
  TimelineItemTitle,
  TimelineTokenAmount,
} from '@common/components/timeline-controls/common';
import { isSameToken } from '@common/utils/currency';
import { buildEtherscanAddress, buildEtherscanTransaction } from '@common/utils/etherscan';
import Address from '@common/components/address';
import { find } from 'lodash';
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
  icon: MoneyReceiveIcon,
  content: () => {
    const asset = position.strategy.asset;
    const assetPrice = positionState.assetPrice;
    const currentAssetPrice = asset.price;
    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-create" defaultMessage="Deposited" />
        </TimelineItemSubTitle>
        <TimelineTokenAmount
          token={asset}
          amount={positionState.deposited}
          currentPrice={currentAssetPrice}
          tokenPrice={assetPrice}
        />
      </>
    );
  },
  transactionData: buildEarnTimelineTransactionData(positionState, position.strategy.farm.chainId, position.owner),
});

export const buildEarnIncreasedItem = (positionState: EarnPositionIncreasedAction, position: EarnPosition) => ({
  icon: MoneyReceiveIcon,
  content: () => {
    const asset = position.strategy.asset;
    const assetPrice = positionState.assetPrice;
    const currentAssetPrice = asset.price;
    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-increase" defaultMessage="Deposited" />
        </TimelineItemSubTitle>
        <TimelineTokenAmount
          token={asset}
          amount={positionState.deposited}
          currentPrice={currentAssetPrice}
          tokenPrice={assetPrice}
        />
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

    const withdrawnTokensWithCurrentPrice = React.useMemo(
      () =>
        positionState.withdrawn
          .filter((withdrawn) => withdrawn.amount.amount > 0n)
          .map((withdrawn) => ({
            ...withdrawn,
            currentPrice: getCurrentPrice(withdrawn.token),
          })),
      [positionState.withdrawn, getCurrentPrice]
    );

    return (
      <>
        <TimelineItemSubTitle>
          <FormattedMessage description="earn.timeline.title.vault-position-withdrew" defaultMessage="Withdrew" />
        </TimelineItemSubTitle>
        <ContainerBox alignItems="center" gap={4}>
          {withdrawnTokensWithCurrentPrice.map(({ token, currentPrice, amount }) => (
            <TimelineTokenAmount
              key={token.address}
              token={token}
              amount={amount}
              currentPrice={currentPrice}
              tokenPrice={token.price}
            />
          ))}
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
