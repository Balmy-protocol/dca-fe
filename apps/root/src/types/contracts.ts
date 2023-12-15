/* eslint-disable max-classes-per-file */
import { Transaction, Contract, Address, TransactionRequest } from 'viem';
import { DCAHub } from '@mean-finance/dca-v2-core/dist';

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
export class MulticallContract extends Contract {
  aggregate3: (
    calls: { target: string; callData: string; allowFailure: boolean }[]
  ) => Promise<{ success: boolean; returnData: string }[]>;

  declare callStatic: {
    aggregate3: (
      calls: { target: string; callData: string; allowFailure: boolean }[]
    ) => Promise<{ success: boolean; returnData: string }[]>;
  };
}

export class EulerClaimContract extends Contract {
  migrate: (amount: bigint, acceptanceToken: Address) => Promise<Transaction>;
}

export class ERC20Contract extends Contract {
  balanceOf: (address: string) => Promise<bigint>;

  name: () => Promise<string>;

  decimals: () => Promise<number>;

  symbol: () => Promise<string>;

  transfer: (recipient: string, amount: bigint) => Promise<Transaction>;

  allowance: (address: string, contract: string) => Promise<bigint>;

  approve: (address: string, value: bigint) => Promise<Transaction>;
}

export class ERC721Contract extends Contract {
  balanceOf: (address: string) => Promise<bigint>;

  name: () => Promise<string>;

  symbol: () => Promise<string>;

  ownerOf: (tokenId: bigint) => Promise<string>;

  transferFrom: (from: string, to: string, tokenId: bigint) => Promise<Transaction>;

  approve: (approved: string, tokenId: bigint) => Promise<Transaction>;

  getApproved: (tokenId: bigint) => Promise<string>;

  setApprovalForAll: (operator: string, approved: boolean) => Promise<Transaction>;

  isApprovedForAll: (owner: string, operator: string) => Promise<boolean>;
}

export class Permit2Contract extends Contract {
  nonceBitmap: (address: string) => Promise<bigint>;
}

export class MeanPermit2Contract extends Contract {
  sellOrderSwapWithGasMeasurement: (
    params: {
      // Deadline
      deadline: number;
      // Take from caller
      tokenIn: string;
      amountIn: bigint;
      nonce?: bigint;
      signature?: string;
      // Swapp approval
      allowanceTarget: string;
      // Swap execution
      swapper: string;
      swapData: string;
      // Swap validation
      tokenOut: string;
      minAmountOut: bigint;
      // Transfer token out
      transferOut: { recipient: string; shareBps: number }[];
    },
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;

  sellOrderSwap: (
    params: {
      // Deadline
      deadline: number;
      // Take from caller
      tokenIn: string;
      amountIn: bigint;
      nonce?: bigint;
      signature?: string;
      // Swapp approval
      allowanceTarget: string;
      // Swap execution
      swapper: string;
      swapData: string;
      // Swap validation
      tokenOut: string;
      minAmountOut: bigint;
      // Transfer token out
      transferOut: { recipient: string; shareBps: number }[];
    },
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;

  declare callStatic: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sellOrderSwapWithGasMeasurement: (
      params: {
        // Deadline
        deadline: number;
        // Take from caller
        tokenIn: string;
        amountIn: bigint;
        nonce?: bigint;
        signature?: string;
        // Swapp approval
        allowanceTarget: string;
        // Swap execution
        swapper: string;
        swapData: string;
        // Swap validation
        tokenOut: string;
        minAmountOut: bigint;
        // Transfer token out
        transferOut: { recipient: string; shareBps: number }[];
      },
      overrides?: { value?: bigint }
    ) => Promise<[bigint, bigint, bigint]>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buyOrderSwapWithGasMeasurement: (
      params: {
        // Deadline
        deadline: number;
        // Take from caller
        tokenIn: string;
        maxAmountIn: bigint;
        nonce?: bigint;
        signature?: string;
        // Swapp approval
        allowanceTarget: string;
        // Swap execution
        swapper: string;
        swapData: string;
        // Swap validation
        tokenOut: string;
        amountOut: bigint;
        // Transfer token out
        transferOut: { recipient: string; shareBps: number }[];
        // Who to send the unspent tokenIn
        unspentTokenInRecipient: string;
      },
      overrides?: { value?: bigint }
    ) => Promise<[bigint, bigint, bigint]>;
  };

  buyOrderSwapWithGasMeasurement: (
    params: {
      // Deadline
      deadline: number;
      // Take from caller
      tokenIn: string;
      maxAmountIn: bigint;
      nonce?: bigint;
      signature?: string;
      // Swapp approval
      allowanceTarget: string;
      // Swap execution
      swapper: string;
      swapData: string;
      // Swap validation
      tokenOut: string;
      amountOut: bigint;
      // Transfer token out
      transferOut: { recipient: string; shareBps: number }[];
      // Who to send the unspent tokenIn
      unspentTokenInRecipient: string;
    },
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;

  buyOrderSwap: (
    params: {
      // Deadline
      deadline: number;
      // Take from caller
      tokenIn: string;
      maxAmountIn: bigint;
      nonce?: bigint;
      signature?: string;
      // Swapp approval
      allowanceTarget: string;
      // Swap execution
      swapper: string;
      swapData: string;
      // Swap validation
      tokenOut: string;
      amountOut: bigint;
      // Transfer token out
      transferOut: { recipient: string; shareBps: number }[];
      // Who to send the unspent tokenIn
      unspentTokenInRecipient: string;
    },
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;
}

export class SmolDomainContract extends Contract {
  getFirstDefaultDomain: (address: string) => Promise<string>;
}

export class OracleContract extends Contract {
  canSupportPair: (tokenA: string, tokenB: string) => Promise<boolean>;

  oracleInUse: (tokenA: string, tokenB: string) => Promise<0 | 1 | 2>;

  quote: (tokenIn: string, amountIn: bigint, tokenOut: string) => Promise<bigint>;
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
      deadline: bigint;
      v: bigint;
      r: Address;
      s: Address;
    },
    targetHub: string
  ) => Promise<Transaction>;
}

export class HubCompanionContract extends Contract {
  depositUsingProtocolToken: (
    from: string,
    to: string,
    totalAmmount: bigint,
    swaps: bigint,
    interval: bigint,
    account: string,
    permissions: { operator: string; permissions: string[] }[],
    bytes: string[],
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;

  withdrawSwappedUsingOtherToken: (id: string, recipient: string) => Promise<Transaction>;

  terminateUsingProtocolTokenAsFrom: (
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string
  ) => Promise<Transaction>;

  terminateUsingProtocolTokenAsTo: (
    id: string,
    recipientUnswapped: string,
    recipientSwapped: string
  ) => Promise<Transaction>;

  increasePositionUsingProtocolToken: (
    id: string,
    newAmount: bigint,
    newSwaps: bigint,
    overrides?: { value?: bigint }
  ) => Promise<Transaction>;

  reducePositionUsingProtocolToken: (
    id: string,
    newAmount: bigint,
    newSwaps: bigint,
    recipient: string
  ) => Promise<Transaction>;

  multicall: (data: string[], overrides?: { value?: bigint }) => Promise<Transaction>;
}

export class PermissionManagerContract extends Contract {
  tokenURI: (positionId: string) => Promise<string>;

  transferFrom: (owner: string, toAddress: string, positionId: string) => Promise<Transaction>;

  hasPermission: (positionId: string, address: string, permit: number) => Promise<boolean>;

  modify: (positionId: string, permissions: { operator: string; permissions: number[] }[]) => Promise<Transaction>;

  ownerOf: (positionId: string) => Promise<string>;

  nonces: (address: string) => Promise<number>;
}

export interface HubContract extends DCAHub {
  deposit: (
    from: string,
    to: string,
    totalAmmount: bigint,
    swaps: bigint,
    interval: bigint,
    account: string,
    permissions: { operator: string; permissions: number[] }[]
  ) => Promise<Transaction>;

  estimateGas: DCAHub['estimateGas'] & {
    deposit: (
      from: string,
      to: string,
      totalAmmount: bigint,
      swaps: bigint,
      interval: bigint,
      account: string,
      permissions: { operator: string; permissions: number[] }[]
    ) => Promise<bigint>;
  };

  populateTransaction: DCAHub['populateTransaction'] & {
    deposit: (
      from: string,
      to: string,
      totalAmmount: bigint,
      swaps: bigint,
      interval: bigint,
      account: string,
      permissions: { operator: string; permissions: number[] }[]
    ) => Promise<TransactionRequest>;
  };
}

export class OEGasOracle extends Contract {
  getL1Fee: (data: string) => Promise<bigint>;

  getL1GasUsed: (data: string) => Promise<bigint>;
}
/* eslint-enable */
