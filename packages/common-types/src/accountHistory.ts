import { AmountsOfToken } from '@mean-finance/sdk';
import { Address, ChainId, Timestamp, TokenWithIcon, TokenAddress, NetworkStruct } from '.';

interface BaseApiEvent {
  chainId: ChainId;
  txHash: Address;
  timestamp: Timestamp;
  spentInGas: string;
  nativePrice: number;
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

interface ERC20ApprovalApiEvent extends BaseApiEvent {
  token: TokenAddress;
  owner: Address;
  spender: Address;
  amount: string;
  type: TransactionEventTypes.ERC20_APPROVAL;
}

interface ERC20TransferApiEvent extends BaseApiEvent {
  token: TokenAddress;
  from: Address;
  to: Address;
  amount: string;
  tokenPrice: number | null;
  type: TransactionEventTypes.ERC20_TRANSFER;
}

interface NativeTransferApiEvent extends BaseApiEvent {
  from: Address;
  to: Address;
  amount: string;
  type: TransactionEventTypes.NATIVE_TRANSFER;
}

export type TransactionApiEvent = ERC20ApprovalApiEvent | ERC20TransferApiEvent | NativeTransferApiEvent;

interface NetworkStructWithIcon extends Omit<NetworkStruct, 'nativeCurrency' | 'mainCurrency'> {
  // Native token
  nativeCurrency: TokenWithIcon;
  // Token for network icon
  mainCurrency: TokenWithIcon;
}

interface BaseEvent extends Omit<BaseApiEvent, 'spentInGas'> {
  spentInGas: AmountsOfToken;
  network: NetworkStructWithIcon;
  explorerLink: string;
}

type DoneTransactionProps = 'spentInGas' | 'timestamp' | 'nativePrice' | 'status' | 'tokenPrice';

export interface ERC20ApprovalDoneEvent
  extends BaseEvent,
    Omit<ERC20ApprovalApiEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  status: TransactionStatus.DONE;
}
export interface ERC20ApprovalPendingEvent extends Omit<ERC20ApprovalDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type ERC20ApprovalEvent = ERC20ApprovalDoneEvent | ERC20ApprovalPendingEvent;

export interface ERC20TransferDoneEvent
  extends BaseEvent,
    Omit<ERC20TransferApiEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface ERC20TransferPendingEvent extends Omit<ERC20TransferDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type ERC20TransferEvent = ERC20TransferDoneEvent | ERC20TransferPendingEvent;

export interface NativeTransferDoneEvent extends BaseEvent, Omit<NativeTransferApiEvent, 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface NativeTransferPendingEvent extends Omit<ERC20TransferDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type NativeTransferEvent = NativeTransferDoneEvent | NativeTransferPendingEvent;

export type TransactionEvent = ERC20ApprovalEvent | ERC20TransferEvent | NativeTransferEvent;
