import {
  TransactionEvent,
  TransactionEventTypes,
  TransactionEventIncomingTypes,
  Token,
  Address,
  ChainId,
  IndexerUnits,
} from 'common-types';
import { defineMessage, useIntl } from 'react-intl';
import { totalSupplyThreshold } from '../parsing';
import { formatCurrencyAmount, formatUsdAmount } from '../currency';
import { getIsDelayedWithdraw } from 'ui-library';

export const getTransactionTitle = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      if (tx.data.amount.amount === 0n) {
        return defineMessage({
          description: 'ERC20Revoked-Title',
          defaultMessage: 'Approval revoked',
        });
      }
      return defineMessage({
        description: 'ERC20Approval-Title',
        defaultMessage: 'Approval',
      });
    case TransactionEventTypes.DCA_WITHDRAW:
      return defineMessage({
        description: 'DCAWithdraw-Title',
        defaultMessage: 'Withdraw',
      });
    case TransactionEventTypes.DCA_TERMINATED:
      return defineMessage({
        description: 'DCATerminate-Title',
        defaultMessage: 'Closed DCA position',
      });
    case TransactionEventTypes.DCA_MODIFIED:
      return defineMessage({
        description: 'DCAModify-Title',
        defaultMessage: 'Modified position',
      });
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      return defineMessage({
        description: 'DCAPermissionsModified-Title',
        defaultMessage: 'Position permissions modified',
      });
    case TransactionEventTypes.DCA_CREATED:
      return defineMessage({
        description: 'DCACreate-Title',
        defaultMessage: 'Created DCA position',
      });
    case TransactionEventTypes.DCA_TRANSFER:
      return defineMessage({
        description: 'DCATransfer-Title',
        defaultMessage: 'Transfered DCA position',
      });
    case TransactionEventTypes.SWAP:
      return defineMessage({
        description: 'Swap-Title',
        defaultMessage: 'Swap',
      });
    case TransactionEventTypes.EARN_CREATED:
      return defineMessage({
        description: 'EarnDeposited-Title',
        defaultMessage: 'Invested',
      });
    case TransactionEventTypes.EARN_INCREASE:
      return defineMessage({
        description: 'EarnIncrease-Title',
        defaultMessage: 'Invested',
      });
    case TransactionEventTypes.EARN_WITHDRAW:
      if (getIsDelayedWithdraw(tx.data.withdrawn)) {
        return defineMessage({
          description: 'EarnWithdrawDelayed-Title',
          defaultMessage: 'Initiated delayed withdrawal',
        });
      } else {
        return defineMessage({
          description: 'EarnWithdraw-Title',
          defaultMessage: 'Withdrew',
        });
      }
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      return defineMessage({
        description: 'EarnMarketWithdraw-Title',
        defaultMessage: 'Withdrew',
      });
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return defineMessage({
        description: 'EarnClaimDelayedWithdraw-Title',
        defaultMessage: 'Claimed delayed withdrawal',
      });
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      if (tx.data.tokenFlow === TransactionEventIncomingTypes.INCOMING) {
        return defineMessage({
          description: 'ERC20TransferIncoming-Title',
          defaultMessage: 'Receive',
        });
      } else {
        return defineMessage({
          description: 'ERC20TransferOutgoing-Title',
          defaultMessage: 'Transfer',
        });
      }
  }

  return defineMessage({
    description: 'UnknownTransactionEvent-title',
    defaultMessage: 'Operation',
  });
};

export const getTransactionTokenFlow = (tx: TransactionEvent, wallets: string[]) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return TransactionEventIncomingTypes.OUTGOING;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      const from = tx.data.from.toLowerCase();
      const to = tx.data.to.toLowerCase();
      if (wallets.includes(from) && wallets.includes(to)) {
        return TransactionEventIncomingTypes.SAME_ACCOUNTS;
      } else if (wallets.includes(to)) {
        return TransactionEventIncomingTypes.INCOMING;
      } else if (wallets.includes(from)) {
        return TransactionEventIncomingTypes.OUTGOING;
      }
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
      return TransactionEventIncomingTypes.INCOMING;
      break;
    case TransactionEventTypes.DCA_CREATED:
      return TransactionEventIncomingTypes.INCOMING;
      break;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
    case TransactionEventTypes.EARN_WITHDRAW:
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return TransactionEventIncomingTypes.INCOMING;
      break;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      return TransactionEventIncomingTypes.INCOMING;
    case TransactionEventTypes.DCA_TRANSFER:
      return TransactionEventIncomingTypes.OUTGOING;
      break;
    case TransactionEventTypes.SWAP:
      return TransactionEventIncomingTypes.INCOMING;
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      const totalBefore = BigInt(tx.data.oldRate.amount) * BigInt(tx.data.oldRemainingSwaps);
      const totalNow = BigInt(tx.data.rate.amount) * BigInt(tx.data.oldRemainingSwaps);

      return totalBefore > totalNow ? TransactionEventIncomingTypes.OUTGOING : TransactionEventIncomingTypes.INCOMING;
      break;
  }

  return TransactionEventIncomingTypes.OUTGOING;
};

export const getTransactionValue = (tx: TransactionEvent, intl: ReturnType<typeof useIntl>) => {
  const isReceivingFunds = tx.data.tokenFlow === TransactionEventIncomingTypes.INCOMING;

  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      if (BigInt(tx.data.amount.amount) > totalSupplyThreshold(tx.data.token.decimals)) {
        return intl.formatMessage(
          defineMessage({
            description: 'unlimited',
            defaultMessage: 'Unlimited',
          })
        );
      } else if (tx.data.amount.amount === 0n) {
        return intl.formatMessage(
          defineMessage({
            description: 'ERC20Revoked-TransactionValue',
            defaultMessage: '-',
          })
        );
      } else {
        return `${formatCurrencyAmount({ amount: tx.data.amount.amount, token: tx.data.token, intl })} ${
          tx.data.token.symbol
        }`;
      }
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return `${isReceivingFunds ? '+' : '-'} ${formatCurrencyAmount({
        amount: tx.data.amount.amount,
        token: tx.data.token,
        intl,
      })} ${tx.data.token.symbol}`;
    case TransactionEventTypes.DCA_WITHDRAW:
      return `+ ${formatCurrencyAmount({ amount: tx.data.withdrawn.amount, token: tx.data.toToken, intl })} ${
        tx.data.toToken.symbol
      }`;
    case TransactionEventTypes.DCA_TERMINATED:
      return `+ ${formatCurrencyAmount({
        amount: tx.data.withdrawnRemaining.amount,
        token: tx.data.fromToken,
        intl,
      })} / + ${formatCurrencyAmount({ amount: tx.data.withdrawnSwapped.amount, token: tx.data.toToken, intl })}`;
    case TransactionEventTypes.SWAP:
      return `- ${formatCurrencyAmount({
        amount: tx.data.amountIn.amount,
        token: tx.data.tokenIn,
        intl,
      })} / + ${formatCurrencyAmount({ amount: tx.data.amountOut.amount, token: tx.data.tokenOut, intl })}`;
    case TransactionEventTypes.DCA_MODIFIED:
      return `${isReceivingFunds ? '+' : '-'} ${formatCurrencyAmount({
        amount: tx.data.difference.amount,
        token: tx.data.fromToken,
        intl,
      })} ${tx.data.fromToken.symbol}`;
    case TransactionEventTypes.DCA_CREATED:
      return `${formatCurrencyAmount({ amount: tx.data.funds.amount, token: tx.data.fromToken, intl })} ${
        tx.data.fromToken.symbol
      }`;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      return `${formatCurrencyAmount({ amount: tx.data.assetsDepositedAmount.amount, token: tx.data.asset, intl })} ${
        tx.data.depositToken.symbol
      }`;
    case TransactionEventTypes.EARN_WITHDRAW:
      const withdrawnAsset = tx.data.withdrawn[0];
      const isWithdrawingRewards = tx.data.withdrawn.some(
        (withdrawn) => withdrawn.token.address !== withdrawnAsset.token.address && withdrawn.amount.amount > 0n
      );

      const parsedAssetAmount =
        withdrawnAsset.amount.amount > 0n
          ? `+ ${formatCurrencyAmount({ amount: withdrawnAsset.amount.amount, token: withdrawnAsset.token, intl })} ${
              withdrawnAsset.token.symbol
            }`
          : '';

      return `${parsedAssetAmount} ${
        isWithdrawingRewards
          ? intl.formatMessage(
              defineMessage({
                description: 'earn.events.withdraw.value.plus-rewards',
                defaultMessage: '+Rewards',
              })
            )
          : ''
      }`.trim();
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      const specialWithdrawData = tx.data.tokens[0];
      return `+ ${formatCurrencyAmount({
        amount: specialWithdrawData.amount.amount,
        token: specialWithdrawData.token,
        intl,
      })} ${specialWithdrawData.token.symbol}`;
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return `+ ${formatCurrencyAmount({ amount: tx.data.withdrawn.amount, token: tx.data.token, intl })} ${
        tx.data.token.symbol
      }`;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      return `-`;
    default:
      return '-';
  }
};

export const getTransactionUsdValue = (txEvent: TransactionEvent, intl: ReturnType<typeof useIntl>) => {
  let amountInUsd: string | undefined;

  switch (txEvent.type) {
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      break;
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.amount.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.difference.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.withdrawn.amountInUSD, intl });
      break;
    case TransactionEventTypes.DCA_TERMINATED:
      amountInUsd = formatUsdAmount({
        amount: Number(txEvent.data.withdrawnRemaining.amountInUSD) + Number(txEvent.data.withdrawnSwapped.amountInUSD),
        intl,
      });
      break;
    case TransactionEventTypes.DCA_CREATED:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.funds.amountInUSD, intl });
      break;
    case TransactionEventTypes.SWAP:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.amountIn.amountInUSD, intl });
      break;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.assetsDepositedAmount.amountInUSD, intl });
      break;
    case TransactionEventTypes.EARN_WITHDRAW:
      amountInUsd = formatUsdAmount({
        amount: txEvent.data.withdrawn
          .reduce((acc, withdrawn) => acc + Number(withdrawn.amount.amountInUSD || 0), 0)
          .toString(),
        intl,
      });
      break;
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      const specialWithdrawData = txEvent.data.tokens[0];
      amountInUsd = formatUsdAmount({ amount: specialWithdrawData.amount.amountInUSD, intl });
      break;
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      amountInUsd = formatUsdAmount({ amount: txEvent.data.withdrawn.amountInUSD, intl });
      break;
  }

  return amountInUsd ? amountInUsd : '-';
};

export const getTransactionTokenValuePrice = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return 0;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return Number(tx.data.amount.amountInUSD) || 0;
    case TransactionEventTypes.DCA_WITHDRAW:
      return Number(tx.data.withdrawn.amountInUSD) || 0;
    case TransactionEventTypes.DCA_TERMINATED:
      return Number(tx.data.withdrawnRemaining.amountInUSD) + Number(tx.data.withdrawnSwapped.amountInUSD) || 0;
    case TransactionEventTypes.SWAP:
      return Number(tx.data.amountIn.amountInUSD) || 0;
    case TransactionEventTypes.DCA_MODIFIED:
      return Number(tx.data.difference.amountInUSD) || 0;
    case TransactionEventTypes.DCA_CREATED:
      return Number(tx.data.funds.amountInUSD) || 0;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      return Number(tx.data.assetsDepositedAmount.amountInUSD) || 0;
    case TransactionEventTypes.EARN_WITHDRAW:
      return tx.data.withdrawn.reduce((acc, withdrawn) => acc + Number(withdrawn.amount.amountInUSD || 0), 0);
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      const specialWithdrawData = tx.data.tokens[0];
      return Number(specialWithdrawData.amount.amountInUSD) || 0;
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return Number(tx.data.withdrawn.amountInUSD) || 0;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
      return 0;
  }

  return undefined;
};

export const getTransactionPriceColor = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.SWAP:
      return undefined;
    case TransactionEventTypes.EARN_WITHDRAW:
      if (getIsDelayedWithdraw(tx.data.withdrawn)) return undefined;
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.NATIVE_TRANSFER:
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return tx.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING ? 'error.dark' : 'success.dark';
  }

  return undefined;
};

export const getTransactionInvolvedWallets = (tx: TransactionEvent) => {
  let wallets: string[] = [];
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      const { owner, spender } = tx.data;
      wallets = [owner, spender];
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      break;
    case TransactionEventTypes.DCA_CREATED:
      const { owner: dcaCreationOwner } = tx.data;
      wallets = [dcaCreationOwner];
      break;
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
    case TransactionEventTypes.EARN_WITHDRAW:
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      const { user } = tx.data;
      wallets = [user];
      break;
    case TransactionEventTypes.DCA_TRANSFER:
      const { to: dcaTransferedTo } = tx.data;
      wallets = [dcaTransferedTo];
      break;
    case TransactionEventTypes.SWAP:
      const { recipient } = tx.data;
      wallets = [recipient];
      break;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      const { to: transferedTo } = tx.data;
      wallets = [transferedTo];
      break;
  }

  return [...wallets, tx.tx.initiatedBy];
};

export const getTransactionInvolvedTokens = (tx: TransactionEvent): Token[] => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return [tx.data.token];
    case TransactionEventTypes.DCA_WITHDRAW:
      return [tx.data.toToken];
    case TransactionEventTypes.DCA_TERMINATED:
      return [
        ...(tx.data.withdrawnRemaining.amount > 0n ? [tx.data.fromToken] : []),
        ...(tx.data.withdrawnSwapped.amount > 0n ? [tx.data.toToken] : []),
      ];
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
      return [tx.data.fromToken];
    case TransactionEventTypes.SWAP:
      return [tx.data.tokenIn, tx.data.tokenOut];
    case TransactionEventTypes.DCA_TRANSFER:
      return [tx.data.fromToken, tx.data.toToken];
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      return [];
    case TransactionEventTypes.EARN_CREATED:
    case TransactionEventTypes.EARN_INCREASE:
      return [tx.data.depositToken];
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return [tx.data.token];
    case TransactionEventTypes.EARN_WITHDRAW:
      return tx.data.withdrawn.map((withdrawn) => withdrawn.token);
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      return [tx.data.tokens[0].token];
  }

  return [];
};

export type IncludedIndexerUnits = Exclude<IndexerUnits, IndexerUnits.CHAINLINK_REGISTRY>;
export type UnitsIndexedByChainPercentage = Record<
  Address,
  Record<IncludedIndexerUnits, Record<ChainId, { percentage: number; isIndexed: boolean }>>
>; // <IndexerUnits, Record<ChainId, boolean>>

export const filterEventsByUnitIndexed = (events: TransactionEvent[], unitsIndexed: UnitsIndexedByChainPercentage) => {
  return events.filter((event) => {
    const involvedWallets = getTransactionInvolvedWallets(event);
    return involvedWallets.every((wallet) => {
      // Since this applies to wallet that the user might not have added
      if (
        !unitsIndexed[wallet as Address] ||
        !unitsIndexed[wallet as Address][event.unit] ||
        !unitsIndexed[wallet as Address][event.unit][event.tx.chainId]
      ) {
        return true;
      }
      const walletUnit = unitsIndexed[wallet as Address][event.unit][event.tx.chainId];
      return walletUnit.isIndexed;
    });
  });
};
