import { DCAPermission, TokenVariant } from '@balmy/sdk';
import {
  Address,
  ChainId,
  Timestamp,
  TokenWithIcon,
  TokenAddress,
  NetworkStruct,
  AmountsOfToken,
  TransactionsHistoryResponse,
  IndexingData,
  StrategyId,
  SdkEarnPositionId,
  IndexerUnits,
} from '.';

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
  DCA_CREATED = 'DCA Deposited',
  DCA_PERMISSIONS_MODIFIED = 'DCA Modified Permissions',
  DCA_TRANSFER = 'DCA Transferred',
  DCA_TERMINATED = 'DCA Terminated',
  SWAP = 'Swap',
  EARN_CREATED = 'Earn Deposited',
  EARN_INCREASE = 'Earn Increased',
  EARN_WITHDRAW = 'Earn Withdrew',
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
  fromToken: {
    price?: number;
    token: { address: Address; variant: TokenVariant };
  };
  toToken: {
    price?: number;
    token: { address: Address; variant: TokenVariant };
  };
}

export interface DCAWithdrawnApiDataEvent extends BaseDcaApiDataEvent {
  withdrawn: string;
  withdrawnYield?: string;
}

export interface DCAWithdrawnApiEvent {
  data: DCAWithdrawnApiDataEvent;
  type: TransactionEventTypes.DCA_WITHDRAW;
}

export interface DCATerminatedApiDataEvent extends BaseDcaApiDataEvent {
  withdrawnRemaining: string;
  withdrawnSwapped: string;
}

export interface DCATerminatedApiEvent {
  data: DCATerminatedApiDataEvent;
  type: TransactionEventTypes.DCA_TERMINATED;
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

export interface DCACreatedApiDataEvent extends BaseDcaApiDataEvent {
  rate: string;
  swaps: number;
  owner: Address;
  permissions: Record<Address, DCAPermission[]>;
  swapInterval: number;
}

export interface DCACreatedApiEvent {
  data: DCACreatedApiDataEvent;
  type: TransactionEventTypes.DCA_CREATED;
}

export interface DCAPermissionsModifiedApiDataEvent extends BaseDcaApiDataEvent {
  permissions: Record<Address, DCAPermission[]>;
}

export interface DCAPermissionsModifiedApiEvent {
  data: DCAPermissionsModifiedApiDataEvent;
  type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED;
}

export interface DCATransferApiDataEvent extends BaseDcaApiDataEvent {
  from: Address;
  to: Address;
}

export interface DCATransferApiEvent {
  data: DCATransferApiDataEvent;
  type: TransactionEventTypes.DCA_TRANSFER;
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

export interface SwapApiDataEvent {
  type: 'buy' | 'sell';
  tokenIn: {
    amount: string;
    address: Address;
    price?: number;
  };
  tokenOut: {
    amount: string;
    address: Address;
    price?: number;
  };
  recipient: Address;
  swapContract: Address;
}
export interface SwapApiEvent {
  data: SwapApiDataEvent;
  type: TransactionEventTypes.SWAP;
}

export interface EarnDepositApiDataEvent {
  strategyId: StrategyId;
  positionId: SdkEarnPositionId;
  asset: {
    amount: string;
    address: Address;
    price?: number;
  };
}
export interface EarnDepositApiEvent {
  data: EarnDepositApiDataEvent;
  type: TransactionEventTypes.EARN_CREATED;
}

export interface EarnIncreaseApiDataEvent {
  strategyId: StrategyId;
  positionId: SdkEarnPositionId;
  asset: {
    amount: string;
    address: Address;
    price?: number;
  };
}
export interface EarnIncreaseApiEvent {
  data: EarnIncreaseApiDataEvent;
  type: TransactionEventTypes.EARN_INCREASE;
}

export interface EarnWithdrawApiDataEvent {
  strategyId: StrategyId;
  positionId: SdkEarnPositionId;
  withdrawn: {
    token: Address;
    amount: string;
    price?: number;
  }[];
  assetAddress: Address;
}
export interface EarnWithdrawApiEvent {
  data: EarnWithdrawApiDataEvent;
  type: TransactionEventTypes.EARN_WITHDRAW;
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

export type DcaTransactionApiDataEvent =
  | DCAWithdrawnApiEvent
  | DCAModifiedApiEvent
  | DCACreatedApiEvent
  | DCAPermissionsModifiedApiEvent
  | DCATransferApiEvent
  | DCATerminatedApiEvent;

export type TransactionApiDataEvent =
  | SwapApiEvent
  | EarnDepositApiEvent
  | EarnIncreaseApiEvent
  | EarnWithdrawApiEvent
  | ERC20ApprovalApiEvent
  | ERC20TransferApiEvent
  | NativeTransferApiEvent
  | DcaTransactionApiDataEvent;

export type TransactionApiEvent = BaseApiEvent & TransactionApiDataEvent;

export interface NetworkStructWithIcon extends DistributiveOmit<NetworkStruct, 'nativeCurrency' | 'mainCurrency'> {
  // Native token
  nativeCurrency: TokenWithIcon;
  // Token for network icon
  mainCurrency: TokenWithIcon;
}

export interface BaseTxEvent extends DistributiveOmit<BaseApiTxEvent, 'spentInGas'> {
  spentInGas: AmountsOfToken;
  network: NetworkStructWithIcon;
  explorerLink: string;
}

export interface BaseEvent {
  tx: BaseTxEvent;
}

export type BaseTransactionProps = 'spentInGas' | 'token' | 'amount';
export type DoneTransactionProps = 'spentInGas' | 'timestamp' | 'nativePrice' | 'status' | 'tokenPrice';

export type BaseDcaEventProps = 'hub' | 'positionId' | 'fromToken' | 'toToken';

export interface BaseDcaDataEvent {
  hub: string;
  positionId: number;
  fromToken: TokenWithIcon;
  toToken: TokenWithIcon;
}

export interface ERC20ApprovalDataDoneEvent
  extends DistributiveOmit<ERC20ApprovalApiDataEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface ERC20ApprovalDataPendingEvent
  extends DistributiveOmit<ERC20ApprovalDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type ERC20ApprovalDataEvent = ERC20ApprovalDataDoneEvent | ERC20ApprovalDataPendingEvent;

export type ERC20ApprovalEvent = BaseEvent & {
  data: ERC20ApprovalDataEvent;
  type: TransactionEventTypes.ERC20_APPROVAL;
  unit: IndexerUnits.ERC20_APPROVALS;
};

export interface ERC20TransferDataDoneEvent
  extends DistributiveOmit<ERC20TransferApiDataEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface ERC20TransferDataPendingEvent
  extends DistributiveOmit<ERC20TransferDataDoneEvent, DoneTransactionProps | 'tokenPrice'> {
  status: TransactionStatus.PENDING;
}

export type ERC20TransferDataEvent = ERC20TransferDataDoneEvent | ERC20TransferDataPendingEvent;

export type ERC20TransferEvent = BaseEvent & {
  data: ERC20TransferDataEvent;
  type: TransactionEventTypes.ERC20_TRANSFER;
  unit: IndexerUnits.ERC20_TRANSFERS;
};

export interface SwapDataDoneEvent extends DistributiveOmit<SwapApiDataEvent, 'tokenIn' | 'tokenOut'> {
  tokenIn: TokenWithIcon;
  amountIn: AmountsOfToken;
  tokenOut: TokenWithIcon;
  amountOut: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface SwapDataPendingEvent extends DistributiveOmit<SwapDataDoneEvent, DoneTransactionProps | 'tokenPrice'> {
  status: TransactionStatus.PENDING;
}

export type SwapDataEvent = SwapDataDoneEvent | SwapDataPendingEvent;

export type SwapEvent = BaseEvent & {
  data: SwapDataEvent;
  type: TransactionEventTypes.SWAP;
  unit: IndexerUnits.AGG_SWAPS;
};

export interface BaseEarnDataEvent {
  positionId: SdkEarnPositionId;
  strategyId: StrategyId;
  user: Address;
}

export interface EarnDepositDataDoneEvent
  extends BaseEarnDataEvent,
    DistributiveOmit<EarnDepositApiDataEvent, 'asset'> {
  asset: TokenWithIcon;
  assetAmount: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface EarnDepositDataPendingEvent
  extends DistributiveOmit<EarnDepositDataDoneEvent, DoneTransactionProps | 'tokenPrice'> {
  status: TransactionStatus.PENDING;
}

export type EarnDepositDataEvent = EarnDepositDataDoneEvent | EarnDepositDataPendingEvent;

export type EarnDepositEvent = BaseEvent & {
  data: EarnDepositDataEvent;
  type: TransactionEventTypes.EARN_CREATED;
};

export interface EarnIncreaseDataDoneEvent
  extends BaseEarnDataEvent,
    DistributiveOmit<EarnIncreaseApiDataEvent, 'asset'> {
  asset: TokenWithIcon;
  assetAmount: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface EarnIncreaseDataPendingEvent
  extends DistributiveOmit<EarnIncreaseDataDoneEvent, DoneTransactionProps | 'tokenPrice'> {
  status: TransactionStatus.PENDING;
}

export type EarnIncreaseDataEvent = EarnIncreaseDataDoneEvent | EarnIncreaseDataPendingEvent;

export type EarnIncreaseEvent = BaseEvent & {
  data: EarnIncreaseDataEvent;
  type: TransactionEventTypes.EARN_INCREASE;
};

export interface EarnWithdrawDataDoneEvent
  extends BaseEarnDataEvent,
    DistributiveOmit<EarnWithdrawApiDataEvent, 'withdrawn'> {
  withdrawn: { token: TokenWithIcon; amount: AmountsOfToken }[];
  assetAddress: Address;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface EarnWithdrawDataPendingEvent
  extends DistributiveOmit<EarnWithdrawDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type EarnWithdrawDataEvent = EarnWithdrawDataDoneEvent | EarnWithdrawDataPendingEvent;

export type EarnWithdrawEvent = BaseEvent & {
  data: EarnWithdrawDataEvent;
  type: TransactionEventTypes.EARN_WITHDRAW;
};

export interface NativeTransferDataDoneEvent
  extends DistributiveOmit<NativeTransferApiDataEvent, 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  status: TransactionStatus.DONE;
}

export interface NativeTransferDataPendingEvent
  extends DistributiveOmit<NativeTransferDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type NativeTransferDataEvent = NativeTransferDataDoneEvent | NativeTransferDataPendingEvent;

export type NativeTransferEvent = BaseEvent & {
  data: NativeTransferDataEvent;
  type: TransactionEventTypes.NATIVE_TRANSFER;
  unit: IndexerUnits.NATIVE_TRANSFERS;
};

export interface DCAWithdrawDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCAWithdrawnApiDataEvent, BaseDcaEventProps | 'withdrawn' | 'withdrawnYield'> {
  withdrawn: AmountsOfToken;
  withdrawnYield?: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes;
}

export interface DCAWithdrawnDataPendingEvent extends DistributiveOmit<DCAWithdrawDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCAWithdrawnDataEvent = DCAWithdrawDataDoneEvent | DCAWithdrawnDataPendingEvent;

export type DCAWithdrawnEvent = BaseEvent & {
  data: DCAWithdrawnDataEvent;
  type: TransactionEventTypes.DCA_WITHDRAW;
  unit: IndexerUnits.DCA;
};

export interface DCATerminatedDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCATerminatedApiDataEvent, BaseDcaEventProps | 'withdrawnRemaining' | 'withdrawnSwapped'> {
  withdrawnRemaining: AmountsOfToken;
  withdrawnSwapped: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes;
}

export interface DCATerminatedDataPendingEvent
  extends DistributiveOmit<DCATerminatedDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCATerminatedDataEvent = DCATerminatedDataDoneEvent | DCATerminatedDataPendingEvent;

export type DCATerminatedEvent = BaseEvent & {
  data: DCATerminatedDataEvent;
  type: TransactionEventTypes.DCA_TERMINATED;
  unit: IndexerUnits.DCA;
};

export interface DCAModifiedDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCAModifiedApiDataEvent, BaseDcaEventProps | 'rate' | 'oldRate'> {
  rate: AmountsOfToken;
  oldRate: AmountsOfToken;
  tokenFlow: TransactionEventIncomingTypes;
  difference: AmountsOfToken;
  remainingLiquidity: AmountsOfToken;
  oldRemainingLiquidity: AmountsOfToken;
  fromIsYield: boolean;
  status: TransactionStatus.DONE;
}

export interface DCAModifiedDataPendingEvent extends DistributiveOmit<DCAModifiedDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCAModifiedDataEvent = DCAModifiedDataDoneEvent | DCAModifiedDataPendingEvent;

export type DCAModifiedEvent = BaseEvent & {
  data: DCAModifiedDataEvent;
  type: TransactionEventTypes.DCA_MODIFIED;
  unit: IndexerUnits.DCA;
};

export interface DCACreatedDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCACreatedApiDataEvent, BaseDcaEventProps | 'rate'> {
  rate: AmountsOfToken;
  funds: AmountsOfToken;
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface DCACreatedDataPendingEvent extends DistributiveOmit<DCACreatedDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCACreatedDataEvent = DCACreatedDataDoneEvent | DCACreatedDataPendingEvent;

export type DCACreatedEvent = BaseEvent & {
  data: DCACreatedDataEvent;
  type: TransactionEventTypes.DCA_CREATED;
  unit: IndexerUnits.DCA;
};

export interface DCAPermissionsModifiedDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCAPermissionsModifiedApiDataEvent, BaseDcaEventProps | 'permissions'> {
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
  permissions: Record<Address, { permissions: DCAPermission[]; label: string }>;
}

export interface DCAPermissionsModifiedDataPendingEvent
  extends DistributiveOmit<DCAPermissionsModifiedDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCAPermissionsModifiedDataEvent =
  | DCAPermissionsModifiedDataDoneEvent
  | DCAPermissionsModifiedDataPendingEvent;

export type DCAPermissionsModifiedEvent = BaseEvent & {
  data: DCAPermissionsModifiedDataEvent;
  type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED;
  unit: IndexerUnits.DCA;
};

export interface DCATransferDataDoneEvent
  extends BaseDcaDataEvent,
    DistributiveOmit<DCATransferApiDataEvent, BaseDcaEventProps> {
  status: TransactionStatus.DONE;
  tokenFlow: TransactionEventIncomingTypes.INCOMING;
}

export interface DCATransferDataPendingEvent extends DistributiveOmit<DCATransferDataDoneEvent, DoneTransactionProps> {
  status: TransactionStatus.PENDING;
}

export type DCATransferDataEvent = DCATransferDataDoneEvent | DCATransferDataPendingEvent;

export type DCATransferEvent = BaseEvent & {
  data: DCATransferDataEvent;
  type: TransactionEventTypes.DCA_TRANSFER;
  unit: IndexerUnits.DCA;
};

export type DcaTransactionEvent =
  | DCAWithdrawnEvent
  | DCAModifiedEvent
  | DCACreatedEvent
  | DCAPermissionsModifiedEvent
  | DCATransferEvent
  | DCATerminatedEvent;
export type EarnTransactionEvent = EarnDepositEvent | EarnIncreaseEvent | EarnWithdrawEvent;
export type TransactionEvent =
  | ERC20ApprovalEvent
  | ERC20TransferEvent
  | NativeTransferEvent
  | SwapEvent
  | DcaTransactionEvent
  | EarnTransactionEvent;

export interface TransactionsHistory extends Omit<TransactionsHistoryResponse, 'indexed' | 'pagination'> {
  indexing: Record<Address, Record<IndexerUnits, Record<ChainId, IndexingData>>>;
}
