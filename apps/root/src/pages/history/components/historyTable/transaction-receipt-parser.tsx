import React from 'react';
import Address from '@common/components/address';
import { TransactionEvent, TransactionEventTypes } from 'common-types';
import { TransactionReceiptProp } from 'ui-library';

const parseTransactionEventToTransactionReceipt = (tx?: TransactionEvent): TransactionReceiptProp | undefined => {
  if (!tx) return undefined;
  switch (tx.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return {
        ...tx,
        owner: <Address address={tx.owner} showDetailsOnHover trimAddress trimSize={4} />,
        spender: <Address address={tx.spender} showDetailsOnHover trimAddress trimSize={4} />,
      };
    case TransactionEventTypes.ERC20_TRANSFER:
      return {
        ...tx,
        from: <Address address={tx.from} showDetailsOnHover trimAddress trimSize={4} />,
        to: <Address address={tx.to} showDetailsOnHover trimAddress trimSize={4} />,
      };
    case TransactionEventTypes.NATIVE_TRANSFER:
      return {
        ...tx,
        from: <Address address={tx.from} showDetailsOnHover trimAddress trimSize={4} />,
        to: <Address address={tx.to} showDetailsOnHover trimAddress trimSize={4} />,
      };
    default:
      throw new Error('Invalid transaction type');
  }
};

export default parseTransactionEventToTransactionReceipt;
