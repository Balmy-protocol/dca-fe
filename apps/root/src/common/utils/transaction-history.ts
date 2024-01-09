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
      if (tx.tokenFlow === TransactionEventIncomingTypes.INCOMING) {
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
      if (wallets.includes(tx.from) && wallets.includes(tx.to)) {
        return TransactionEventIncomingTypes.SAME_ACCOUNTS;
      } else if (wallets.includes(tx.to)) {
        return TransactionEventIncomingTypes.INCOMING;
      } else if (wallets.includes(tx.from)) {
        return TransactionEventIncomingTypes.OUTGOING;
      }
      break;
  }

  return TransactionEventIncomingTypes.OUTGOING;
};

export const getTransactionValue = (tx: TransactionEvent, wallets: string[], intl: ReturnType<typeof useIntl>) => {
  if (
    BigInt(tx.amount.amount) > totalSupplyThreshold(tx.token.decimals) &&
    tx.type === TransactionEventTypes.ERC20_APPROVAL
  ) {
    return intl.formatMessage(
      defineMessage({
        description: 'unlimited',
        defaultMessage: 'Unlimited',
      })
    );
  }

  if ((tx.type === TransactionEventTypes.ERC20_TRANSFER || tx.type == TransactionEventTypes.NATIVE_TRANSFER) && tx.to) {
    const isReceivingFunds = wallets.includes(tx.to);
    return `${isReceivingFunds ? '+' : '-'}${tx.amount.amountInUnits} ${tx.token.symbol}`;
  }

  return `${tx.amount.amountInUnits} ${tx.token.symbol}`;
};

export const getTransactionTokenValuePrice = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return 0;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return Number(tx.amount.amountInUSD) || 0;
  }

  return undefined;
};

export const getTransactionPriceColor = (tx: TransactionEvent) => {
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return undefined;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return tx.tokenFlow === TransactionEventIncomingTypes.OUTGOING ? 'error' : 'success.main';
  }

  return undefined;
};
