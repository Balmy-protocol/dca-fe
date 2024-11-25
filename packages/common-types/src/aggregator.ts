import { QuoteResponse, QuoteTransaction } from '@balmy/sdk';

import { Token } from './tokens';
import { Address } from 'viem';

export type SwapOption = {
  id: string;
  sellToken: QuoteResponse['sellToken'] & Token;
  buyToken: QuoteResponse['buyToken'] & Token;
  transferTo?: Address | null;
  chainId: number;
  sellAmount: DistributiveOmit<QuoteResponse['sellAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: bigint;
    amountInUnits: string;
    amountInUSD?: number;
  };
  buyAmount: DistributiveOmit<QuoteResponse['buyAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: bigint;
    amountInUnits: string;
    amountInUSD?: number;
  };
  maxSellAmount: DistributiveOmit<QuoteResponse['maxSellAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: bigint;
    amountInUnits: string;
    amountInUSD?: number;
  };
  minBuyAmount: DistributiveOmit<QuoteResponse['minBuyAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: bigint;
    amountInUnits: string;
    amountInUSD?: number;
  };
  gas?: DistributiveOmit<
    QuoteResponse['gas'],
    | 'estimatedGas'
    | 'estimatedCost'
    | 'estimatedCostInUnits'
    | 'estimatedCostInUSD'
    | 'gasTokenSymbol'
    | 'gasTokenPrice'
  > & {
    estimatedGas: bigint;
    estimatedCost: bigint;
    estimatedCostInUnits: string;
    estimatedCostInUSD?: number;
    gasTokenSymbol: string;
    gasTokenPrice?: number;
  };
  swapper: QuoteResponse['source'] & {
    allowanceTarget: string;
    name: string;
    logoURI: string;
    id: string;
  };
  type: 'buy' | 'sell';
  tx?: QuoteTransaction;
  customData: QuoteResponse['customData'];
};

export interface SwapOptionWithFailure extends SwapOption {
  willFail?: boolean;
}

export interface SwapOptionWithTx extends SwapOption {
  tx: QuoteTransaction;
}

export enum QuoteErrors {
  TIMEOUT = 'Timeout',
  REFERRAL_CODE = 'ReferralCode',
  BIGINT_CONVERSION = 'BigIntConversion',
  NETWORK_REQUEST = 'NetworkRequest',
  UNKNOWN = 'Unknown',
}
