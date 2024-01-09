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
        owner: <Address address={tx.owner} showDetailsOnHover trimAddress trimSize={4} />,
        spender: <Address address={tx.spender} showDetailsOnHover trimAddress trimSize={4} />,
        status: TransactionStatus.DONE,
      } as TransactionReceiptProp;
    case TransactionEventTypes.NATIVE_TRANSFER:
    case TransactionEventTypes.ERC20_TRANSFER:
      return {
        ...tx,
        from: <Address address={tx.from} showDetailsOnHover trimAddress trimSize={4} />,
        to: <Address address={tx.to} showDetailsOnHover trimAddress trimSize={4} />,
        status: TransactionStatus.DONE,
      } as TransactionReceiptProp;
    default:
      return tx;
  }
};

export default parseTransactionEventToTransactionReceipt;
