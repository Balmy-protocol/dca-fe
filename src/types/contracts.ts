/* eslint-disable max-classes-per-file */
import { BigNumber, BigNumberish, BytesLike } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { PairIndex } from 'utils/swap';

export type Oracles = 0 | 1 | 2;
export class ERC20Contract extends Contract {
  balanceOf: (address: string) => Promise<BigNumber>;

  deposit: (toDeposit: { value: string }) => Promise<TransactionResponse>;

  allowance: (address: string, contract: string) => Promise<string>;

  approve: (address: string, value: BigNumber) => Promise<TransactionResponse>;
}

interface SwapInfoPairData {
  intervalsInSwap: string;
  ratioAToB: BigNumber;
  ratioBToA: BigNumber;
  tokenA: string;
  tokenB: string;
}

interface SwapInforTokenData {
  platformFee: BigNumber;
  reward: BigNumber;
  toProvide: BigNumber;
  token: string;
}

export class OracleContract extends Contract {
  canSupportPair: (tokenA: string, tokenB: string) => Promise<boolean>;

  oracleInUse: (tokenA: string, tokenB: string) => Promise<0 | 1 | 2>;
}

export class TokenDescriptorContract extends Contract {
  tokenURI: (hubAddress: string, positionId: string) => Promise<string>;
}

export class BetaMigratorContract extends Contract {
  migrate: (
    _positionId: string,
    _signature: {
      permissions: { operator: string; permissions: number[] }[];
      deadline: BigNumber;
      v: BigNumberish;
      r: BytesLike;
      s: BytesLike;
    }
  ) => Promise<TransactionResponse>;
}

export class HubCompanionContract extends Contract {
  depositUsingProtocolToken: (
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    account: string,
    permissions: { operator: string; permissions: string[] }[],
    bytes: string[],
    overrides?: { value?: BigNumber }
  ) => Promise<TransactionResponse>;

  withdrawSwappedUsingProtocolToken: (id: string, recipient: string) => Promise<TransactionResponse>;

  terminateUsingProtocolTokenAsFrom: (
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string
  ) => Promise<TransactionResponse>;

  terminateUsingProtocolTokenAsTo: (
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string
  ) => Promise<TransactionResponse>;

  increasePositionUsingProtocolToken: (
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    overrides?: { value?: BigNumber }
  ) => Promise<TransactionResponse>;

  reducePositionUsingProtocolToken: (
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    recipient: string
  ) => Promise<TransactionResponse>;

  multicall: (data: string[], overrides?: { value?: BigNumber }) => Promise<TransactionResponse>;
}

export class PermissionManagerContract extends Contract {
  tokenURI: (positionId: string) => Promise<string>;

  transferFrom: (owner: string, toAddress: string, positionId: string) => Promise<TransactionResponse>;

  hasPermission: (positionId: string, address: string, permit: number) => Promise<boolean>;

  modify: (
    positionId: string,
    permissions: { operator: string; permissions: number[] }[]
  ) => Promise<TransactionResponse>;

  ownerOf: (positionId: string) => Promise<string>;

  nonces: (address: string) => Promise<number>;
}
export class HubContract extends Contract {
  getNextSwapInfo: (
    tokens: string[],
    pairIndexes: PairIndex[]
  ) => Promise<{ pairs: SwapInfoPairData[]; tokens: SwapInforTokenData[] }>;

  deposit: (
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    account: string,
    permissions: { operator: string; permissions: string[] }[]
  ) => Promise<TransactionResponse>;

  withdrawSwapped: (id: string, recipient: string) => Promise<TransactionResponse>;

  terminate: (id: string, recipientUnswapped: string, recipientSwapped: string) => Promise<TransactionResponse>;

  increasePosition: (id: string, newAmount: BigNumber, newSwaps: BigNumber) => Promise<TransactionResponse>;

  'deposit(address,address,uint256,uint32,uint32,address,(address,uint8[])[])': (
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    account: string,
    permissions: { operator: string; permissions: string[] }[]
  ) => Promise<TransactionResponse>;

  reducePosition: (
    id: string,
    newAmount: BigNumber,
    newSwaps: BigNumber,
    recipient: string
  ) => Promise<TransactionResponse>;
}
/* eslint-enable */
