import { TransactionEventTypes } from 'common-types';
import { defineMessage } from 'react-intl';

export const TRANSACTION_TYPE_TITLE_MAP = {
  [TransactionEventTypes.ERC20_APPROVAL]: defineMessage({
    defaultMessage: 'Approve Token',
    description: 'TransactionReceipt-erc20approval-transactionType',
  }),
  [TransactionEventTypes.ERC20_TRANSFER]: defineMessage({
    defaultMessage: 'Transfer Token',
    description: 'TransactionReceipt-erc20transfer-transactionType',
  }),
  [TransactionEventTypes.NATIVE_TRANSFER]: defineMessage({
    defaultMessage: 'Transfer Token',
    description: 'TransactionReceipt-nativetransfer-transactionType',
  }),
};
