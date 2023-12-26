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
  tokenPrice: number;
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

export interface ERC20ApprovalEvent extends BaseEvent, Omit<ERC20ApprovalApiEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
}

export interface ERC20TransferEvent extends BaseEvent, Omit<ERC20TransferApiEvent, 'token' | 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
}

export interface NativeTransferEvent extends BaseEvent, Omit<NativeTransferApiEvent, 'amount' | 'spentInGas'> {
  token: TokenWithIcon;
  amount: AmountsOfToken;
}

export type TransactionEvent = ERC20ApprovalEvent | ERC20TransferEvent | NativeTransferEvent;
