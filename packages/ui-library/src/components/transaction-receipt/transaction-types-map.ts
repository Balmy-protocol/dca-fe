import { TransactionEventTypes } from 'common-types';
import { defineMessage } from 'react-intl';

export const TRANSACTION_TYPE_TITLE_MAP: Record<TransactionEventTypes, ReturnType<typeof defineMessage>> = {
  [TransactionEventTypes.ERC20_APPROVAL]: defineMessage({
    defaultMessage: 'Approve Token',
    description: 'TransactionReceipt-erc20approval-transactionType',
  }),
  [TransactionEventTypes.ERC20_TRANSFER]: defineMessage({
    defaultMessage: 'Transfer Token',
    description: 'TransactionReceipt-erc20transfer-transactionType',
  }),
  [TransactionEventTypes.SWAP]: defineMessage({
    defaultMessage: 'Swap',
    description: 'TransactionReceipt-erc20transfer-transactionType',
  }),
  [TransactionEventTypes.NATIVE_TRANSFER]: defineMessage({
    defaultMessage: 'Transfer Token',
    description: 'TransactionReceipt-nativetransfer-transactionType',
  }),
  [TransactionEventTypes.DCA_WITHDRAW]: defineMessage({
    defaultMessage: 'Withdraw from Position',
    description: 'TransactionReceipt-dcawithdrawposition-transactionType',
  }),
  [TransactionEventTypes.DCA_MODIFIED]: defineMessage({
    defaultMessage: 'Modified Position',
    description: 'TransactionReceipt-dcamodifyposition-transactionType',
  }),
  [TransactionEventTypes.DCA_CREATED]: defineMessage({
    defaultMessage: 'Created DCA Position',
    description: 'TransactionReceipt-dcacreateposition-transactionType',
  }),
  [TransactionEventTypes.DCA_PERMISSIONS_MODIFIED]: defineMessage({
    defaultMessage: 'Position Permissions modified',
    description: 'TransactionReceipt-dcapositionpermissionsmodifiedposition-transactionType',
  }),
  [TransactionEventTypes.DCA_TRANSFER]: defineMessage({
    defaultMessage: 'Position Transfered',
    description: 'TransactionReceipt-dcatransferedposition-transactionType',
  }),
  [TransactionEventTypes.DCA_TERMINATED]: defineMessage({
    defaultMessage: 'Position Closed',
    description: 'TransactionReceipt-dcaterminatedposition-transactionType',
  }),
};
