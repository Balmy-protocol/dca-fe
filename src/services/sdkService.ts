// eslint-disable-next-line max-classes-per-file
import { buildSDK, SOURCES_METADATA } from '@mean-finance/sdk';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys } from 'config/constants/aggregator';
import { BigNumber } from 'ethers';
import { SwapOption, Token } from 'types';
import { AxiosInstance } from 'axios';
import { toToken } from 'utils/currency';
import ProviderService from './providerService';
import WalletService from './walletService';

export default class SdkService {
  sdk: ReturnType<typeof buildSDK>;

  walletService: WalletService;

  providerService: ProviderService;

  axiosClient: AxiosInstance;

  provider: BaseProvider | undefined;

  constructor(walletService: WalletService, providerService: ProviderService, axiosClient: AxiosInstance) {
    this.walletService = walletService;
    this.providerService = providerService;
    this.axiosClient = axiosClient;
    this.sdk = buildSDK({
      provider: {
        source: {
          type: 'only-first-provider-that-supports-chain',
          sources: [{ type: 'updatable-ethers', provider: () => this.provider }, { type: 'public-rpcs' }],
        },
      },
      quotes: {
        sourceList: {
          type: 'overridable-source-list',
          lists: {
            default: {
              type: 'default',
            },
            overrides: [
              {
                list: {
                  type: 'api',
                  baseUri: ({ chainId }: { chainId: number }) =>
                    `https://api.mean.finance/v1/swap/networks/${chainId}/quotes`,
                  sources: SOURCES_METADATA,
                },
                sourceIds: ['uniswap', 'odos', 'firebird', 'rango', '0x'],
              },
            ],
          },
        },
      },
    });
  }

  async resetProvider() {
    this.provider = (await this.providerService.getBaseProvider()) as BaseProvider;
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
    const currentNetwork = await this.providerService.getNetwork();

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
      quoteTimeout: '5s',
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
    const currentNetwork = await this.providerService.getNetwork();

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
          quoteTimeout: '5s',
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
          quoteTimeout: '5s',
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
    const currentNetwork = await this.providerService.getNetwork();

    if (chainId === currentNetwork.chainId) {
      return this.walletService.getCustomToken(address);
    }

    const tokenResponse = await this.sdk.tokenService.getTokens({ addresses: [{ addresses: [address], chainId }] });

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
