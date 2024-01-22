import React from 'react';
import Address from '@common/components/address';
import { TransactionEvent, TransactionEventTypes, TransactionStatus } from 'common-types';
import { TransactionReceiptProp } from 'ui-library';

const parseTransactionEventToTransactionReceipt = (tx?: TransactionEvent): TransactionReceiptProp | undefined => {
  if (!tx) return undefined;

  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return {
        ...tx,
        data: {
          ...tx.data,
          owner: <Address address={tx.data.owner} showDetailsOnHover trimAddress trimSize={4} />,
          spender: <Address address={tx.data.spender} showDetailsOnHover trimAddress trimSize={4} />,
          status: TransactionStatus.DONE,
        },
      } as TransactionReceiptProp;
    case TransactionEventTypes.NATIVE_TRANSFER:
    case TransactionEventTypes.ERC20_TRANSFER:
      return {
        ...tx,
        data: {
          ...tx.data,
          from: <Address address={tx.data.from} showDetailsOnHover trimAddress trimSize={4} />,
          to: <Address address={tx.data.to} showDetailsOnHover trimAddress trimSize={4} />,
          status: TransactionStatus.DONE,
        },
      } as TransactionReceiptProp;
    default:
      return tx;
  }
};

export default parseTransactionEventToTransactionReceipt;
