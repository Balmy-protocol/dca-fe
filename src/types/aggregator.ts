import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapOption = {
  id: string;
  sellToken: Token;
  buyToken: Token;
  sellAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: number;
  };
  buyAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: number;
  };
  maxSellAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: number;
  };
  minBuyAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: number;
  };
  gas: {
    estimatedGas: BigNumber;
    estimatedCost: BigNumber;
    estimatedCostInUnits: number;
    estimatedCostInUSD: number;
    gasTokenSymbol: string;
  };
  swapper: {
    allowanceTarget: string;
    name: string;
    logoURI: string;
    id: string;
  };
  type: string;
  tx?: QuoteTx;
};

export interface SwapOptionWithTx extends SwapOption {
  tx: QuoteTx;
}
