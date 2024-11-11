import {
  TransactionEvent,
  TransactionEventTypes,
  EarnWithdrawEvent,
  WithdrawType,
  EarnSpecialWithdrawEvent,
} from '@types';

import parseTransactionEventToTransactionReceipt from '.';

const mergeWithdrawAndSpecialWithdraw = (txs: TransactionEvent[]) => {
  const withdrawEvent = txs.find((tx): tx is EarnWithdrawEvent => tx.type === TransactionEventTypes.EARN_WITHDRAW);
  const specialWithdrawEvent = txs.find(
    (tx): tx is EarnSpecialWithdrawEvent => tx.type === TransactionEventTypes.EARN_SPECIAL_WITHDRAW
  );

  if (!withdrawEvent || !specialWithdrawEvent) {
    return parseTransactionEventToTransactionReceipt(withdrawEvent || specialWithdrawEvent);
  }

  // A special withdraw is done over the asset, so we need to add it at the top of the withdraw list
  const withdrawnTokens = [
    ...specialWithdrawEvent.data.tokens.map((token) => ({
      ...token,
      withdrawType: WithdrawType.MARKET,
    })),
    ...withdrawEvent.data.withdrawn,
  ];

  const mergedEvent: TransactionEvent = {
    type: withdrawEvent.type,
    unit: withdrawEvent.unit,
    tx: withdrawEvent.tx,
    data: {
      ...withdrawEvent.data,
      withdrawn: withdrawnTokens,
    },
  };

  return parseTransactionEventToTransactionReceipt(mergedEvent);
};

const MergedWithdrawTransactionEventTypes = [
  TransactionEventTypes.EARN_WITHDRAW,
  TransactionEventTypes.EARN_SPECIAL_WITHDRAW,
];

const mergeMultipleReceipts = (txs: TransactionEvent[], mergeTransactionsWithSameHash?: boolean) => {
  if (txs.length === 0) return;
  if (txs.length === 1 || !mergeTransactionsWithSameHash) {
    return parseTransactionEventToTransactionReceipt(txs[0]);
  }

  const txTypes = txs.map((tx) => tx.type);

  switch (true) {
    case MergedWithdrawTransactionEventTypes.every((mergedWithdrawType) => txTypes.includes(mergedWithdrawType)):
      return mergeWithdrawAndSpecialWithdraw(txs);
    default:
      return;
  }
};

export default mergeMultipleReceipts;
