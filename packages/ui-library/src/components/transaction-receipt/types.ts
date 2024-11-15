import {
  Address,
  ERC20ApprovalDataDoneEvent,
  ERC20ApprovalEvent,
  ERC20TransferDataDoneEvent,
  ERC20TransferEvent,
  SwapDataDoneEvent,
  SwapEvent,
  EarnDepositDataDoneEvent,
  EarnDepositEvent,
  EarnIncreaseDataDoneEvent,
  EarnIncreaseEvent,
  EarnWithdrawDataDoneEvent,
  EarnWithdrawEvent,
  NativeTransferDataDoneEvent,
  NativeTransferEvent,
  DCAWithdrawDataDoneEvent,
  DCAWithdrawnEvent,
  DCATerminatedDataDoneEvent,
  DCATerminatedEvent,
  DCAModifiedDataDoneEvent,
  DCAModifiedEvent,
  DCACreatedDataDoneEvent,
  DCACreatedEvent,
  DCATransferDataDoneEvent,
  DCATransferEvent,
  DCAPermissionsModifiedDataDoneEvent,
  DCAPermissionsModifiedEvent,
  EarnClaimDelayedWithdrawEvent,
  EarnClaimDelayedWithdrawDataDoneEvent,
  EarnSpecialWithdrawDataDoneEvent,
  EarnSpecialWithdrawEvent,
} from 'common-types';

export type ERC20ApprovaDataReceipt = DistributiveOmit<ERC20ApprovalDataDoneEvent, 'owner' | 'spender'> & {
  owner: React.ReactNode;
  spender: React.ReactNode;
};
export type ERC20ApprovalReceipt = DistributiveOmit<ERC20ApprovalEvent, 'data'> & {
  data: ERC20ApprovaDataReceipt;
};

export type ERC20TransferDataReceipt = DistributiveOmit<ERC20TransferDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
  to: React.ReactNode;
};
export type ERC20TransferReceipt = DistributiveOmit<ERC20TransferEvent, 'data'> & {
  data: ERC20TransferDataReceipt;
};

export type SwapDataReceipt = DistributiveOmit<SwapDataDoneEvent, 'recipient' | 'from'> & {
  recipient?: React.ReactNode;
  from: React.ReactNode;
};
export type SwapReceipt = DistributiveOmit<SwapEvent, 'data'> & {
  data: SwapDataReceipt;
};

export type EarnDepositDataReceipt = DistributiveOmit<EarnDepositDataDoneEvent, 'user'> & {
  user?: React.ReactNode;
};
export type EarnDepositReceipt = DistributiveOmit<EarnDepositEvent, 'data'> & {
  data: EarnDepositDataReceipt;
};

export type EarnIncreaseDataReceipt = DistributiveOmit<EarnIncreaseDataDoneEvent, 'user'> & {
  user?: React.ReactNode;
};
export type EarnIncreaseReceipt = DistributiveOmit<EarnIncreaseEvent, 'data'> & {
  data: EarnIncreaseDataReceipt;
};

export type EarnWithdrawDataReceipt = DistributiveOmit<EarnWithdrawDataDoneEvent, 'user'> & {
  user?: React.ReactNode;
};
export type EarnWithdrawReceipt = DistributiveOmit<EarnWithdrawEvent, 'data'> & {
  data: EarnWithdrawDataReceipt;
};

export type EarnSpecialWithdrawDataReceipt = DistributiveOmit<EarnSpecialWithdrawDataDoneEvent, 'user'> & {
  user?: React.ReactNode;
};
export type EarnSpecialWithdrawReceipt = DistributiveOmit<EarnSpecialWithdrawEvent, 'data'> & {
  data: EarnSpecialWithdrawDataReceipt;
};

export type EarnClaimDelayedWithdrawDataReceipt = DistributiveOmit<EarnClaimDelayedWithdrawDataDoneEvent, 'user'> & {
  user?: React.ReactNode;
};
export type EarnClaimDelayedWithdrawReceipt = DistributiveOmit<EarnClaimDelayedWithdrawEvent, 'data'> & {
  data: EarnClaimDelayedWithdrawDataReceipt;
};

export type NativeTransferDataReceipt = DistributiveOmit<NativeTransferDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
  to: React.ReactNode;
};
export type NativeTransferReceipt = DistributiveOmit<NativeTransferEvent, 'data'> & {
  data: NativeTransferDataReceipt;
};

export type DCAWithdrawDataReceipt = DistributiveOmit<DCAWithdrawDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
  to: React.ReactNode;
};
export type DCAWithdrawReceipt = DistributiveOmit<DCAWithdrawnEvent, 'data'> & {
  data: DCAWithdrawDataReceipt;
};

export type DCATerminatedDataReceipt = DistributiveOmit<DCATerminatedDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
};
export type DCATerminatedReceipt = DistributiveOmit<DCATerminatedEvent, 'data'> & {
  data: DCATerminatedDataReceipt;
};

export type DCAModifyDataReceipt = DistributiveOmit<DCAModifiedDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
  to: React.ReactNode;
};
export type DCAModifyReceipt = DistributiveOmit<DCAModifiedEvent, 'data'> & {
  data: DCAModifyDataReceipt;
};

export type DCACreatedDataReceipt = DistributiveOmit<DCACreatedDataDoneEvent, 'from' | 'to' | 'owner'> & {
  from: React.ReactNode;
  owner: React.ReactNode;
};
export type DCACreatedReceipt = DistributiveOmit<DCACreatedEvent, 'data'> & {
  data: DCACreatedDataReceipt;
};

export type DCATransferDataReceipt = DistributiveOmit<DCATransferDataDoneEvent, 'from' | 'to'> & {
  from: React.ReactNode;
  to: React.ReactNode;
};
export type DCATransferReceipt = DistributiveOmit<DCATransferEvent, 'data'> & {
  data: DCATransferDataReceipt;
};

export type DCAPermissionsModifiedDataReceipt = DistributiveOmit<DCAPermissionsModifiedDataDoneEvent, 'permissions'> & {
  permissions: {
    permissions: DCAPermissionsModifiedDataDoneEvent['permissions'][Address]['permissions'];
    label: React.ReactNode;
  }[];
  to: React.ReactNode;
};
export type DCAPermissionsModifiedReceipt = DistributiveOmit<DCAPermissionsModifiedEvent, 'data'> & {
  data: DCAPermissionsModifiedDataReceipt;
};

export type DcaTransactionReceiptProp =
  | DCAWithdrawReceipt
  | DCAModifyReceipt
  | DCACreatedReceipt
  | DCAPermissionsModifiedReceipt
  | DCATransferReceipt
  | DCATerminatedReceipt;

export type TransactionReceiptProp =
  | ERC20ApprovalReceipt
  | ERC20TransferReceipt
  | SwapReceipt
  | EarnDepositReceipt
  | EarnIncreaseReceipt
  | EarnWithdrawReceipt
  | EarnSpecialWithdrawReceipt
  | EarnClaimDelayedWithdrawReceipt
  | NativeTransferReceipt
  | DcaTransactionReceiptProp;
