import { EarnWithdrawDataDoneEvent, TransactionEventTypes, WithdrawType } from 'common-types';
import { defineMessage } from 'react-intl';
import { TransactionReceiptProp } from './types';

export const getIsDelayedWithdraw = (withdrawn: EarnWithdrawDataDoneEvent['withdrawn']) =>
  withdrawn.some((w) => w.withdrawType === WithdrawType.DELAYED && w.amount.amount > BigInt(0));

export const getTransactionTypeTitle = (type: TransactionReceiptProp) => {
  switch (type.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      if (type.data.amount.amount === BigInt(0)) {
        return defineMessage({
          defaultMessage: 'Remove Token Approval',
          description: 'TransactionReceipt-erc20approval-revoke-transactionType',
        });
      }
      return defineMessage({
        defaultMessage: 'Approve Token',
        description: 'TransactionReceipt-erc20approval-transactionType',
      });
    case TransactionEventTypes.ERC20_TRANSFER:
      return defineMessage({
        defaultMessage: 'Transfer Token',
        description: 'TransactionReceipt-erc20transfer-transactionType',
      });
    case TransactionEventTypes.SWAP:
      return defineMessage({
        defaultMessage: 'Swap',
        description: 'TransactionReceipt-erc20transfer-transactionType',
      });
    case TransactionEventTypes.NATIVE_TRANSFER:
      return defineMessage({
        defaultMessage: 'Transfer Token',
        description: 'TransactionReceipt-nativetransfer-transactionType',
      });
    case TransactionEventTypes.DCA_WITHDRAW:
      return defineMessage({
        defaultMessage: 'Withdraw from Position',
        description: 'TransactionReceipt-dcawithdrawposition-transactionType',
      });
    case TransactionEventTypes.DCA_MODIFIED:
      return defineMessage({
        defaultMessage: 'Modified Position',
        description: 'TransactionReceipt-dcamodifyposition-transactionType',
      });
    case TransactionEventTypes.DCA_CREATED:
      return defineMessage({
        defaultMessage: 'Created DCA Position',
        description: 'TransactionReceipt-dcacreateposition-transactionType',
      });
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      return defineMessage({
        defaultMessage: 'Position Permissions modified',
        description: 'TransactionReceipt-dcapositionpermissionsmodifiedposition-transactionType',
      });
    case TransactionEventTypes.DCA_TRANSFER:
      return defineMessage({
        defaultMessage: 'Position Transfered',
        description: 'TransactionReceipt-dcatransferedposition-transactionType',
      });
    case TransactionEventTypes.DCA_TERMINATED:
      return defineMessage({
        defaultMessage: 'Position Closed',
        description: 'TransactionReceipt-dcaterminatedposition-transactionType',
      });
    case TransactionEventTypes.EARN_CREATED:
      return defineMessage({
        defaultMessage: 'Invested through Earn',
        description: 'TransactionReceipt-earndeposited-transactionType',
      });
    case TransactionEventTypes.EARN_INCREASE:
      return defineMessage({
        defaultMessage: 'Invested through Earn',
        description: 'TransactionReceipt-earnincrease-transactionType',
      });
    case TransactionEventTypes.EARN_WITHDRAW:
      if (getIsDelayedWithdraw(type.data.withdrawn)) {
        return defineMessage({
          defaultMessage: 'Initiated delayed withdrawal',
          description: 'TransactionReceipt-earnwithdrawdelayed-transactionType',
        });
      } else {
        return defineMessage({
          defaultMessage: 'Withdrew from Earn',
          description: 'TransactionReceipt-earnwithdraw-transactionType',
        });
      }
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      return defineMessage({
        defaultMessage: 'Withdrew from Earn',
        description: 'TransactionReceipt-earnmarketwithdraw-transactionType',
      });
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return defineMessage({
        defaultMessage: 'Claimed delayed withdrawal',
        description: 'TransactionReceipt-earnclaimdelayedwithdraw-transactionType',
      });
    default:
      return defineMessage({
        defaultMessage: 'Unknown Transaction',
        description: 'TransactionReceipt-unknown-transactionType',
      });
  }
};
