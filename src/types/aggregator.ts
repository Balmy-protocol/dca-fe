import { QuoteResponse, QuoteTransaction } from '@mean-finance/sdk';
import { BigNumber } from 'ethers';
import { Token } from './tokens';

export type SwapOption = {
  id: string;
  sellToken: QuoteResponse['sellToken'] & Token;
  buyToken: QuoteResponse['buyToken'] & Token;
  transferTo?: string | null;
  sellAmount: Omit<QuoteResponse['sellAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD?: number;
  };
  buyAmount: Omit<QuoteResponse['buyAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD?: number;
  };
  maxSellAmount: Omit<QuoteResponse['maxSellAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD?: number;
  };
  minBuyAmount: Omit<QuoteResponse['minBuyAmount'], 'amount' | 'amountInUnits' | 'amountInUSD'> & {
    amount: BigNumber;
    amountInUnits: string;
    amountInUSD?: number;
  };
  gas?: Omit<
    QuoteResponse['gas'],
    | 'estimatedGas'
    | 'estimatedCost'
    | 'estimatedCostInUnits'
    | 'estimatedCostInUSD'
    | 'gasTokenSymbol'
    | 'gasTokenPrice'
  > & {
    estimatedGas: BigNumber;
    estimatedCost: BigNumber;
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
