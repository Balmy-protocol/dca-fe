import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapOption = {
  sellToken: Token;
  buyToken: Token;
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
    name: string;
    logoURI: string;
  };
  type: string;
  tx: TransactionRequest;
};
