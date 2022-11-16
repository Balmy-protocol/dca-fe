import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export type SwapOption = {
  sellAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: string;
  };
  buyAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: string;
  };
  maxSellAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: string;
  };
  minBuyAmount: {
    amount: BigNumber;
    amountInUnits: number;
    amountInUSD: string;
  };
  gas: {
    estimatedGas: BigNumber;
    estimatedCost: BigNumber;
    estimatedCostInUnits: string;
    estimatedCostInUSD: string;
    gasTokenSymbol: string;
  };
  swapper: {
    allowanceTarget: string;
    address: string;
    id: string;
    logoURI: string;
  };
  type: string;
  tx: TransactionRequest;
};
