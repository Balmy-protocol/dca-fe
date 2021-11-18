/* eslint-disable max-classes-per-file */
import { BigNumber } from 'ethers';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { PairIndex } from 'utils/swap';

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

export class HubContract extends Contract {
  getNextSwapInfo: (
    tokens: string[],
    pairIndexes: PairIndex[]
  ) => Promise<{ pairs: SwapInfoPairData[]; tokens: SwapInforTokenData[] }>;

  createPair: (tokenA: string, tokenB: string) => Promise<TransactionResponse>;
}

export class PairContract extends Contract {
  tokenURI: (dcaId: string) => Promise<string>;

  withdrawSwapped: (dcaId: string) => Promise<TransactionResponse>;

  terminate: (dcaId: string) => Promise<TransactionResponse>;

  modifyRateAndSwaps: (dcaId: string, newRate: BigNumber, newSwaps: BigNumber) => Promise<TransactionResponse>;

  deposit: (
    from: string,
    rate: BigNumber,
    amountOfSwaps: BigNumber,
    swapInterval: BigNumber
  ) => Promise<TransactionResponse>;
}
/* eslint-enable */
