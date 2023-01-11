import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapOption = {
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
    address: string;
    name: string;
    logoURI: string;
  };
  type: string;
  tx: TransactionRequest;
};
