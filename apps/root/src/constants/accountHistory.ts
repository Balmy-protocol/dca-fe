import { TransactionEventTypes, TransactionTypes } from 'common-types';

export const DCA_TYPE_EVENTS = [TransactionEventTypes.DCA_MODIFIED, TransactionEventTypes.DCA_WITHDRAW];
export const DCA_TYPE_TRANSACTIONS = [
  TransactionTypes.addFundsPosition,
  TransactionTypes.migratePosition,
  TransactionTypes.migratePositionYield,
  TransactionTypes.modifyPermissions,
  TransactionTypes.modifyRateAndSwapsPosition,
  TransactionTypes.modifySwapsPosition,
  TransactionTypes.removeFunds,
];
