import { Address, ChainId, Timestamp, TokenAddress } from '@types';

interface BaseEvent {
  chainId: ChainId;
  txHash: string;
  timestamp: Timestamp;
  spentInGas: string;
  nativePrice: number;
}

export enum TransactionEventTypes {
  ERC20_APPROVAL = 'ERC20 approval',
  ERC20_TRANSFER = 'ERC20 transfer',
}

interface ERC20ApprovalEvent extends BaseEvent {
  token: TokenAddress;
  owner: Address;
  spender: Address;
  amount: string;
  type: TransactionEventTypes.ERC20_APPROVAL;
}

interface ERC20TransferEvent extends BaseEvent {
  token: TokenAddress;
  from: Address;
  to: Address;
  amount: string;
  tokenPrice: number;
  type: TransactionEventTypes.ERC20_TRANSFER;
}

export type TransactionEvent = ERC20ApprovalEvent | ERC20TransferEvent;
