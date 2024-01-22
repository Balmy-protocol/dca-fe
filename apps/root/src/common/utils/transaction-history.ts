import { TransactionEvent, TransactionEventTypes, TransactionEventIncomingTypes, TokenWithIcon } from 'common-types';
import { defineMessage, useIntl } from 'react-intl';
import { totalSupplyThreshold } from './parsing';

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
    case TransactionEventTypes.DCA_MODIFIED:
      return defineMessage({
        description: 'DCAModify-Title',
        defaultMessage: 'Modified position',
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

export const getTransactionValue = (tx: TransactionEvent, wallets: string[], intl: ReturnType<typeof useIntl>) => {
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
        return `${tx.data.amount.amountInUnits} ${tx.data.token.symbol}`;
      }
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return `${isReceivingFunds ? '+' : '-'}${tx.data.amount.amountInUnits} ${tx.data.token.symbol}`;
    case TransactionEventTypes.DCA_WITHDRAW:
      return `+${tx.data.withdrawn.amountInUnits} ${tx.data.tokenTo.symbol}`;
    case TransactionEventTypes.DCA_MODIFIED:
      return `${isReceivingFunds ? '+' : '-'}${tx.data.difference.amountInUnits} ${tx.data.tokenFrom.symbol}`;
    default:
      return '-';
  }
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
    case TransactionEventTypes.DCA_MODIFIED:
      return Number(tx.data.difference.amountInUSD) || 0;
  }

  return undefined;
};

export const getTransactionPriceColor = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return undefined;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return tx.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING ? 'error' : 'success.main';
  }

  return undefined;
};

export const getTxMainToken = (txEvent: TransactionEvent): TokenWithIcon => {
  switch (txEvent.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return txEvent.data.token;
    case TransactionEventTypes.DCA_MODIFIED:
      return txEvent.data.tokenFrom;
    case TransactionEventTypes.DCA_WITHDRAW:
      return txEvent.data.tokenTo;
  }
};
