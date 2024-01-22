import { TransactionEvent, TransactionEventTypes, TransactionEventIncomingTypes } from 'common-types';
import { defineMessage, useIntl } from 'react-intl';
import { totalSupplyThreshold } from './parsing';

export const getTransactionTitle = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return defineMessage({
        description: 'ERC20Approval-Title',
        defaultMessage: 'Approval',
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
  }

  return TransactionEventIncomingTypes.OUTGOING;
};

export const getTransactionValue = (tx: TransactionEvent, wallets: string[], intl: ReturnType<typeof useIntl>) => {
  if (
    BigInt(tx.data.amount.amount) > totalSupplyThreshold(tx.data.token.decimals) &&
    tx.type === TransactionEventTypes.ERC20_APPROVAL
  ) {
    return intl.formatMessage(
      defineMessage({
        description: 'unlimited',
        defaultMessage: 'Unlimited',
      })
    );
  }

  if (
    (tx.type === TransactionEventTypes.ERC20_TRANSFER || tx.type == TransactionEventTypes.NATIVE_TRANSFER) &&
    tx.data.to
  ) {
    const isReceivingFunds = wallets.includes(tx.data.to);
    return `${isReceivingFunds ? '+' : '-'}${tx.data.amount.amountInUnits} ${tx.data.token.symbol}`;
  }

  return `${tx.data.amount.amountInUnits} ${tx.data.token.symbol}`;
};

export const getTransactionTokenValuePrice = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return 0;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return Number(tx.data.amount.amountInUSD) || 0;
  }

  return undefined;
};

export const getTransactionPriceColor = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return undefined;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return tx.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING ? 'error' : 'success.main';
  }

  return undefined;
};
