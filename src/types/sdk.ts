import { AmountsOfToken, QuoteResponse } from '@mean-finance/sdk';
import { BigNumber } from 'ethers';

interface MappedAmountsOfToken extends Omit<AmountsOfToken, 'amount'> {
  amount: BigNumber;
}

type MappedAmountOfToken = BigNumber;

export interface MappedQuoteResponse
  extends Omit<QuoteResponse, 'gas' | 'sellAmount' | 'buyAmount' | 'maxSellAmount' | 'minBuyAmount'> {
  sellAmount: MappedAmountsOfToken;
  buyAmount: MappedAmountsOfToken;
  maxSellAmount: MappedAmountsOfToken;
  minBuyAmount: MappedAmountsOfToken;
  gas: {
    estimatedGas: MappedAmountOfToken;
    estimatedCost: MappedAmountOfToken;
    estimatedCostInUnits: string;
    gasTokenSymbol: string;
    estimatedCostInUSD?: string;
  };
}
