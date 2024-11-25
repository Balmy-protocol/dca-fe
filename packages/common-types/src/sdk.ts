import { QuoteResponse } from '@balmy/sdk';
import { AmountsOfToken } from '.';

export interface MappedQuoteResponse
  extends DistributiveOmit<QuoteResponse, 'gas' | 'sellAmount' | 'buyAmount' | 'maxSellAmount' | 'minBuyAmount'> {
  sellAmount: AmountsOfToken;
  buyAmount: AmountsOfToken;
  maxSellAmount: AmountsOfToken;
  minBuyAmount: AmountsOfToken;
  gas: {
    estimatedGas: AmountsOfToken;
    estimatedCost: AmountsOfToken;
    estimatedCostInUnits: string;
    gasTokenSymbol: string;
    estimatedCostInUSD?: string;
  };
}
