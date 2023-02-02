// eslint-disable-next-line max-classes-per-file
import { buildSDK, SOURCES_METADATA } from '@mean-finance/sdk';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys } from 'config/constants/aggregator';
import { BigNumber } from 'ethers';
import { SwapOption, Token } from 'types';
import { IQuoteSourceList, SourceListRequest } from '@mean-finance/sdk/dist/services/quotes/source-lists/types';
import {
  SourceId,
  SourceMetadata,
  QuoteResponse,
  FailedQuote,
  TokenWithOptionalPrice,
  QuoteTx,
} from '@mean-finance/sdk/dist/services/quotes/types';
import { AxiosInstance } from 'axios';
import { toToken } from 'utils/currency';
import ProviderService from './providerService';
import WalletService from './walletService';

interface ApiSingleQuoteResponse {
  sellToken: TokenWithOptionalPrice;
  buyToken: TokenWithOptionalPrice;
  sellAmount: {
    amount: string;
    amountInUnits: number;
    amountInUSD: number;
  };
  buyAmount: {
    amount: string;
    amountInUnits: number;
    amountInUSD: number;
  };
  maxSellAmount: {
    amount: string;
    amountInUnits: number;
    amountInUSD: number;
  };
  minBuyAmount: {
    amount: string;
    amountInUnits: number;
    amountInUSD: number;
  };
  gas: {
    estimatedGas: string;
    estimatedCost: string;
    estimatedCostInUnits: number;
    estimatedCostInUSD: number;
    gasTokenSymbol: string;
  };
  recipient: string;
  source: {
    id: string;
    allowanceTarget: string;
    name: string;
    logoURI: string;
  };
  type: 'sell' | 'buy';
  tx: QuoteTx;
}
type ApiQuoteResponse = (ApiSingleQuoteResponse | FailedQuote)[];

class MeanFinanceAPISourceList implements IQuoteSourceList {
  axiosClient: AxiosInstance;

  constructor(axiosClient: AxiosInstance) {
    this.axiosClient = axiosClient;
  }

  supportedSources(): Record<SourceId, SourceMetadata> {
    const { uniswap, odos, firebird } = SOURCES_METADATA;
    return {
      uniswap,
      odos,
      firebird,
    };
  }

  getQuotes(): Promise<QuoteResponse | FailedQuote>[] {
    throw new Error('Not implemented');
  }

  getAllQuotes(request: SourceListRequest): Promise<(QuoteResponse | FailedQuote)[]> {
    return this.fetchAPI(request);
  }

  private async fetchAPI({
    chainId,
    sourceIds,
    sellToken,
    buyToken,
    order,
    slippagePercentage,
    takerAddress,
    recipient,
    gasSpeed,
    quoteTimeout,
    txValidFor,
    estimateBuyOrdersWithSellOnlySources,
  }: SourceListRequest): Promise<(QuoteResponse | FailedQuote)[]> {
    let url =
      `https://api.mean.finance/swap/newtorks/${chainId}/quotes` +
      `?includedSources=${sourceIds.join(',')}` +
      `&sellToken=${sellToken}` +
      `&buyToken=${buyToken}` +
      `&slippagePercentage=${slippagePercentage}` +
      `&takerAddress=${takerAddress}`;

    if (order.type === 'sell') {
      url += `&sellAmount=${order.sellAmount.toString()}`;
    } else {
      url += `&buyAmount=${order.buyAmount.toString()}`;
    }
    if (recipient) {
      url += `&recipient=${recipient}`;
    }
    if (gasSpeed) {
      url += `&gasSpeed=${gasSpeed}`;
    }
    if (quoteTimeout) {
      url += `&quoteTimeout=${quoteTimeout}`;
    }
    if (txValidFor) {
      url += `&txValidFor=${txValidFor}`;
    }
    if (estimateBuyOrdersWithSellOnlySources) {
      url += `&estimateBuyOrdersWithSellOnlySources`;
    }

    const results = await this.axiosClient.get<ApiQuoteResponse>(url);

    const resultData = results.data;

    const mappedResults = resultData.map<QuoteResponse | FailedQuote>((quote) => {
      if ((quote as FailedQuote).failed === true) {
        return quote as FailedQuote;
      }

      const {
        sellToken: quoteSellToken,
        buyToken: quoteBuyToken,
        sellAmount: {
          amount: sellAmountAmount,
          amountInUnits: sellAmountAmountInUnits,
          amountInUSD: sellAmountAmountInUsd,
        },
        buyAmount: {
          amount: buyAmountAmount,
          amountInUnits: buyAmountAmountInUnits,
          amountInUSD: buyAmountAmountInUsd,
        },
        maxSellAmount: {
          amount: maxSellAmountAmount,
          amountInUnits: maxSellAmountAmountInUnits,
          amountInUSD: maxSellAmountAmountInUsd,
        },
        minBuyAmount: {
          amount: minBuyAmountAmount,
          amountInUnits: minBuyAmountAmountInUnits,
          amountInUSD: minBuyAmountAmountInUsd,
        },
        gas: { estimatedGas, estimatedCost, estimatedCostInUnits, estimatedCostInUSD, gasTokenSymbol },
        recipient: quoteRecipient,
        source: { allowanceTarget, logoURI, name, id },
        type,
        tx,
      } = quote as ApiSingleQuoteResponse;

      return {
        sellToken: quoteSellToken,
        buyToken: quoteBuyToken,
        sellAmount: {
          amount: BigNumber.from(sellAmountAmount),
          amountInUnits: sellAmountAmountInUnits,
          amountInUSD: sellAmountAmountInUsd,
        },
        buyAmount: {
          amount: BigNumber.from(buyAmountAmount),
          amountInUnits: buyAmountAmountInUnits,
          amountInUSD: buyAmountAmountInUsd,
        },
        maxSellAmount: {
          amount: BigNumber.from(maxSellAmountAmount),
          amountInUnits: maxSellAmountAmountInUnits,
          amountInUSD: maxSellAmountAmountInUsd,
        },
        minBuyAmount: {
          amount: BigNumber.from(minBuyAmountAmount),
          amountInUnits: minBuyAmountAmountInUnits,
          amountInUSD: minBuyAmountAmountInUsd,
        },
        gas: {
          estimatedGas: BigNumber.from(estimatedGas),
          estimatedCost: BigNumber.from(estimatedCost),
          estimatedCostInUnits,
          gasTokenSymbol,
          estimatedCostInUSD,
        },
        recipient: quoteRecipient,
        source: {
          id,
          allowanceTarget,
          name,
          logoURI,
        },
        type,
        tx,
      };
    });

    return mappedResults;
  }
}
export default class SdkService {
  sdk: ReturnType<typeof buildSDK>;

  walletService: WalletService;

  providerService: ProviderService;

  axiosClient: AxiosInstance;

  ApiSourceList: MeanFinanceAPISourceList;

  constructor(walletService: WalletService, providerService: ProviderService, axiosClient: AxiosInstance) {
    this.walletService = walletService;
    this.providerService = providerService;
    this.axiosClient = axiosClient;
    this.ApiSourceList = new MeanFinanceAPISourceList(axiosClient);
    this.sdk = buildSDK({
      quotes: {
        sourceList: {
          type: 'overridable-source-list',
          lists: {
            default: {
              type: 'default',
            },
            overrides: {
              uniswap: {
                type: 'custom',
                instance: this.ApiSourceList,
              },
              odos: {
                type: 'custom',
                instance: this.ApiSourceList,
              },
              firebird: {
                type: 'custom',
                instance: this.ApiSourceList,
              },
            },
          },
        },
      },
    });
  }

  async resetProvider() {
    const provider = (await this.providerService.getBaseProvider()) as BaseProvider;
    this.sdk = buildSDK({ provider: { source: { type: 'ethers', instance: provider } } });
  }

  async getSwapOption(
    quote: SwapOption,
    takerAddress: string,
    chainId?: number,
    recipient?: string | null,
    slippagePercentage?: number,
    gasSpeed?: GasKeys,
    skipValidation?: boolean
  ) {
    const currentNetwork = await this.walletService.getNetwork();

    const network = chainId || currentNetwork.chainId;

    const isBuyOrder = quote.type === 'buy';

    return this.sdk.quoteService.getQuote(quote.swapper.id, {
      sellToken: quote.sellToken.address,
      buyToken: quote.buyToken.address,
      chainId: network,
      order: isBuyOrder
        ? {
            type: 'buy',
            buyAmount: quote.buyAmount.amount.toString(),
          }
        : {
            type: 'sell',
            sellAmount: quote.sellAmount.amount.toString() || '0',
          },
      takerAddress,
      ...(!isBuyOrder ? { sellAmount: quote.sellAmount.amount.toString() } : {}),
      ...(isBuyOrder ? { buyAmount: quote.buyAmount.amount.toString() } : {}),
      ...(recipient ? { recipient } : {}),
      ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
      ...(gasSpeed ? { gasSpeed } : {}),
      ...(skipValidation ? { skipValidation } : {}),
      ...(isBuyOrder ? { estimateBuyOrdersWithSellOnlySources: true } : {}),
    });
  }

  async getSwapOptions(
    from: string,
    to: string,
    sellAmount?: BigNumber,
    buyAmount?: BigNumber,
    sortQuotesBy: SwapSortOptions = SORT_MOST_PROFIT,
    recipient?: string | null,
    slippagePercentage?: number,
    gasSpeed?: GasKeys,
    takerAddress?: string,
    skipValidation?: boolean,
    chainId?: number,
    disabledDexes?: string[]
  ) {
    const currentNetwork = await this.walletService.getNetwork();

    const network = chainId || currentNetwork.chainId;

    let responses;

    if (!takerAddress) {
      responses = await this.sdk.quoteService.estimateAllQuotes(
        {
          sellToken: from,
          buyToken: to,
          chainId: network,
          order: buyAmount
            ? {
                type: 'buy',
                buyAmount: buyAmount.toString(),
              }
            : {
                type: 'sell',
                sellAmount: sellAmount?.toString() || '0',
              },
          ...(buyAmount ? { estimateBuyOrdersWithSellOnlySources: true } : {}),
          ...(sellAmount ? { sellAmount: sellAmount.toString() } : {}),
          ...(buyAmount ? { buyAmount: buyAmount.toString() } : {}),
          ...(recipient ? { recipient } : {}),
          ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
          ...(gasSpeed ? { gasSpeed } : {}),
          ...(skipValidation ? { skipValidation } : {}),
          ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
        },
        {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
        }
      );
    } else {
      responses = await this.sdk.quoteService.getAllQuotes(
        {
          sellToken: from,
          buyToken: to,
          chainId: network,
          order: buyAmount
            ? {
                type: 'buy',
                buyAmount: buyAmount.toString(),
              }
            : {
                type: 'sell',
                sellAmount: sellAmount?.toString() || '0',
              },
          takerAddress,
          ...(buyAmount ? { estimateBuyOrdersWithSellOnlySources: true } : {}),
          ...(sellAmount ? { sellAmount: sellAmount.toString() } : {}),
          ...(buyAmount ? { buyAmount: buyAmount.toString() } : {}),
          ...(recipient ? { recipient } : {}),
          ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
          ...(gasSpeed ? { gasSpeed } : {}),
          ...(skipValidation ? { skipValidation } : {}),
          ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
        },
        {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
        }
      );
    }

    return responses;
  }

  getSupportedDexes() {
    return this.sdk.quoteService.supportedSources();
  }

  getSupportedChains() {
    return this.sdk.quoteService.supportedChains();
  }

  async getCustomToken(address: string, chainId: number): Promise<{ token: Token; balance: BigNumber } | undefined> {
    const currentNetwork = await this.walletService.getNetwork();

    if (chainId === currentNetwork.chainId) {
      return this.walletService.getCustomToken(address);
    }

    const tokenResponse = await this.sdk.tokenService.getTokens([{ addresses: [address], chainId }]);

    const token = tokenResponse[chainId][address];

    if (!token) {
      return undefined;
    }

    const tokenData = toToken({ ...token, chainId });

    return {
      token: tokenData,
      balance: BigNumber.from(0),
    };
  }
}
