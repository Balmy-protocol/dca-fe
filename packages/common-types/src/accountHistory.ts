import { AmountsOfToken } from '@mean-finance/sdk';
import { Address, ChainId, Timestamp, TokenWithIcon, TokenAddress, NetworkStruct } from '.';

export interface BaseApiTxEvent {
  chainId: ChainId;
  txHash: Address;
  timestamp: Timestamp;
  spentInGas: string;
  nativePrice: number;
  initiatedBy: Address;
}

export enum TransactionEventTypes {
  ERC20_APPROVAL = 'ERC20 approval',
  ERC20_TRANSFER = 'ERC20 transfer',
  NATIVE_TRANSFER = 'Native transfer',
}

export enum TransactionStatus {
  DONE = 'done',
  PENDING = 'pending',
}

export enum TransactionEventIncomingTypes {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  SAME_ACCOUNTS = 'same accounts',
}

export interface ERC20ApprovalApiDataEvent {
  token: TokenAddress;
  owner: Address;
  spender: Address;
  amount: string;
}
export interface ERC20ApprovalApiEvent {
  data: ERC20ApprovalApiDataEvent;
  type: TransactionEventTypes.ERC20_APPROVAL;
}

export interface ERC20TransferApiDataEvent {
  token: TokenAddress;
  from: Address;
  to: Address;
  amount: string;
  tokenPrice: number | null;
}
export interface ERC20TransferApiEvent {
  data: ERC20TransferApiDataEvent;
  type: TransactionEventTypes.ERC20_TRANSFER;
}

export interface NativeTransferApiDataEvent {
  from: Address;
  to: Address;
  amount: string;
}
export interface NativeTransferApiEvent {
  data: NativeTransferApiDataEvent;
  type: TransactionEventTypes.NATIVE_TRANSFER;
}

export interface BaseApiEvent {
  tx: BaseApiTxEvent;
}

export type TransactionApiDataEvent = ERC20ApprovalApiEvent | ERC20TransferApiEvent | NativeTransferApiEvent;

export type TransactionApiEvent = BaseApiEvent & TransactionApiDataEvent;

export interface NetworkStructWithIcon extends Omit<NetworkStruct, 'nativeCurrency' | 'mainCurrency'> {
  // Native token
  nativeCurrency: TokenWithIcon;
  // Token for network icon
  mainCurrency: TokenWithIcon;
}

export interface BaseTxEvent extends Omit<BaseApiTxEvent, 'spentInGas'> {
  spentInGas: AmountsOfToken;
  network: NetworkStructWithIcon;
  explorerLink: string;
}

export interface BaseEvent {
  tx: BaseTxEvent;
}

export type DoneTransactionProps = 'status';

export interface ERC20ApprovalDataDoneEvent extends Omit<ERC20ApprovalApiDataEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  status: TransactionStatus.DONE;
}

export interface ERC20ApprovalDataPendingEvent extends Omit<ERC20ApprovalDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type ERC20ApprovalDataEvent = ERC20ApprovalDataDoneEvent | ERC20ApprovalDataPendingEvent;

export type ERC20ApprovalEvent = BaseEvent & {
  data: ERC20ApprovalDataEvent;
  type: TransactionEventTypes.ERC20_APPROVAL;
};

export interface ERC20TransferDataDoneEvent extends Omit<ERC20TransferApiDataEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface ERC20TransferDataPendingEvent
  extends Omit<ERC20TransferDataDoneEvent, DoneTransactionProps | 'tokenPrice'> {
  status: TransactionStatus.PENDING;
}

export type ERC20TransferDataEvent = ERC20TransferDataDoneEvent | ERC20TransferDataPendingEvent;

export type ERC20TransferEvent = BaseEvent & {
  data: ERC20TransferDataEvent;
  type: TransactionEventTypes.ERC20_TRANSFER;
};

export interface NativeTransferDataDoneEvent extends Omit<NativeTransferApiDataEvent, 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface NativeTransferDataPendingEvent extends Omit<NativeTransferDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type NativeTransferDataEvent = NativeTransferDataDoneEvent | NativeTransferDataPendingEvent;

export type NativeTransferEvent = BaseEvent & {
  data: NativeTransferDataEvent;
  type: TransactionEventTypes.NATIVE_TRANSFER;
};

export type TransactionEvent = ERC20ApprovalEvent | ERC20TransferEvent | NativeTransferEvent;
