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
import { formatCurrencyAmount, formatUsdAmount, toSignificantFromBigDecimal } from '../currency';

export const getTransactionTitle = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
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
      } else {
        return `${formatCurrencyAmount({ amount: tx.data.amount.amount, token: tx.data.token, intl })} ${
          tx.data.token.symbol
        }`;
      }
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return `${isReceivingFunds ? '+' : '-'}${formatCurrencyAmount({
        amount: tx.data.amount.amount,
        token: tx.data.token,
        intl,
      })} ${tx.data.token.symbol}`;
    case TransactionEventTypes.DCA_WITHDRAW:
      return `+${formatCurrencyAmount({ amount: tx.data.withdrawn.amount, token: tx.data.toToken, intl })} ${
        tx.data.toToken.symbol
      }`;
    case TransactionEventTypes.DCA_TERMINATED:
      return `+${formatCurrencyAmount({
        amount: tx.data.withdrawnRemaining.amount,
        token: tx.data.fromToken,
        intl,
      })} / +${formatCurrencyAmount({ amount: tx.data.withdrawnSwapped.amount, token: tx.data.toToken, intl })}`;
    case TransactionEventTypes.SWAP:
      return `-${formatCurrencyAmount({
        amount: tx.data.amountIn.amount,
        token: tx.data.tokenIn,
        intl,
      })} / +${formatCurrencyAmount({ amount: tx.data.amountOut.amount, token: tx.data.tokenOut, intl })}`;
    case TransactionEventTypes.DCA_MODIFIED:
      return `${isReceivingFunds ? '+' : '-'}${formatCurrencyAmount({
        amount: tx.data.difference.amount,
        token: tx.data.fromToken,
        intl,
      })} ${tx.data.fromToken.symbol}`;
    case TransactionEventTypes.DCA_CREATED:
      return `${formatCurrencyAmount({ amount: tx.data.funds.amount, token: tx.data.fromToken, intl })} ${
        tx.data.fromToken.symbol
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
  }

  return amountInUsd ? toSignificantFromBigDecimal(amountInUsd.toString(), 2) : '-';
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
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.SWAP:
      return undefined;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.NATIVE_TRANSFER:
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
  }

  return [];
};

export type IncludedIndexerUnits = Exclude<IndexerUnits, IndexerUnits.CHAINLINK_REGISTRY | IndexerUnits.EARN>;
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
