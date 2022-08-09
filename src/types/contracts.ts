/* eslint-disable max-classes-per-file */
import { BigNumber, BigNumberish, BytesLike } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { CoreTypechained } from '@mean-finance/typechained/lib';

export interface PermissionSet {
  operator: string;
  permissions: number[];
}
export interface PermissionPermit {
  permissions: PermissionSet[];
  tokenId: string;
  deadline: string;
  v: number | string;
  r: string;
  s: string;
}

export type Oracles = 0 | 1 | 2;
export class ERC20Contract extends Contract {
  balanceOf: (address: string) => Promise<BigNumber>;

  deposit: (toDeposit: { value: string }) => Promise<TransactionResponse>;

  allowance: (address: string, contract: string) => Promise<string>;

  approve: (address: string, value: BigNumber) => Promise<TransactionResponse>;
}

export class OracleContract extends Contract {
  canSupportPair: (tokenA: string, tokenB: string) => Promise<boolean>;

  oracleInUse: (tokenA: string, tokenB: string) => Promise<0 | 1 | 2>;

  quote: (tokenIn: string, amountIn: BigNumber, tokenOut: string) => Promise<BigNumber>;
}

export class TokenDescriptorContract extends Contract {
  tokenURI: (hubAddress: string, positionId: string) => Promise<string>;
}

export class BetaMigratorContract extends Contract {
  migrate: (
    _sourceHub: string,
    _positionId: string,
    _signature: {
      permissions: { operator: string; permissions: number[] }[];
      deadline: BigNumber;
      v: BigNumberish;
      r: BytesLike;
      s: BytesLike;
    },
    targetHub: string
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

export interface HubContract extends CoreTypechained.DCAHub {
  deposit: (
    from: string,
    to: string,
    totalAmmount: BigNumber,
    swaps: BigNumber,
    interval: BigNumber,
    account: string,
    permissions: { operator: string; permissions: string[] }[]
  ) => Promise<TransactionResponse>;

  estimateGas: CoreTypechained.DCAHub['estimateGas'] & {
    deposit: (
      from: string,
      to: string,
      totalAmmount: BigNumber,
      swaps: BigNumber,
      interval: BigNumber,
      account: string,
      permissions: { operator: string; permissions: string[] }[]
    ) => Promise<BigNumber>;
  };
}

export class OEGasOracle extends Contract {
  getL1Fee: (data: string) => Promise<BigNumber>;
}
/* eslint-enable */
