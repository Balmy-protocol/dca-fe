import { QuoteTx } from '@mean-finance/sdk/services/quotes/types';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapOption = {
  id: string;
  sellToken: Token;
  buyToken: Token;
  transferTo?: string | null;
  sellAmount: {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD: number;
  };
  buyAmount: {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD: number;
  };
  maxSellAmount: {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD: number;
  };
  minBuyAmount: {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD: number;
  };
  gas: {
    estimatedGas: BigNumber;
    estimatedCost: BigNumber;
    estimatedCostInUnits: string;
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
