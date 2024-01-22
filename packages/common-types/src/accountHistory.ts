import { AmountsOfToken, TokenVariant } from '@mean-finance/sdk';
import { Address, ChainId, Timestamp, TokenWithIcon, TokenAddress, NetworkStruct } from '.';

export interface BaseApiTxEvent {
  chainId: ChainId;
  txHash: Address;
  timestamp: Timestamp;
  spentInGas: string;
  nativePrice: number;
  initiatedBy: Address;
}

export interface BaseApiEvent {
  tx: BaseApiTxEvent;
}

export enum TransactionEventTypes {
  ERC20_APPROVAL = 'ERC20 approval',
  ERC20_TRANSFER = 'ERC20 transfer',
  NATIVE_TRANSFER = 'Native transfer',
  DCA_WITHDRAW = 'DCA Withdrew',
  DCA_MODIFIED = 'DCA Modified',
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

export interface BaseDcaApiDataEvent {
  hub: string;
  positionId: string;
  tokenFrom: {
    price?: number;
    variant: TokenVariant;
  };
  tokenTo: {
    price?: number;
    variant: TokenVariant;
  };
}

export interface DCAWithdrawnApiDataEvent extends BaseDcaApiDataEvent {
  withdrawn: string;
  withdrawnYield: string;
}

export interface DCAWithdrawnApiEvent {
  data: DCAWithdrawnApiDataEvent;
  type: TransactionEventTypes.DCA_WITHDRAW;
}

export interface DCAModifiedApiDataEvent extends BaseDcaApiDataEvent {
  rate: string;
  oldRate: string;
  remainingSwaps: number;
  oldRemainingSwaps: number;
}

export interface DCAModifiedApiEvent {
  data: DCAModifiedApiDataEvent;
  type: TransactionEventTypes.DCA_MODIFIED;
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

export type DcaTransactionApiDataEvent = DCAWithdrawnApiEvent | DCAModifiedApiEvent;

export type TransactionApiDataEvent =
  | ERC20ApprovalApiEvent
  | ERC20TransferApiEvent
  | NativeTransferApiEvent
  | DcaTransactionApiDataEvent;

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

export type BaseTransactionProps = 'spentInGas' | 'token' | 'amount';
export type DoneTransactionProps = 'spentInGas' | 'timestamp' | 'nativePrice' | 'status' | 'tokenPrice';

export type BaseDcaEventProps = 'hub' | 'positionId' | 'tokenFrom' | 'tokenTo';

export interface BaseDcaDataEvent {
  hub: string;
  positionId: number;
  tokenFrom: TokenWithIcon;
  tokenTo: TokenWithIcon;
}

export interface ERC20ApprovalDataDoneEvent extends Omit<ERC20ApprovalApiDataEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
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

export interface DCAWithdrawDataDoneEvent
  extends BaseDcaDataEvent,
    Omit<DCAWithdrawnApiDataEvent, BaseDcaEventProps | 'withdrawn' | 'withdrawnYield'> {
  withdrawn: AmountsOfToken;
  withdrawnYield: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes;
}

export interface DCAWithdrawnDataPendingEvent extends Omit<DCAWithdrawDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCAWithdrawnDataEvent = DCAWithdrawDataDoneEvent | DCAWithdrawnDataPendingEvent;

export type DCAWithdrawnEvent = BaseEvent & {
  data: DCAWithdrawnDataEvent;
  type: TransactionEventTypes.DCA_WITHDRAW;
};

export interface DCAModifiedDataDoneEvent
  extends BaseDcaDataEvent,
    Omit<DCAModifiedApiDataEvent, BaseDcaEventProps | 'rate' | 'oldRate'> {
  rate: AmountsOfToken;
  oldRate: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  difference: AmountsOfToken;
  status: TransactionStatus.DONE;
}

export interface DCAModifiedDataPendingEvent extends Omit<DCAModifiedDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCAModifiedDataEvent = DCAModifiedDataDoneEvent | DCAModifiedDataPendingEvent;

export type DCAModifiedEvent = BaseEvent & {
  data: DCAModifiedDataEvent;
  type: TransactionEventTypes.DCA_MODIFIED;
};

export type DcaTransactionEvent = DCAWithdrawnEvent | DCAModifiedEvent;
export type TransactionEvent =
  | ERC20ApprovalEvent
  | ERC20TransferEvent
  | NativeTransferEvent
  | DCAWithdrawnEvent
  | DCAModifiedEvent;
