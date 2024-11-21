import { TransactionEventTypes, TransactionTypes } from 'common-types';

export const DCA_TYPE_EVENTS = [
  TransactionEventTypes.DCA_MODIFIED,
  TransactionEventTypes.DCA_WITHDRAW,
  TransactionEventTypes.DCA_CREATED,
  TransactionEventTypes.DCA_PERMISSIONS_MODIFIED,
  TransactionEventTypes.DCA_TERMINATED,
  TransactionEventTypes.DCA_TRANSFER,
];
export const DCA_TYPE_TRANSACTIONS = [
  TransactionTypes.addFundsPosition,
  TransactionTypes.migratePosition,
  TransactionTypes.migratePositionYield,
  TransactionTypes.modifyPermissions,
  TransactionTypes.modifyRateAndSwapsPosition,
  TransactionTypes.modifySwapsPosition,
  TransactionTypes.removeFunds,
  TransactionTypes.newPosition,
  TransactionTypes.withdrawPosition,
  TransactionTypes.resetPosition,
  TransactionTypes.terminatePosition,
  TransactionTypes.transferPosition,
  TransactionTypes.withdrawFunds,
];

export const EARN_TYPE_EVENTS = [
  TransactionEventTypes.EARN_CREATED,
  TransactionEventTypes.EARN_INCREASE,
  TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW,
  TransactionEventTypes.EARN_WITHDRAW,
  TransactionEventTypes.EARN_SPECIAL_WITHDRAW,
];
