// eslint-disable-next-line max-classes-per-file
import { buildSDK, EstimatedQuoteRequest, QuoteResponse, SourceId, SOURCES_METADATA } from '@balmy/sdk';
import {
  SdkBaseStrategy,
  PreparedTransactionRequest,
  SwapOption,
  Token,
  ChainId,
  StrategyId,
  SdkBaseDetailedStrategy,
} from '@types';
import isNaN from 'lodash/isNaN';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys, TimeoutKey, getTimeoutKeyForChain } from '@constants/aggregator';
import { AxiosInstance } from 'axios';
import { toToken } from '@common/utils/currency';
import { MEAN_API_URL, SUPPORTED_NETWORKS_DCA, NULL_ADDRESS } from '@constants/addresses';
import { ArrayOneOrMore } from '@balmy/sdk/dist/utility-types';
import { Address } from 'viem';
import { swapOptionToQuoteResponse } from '@common/utils/quotes';
import { sdkStrategyMock, sdkStrategyMock2, sdkDetailedStrategyMock } from '@common/mocks/earn';

export default class SdkService {
  sdk: ReturnType<typeof buildSDK<object>>;

  axiosClient: AxiosInstance;

  constructor(axiosClient: AxiosInstance) {
    this.axiosClient = axiosClient;
    this.sdk = buildSDK({
      dca: {
        customAPIUrl: MEAN_API_URL,
      },
      provider: {
        source: {
          type: 'prioritized',
          sources: [{ type: 'public-rpcs' }],
        },
      },
      quotes: {
        defaultConfig: {
          global: { disableValidation: true },
          custom: {
            squid: { integratorId: 'meanfinance-api' },
            balmy: { url: MEAN_API_URL },
            sovryn: { url: MEAN_API_URL },
          },
        },
        sourceList: {
          type: 'overridable-source-list',
          lists: {
            default: {
              type: 'local',
            },
            getQuotes: [
              {
                list: {
                  type: 'batch-api',
                  getQuotesURI: ({ chainId }: { chainId: number }) =>
                    `${MEAN_API_URL}/v1/swap/networks/${chainId}/quotes/`,
                  buildTxURI: () => `${MEAN_API_URL}/v1/swap/build-txs/`,
                  sources: SOURCES_METADATA,
                },
                sourceIds: [
                  'rango',
                  'changelly',
                  '0x',
                  '1inch',
                  'uniswap',
                  'portals-fi',
                  'dodo',
                  'bebop',
                  'enso',
                  'barter',
                  'squid',
                  'okx-dex',
                ],
              },
            ],
            buildTxs: [
              {
                list: {
                  type: 'batch-api',
                  getQuotesURI: ({ chainId }: { chainId: number }) =>
                    `${MEAN_API_URL}/v1/swap/networks/${chainId}/quotes/`,
                  buildTxURI: () => `${MEAN_API_URL}/v1/swap/build-txs/`,
                  sources: SOURCES_METADATA,
                },
                sourceIds: ['barter'],
              },
            ],
          },
        },
      },
      price: {
        source: {
          type: 'cached',
          config: {
            expiration: {
              useCachedValue: { ifUnder: '1m' },
              useCachedValueIfCalculationFailed: { ifUnder: '5m' },
            },
            maxSize: 20000,
          },
          underlyingSource: {
            type: 'defi-llama',
          },
        },
      },
    });
  }

  async getSwapOptions({
    from,
    to,
    sellAmount,
    buyAmount,
    sortQuotesBy = SORT_MOST_PROFIT,
    recipient,
    slippagePercentage,
    gasSpeed,
    takerAddress,
    skipValidation,
    chainId,
    disabledDexes,
    usePermit2 = false,
    sourceTimeout = TimeoutKey.patient,
  }: {
    from: string;
    to: string;
    sellAmount?: bigint;
    buyAmount?: bigint;
    sortQuotesBy?: SwapSortOptions;
    recipient?: string | null;
    slippagePercentage?: number;
    gasSpeed?: GasKeys;
    takerAddress?: string;
    skipValidation?: boolean;
    chainId: number;
    disabledDexes?: string[];
    usePermit2?: boolean;
    sourceTimeout?: TimeoutKey;
  }) {
    let responses;

    const request: EstimatedQuoteRequest = {
      sellToken: from,
      buyToken: to,
      chainId,
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
      ...(recipient && !usePermit2 ? { recipient } : {}),
      ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
      ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
      ...(skipValidation ? { skipValidation } : {}),
      ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
    };

    if (usePermit2) {
      responses = await this.sdk.permit2Service.quotes.estimateAllQuotes({
        request,
        config: {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
          timeout: getTimeoutKeyForChain(chainId, sourceTimeout) || '5s',
        },
      });
    } else if (takerAddress) {
      responses = await this.sdk.quoteService.getAllQuotes({
        request: { ...request, takerAddress },
        config: {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
          timeout: getTimeoutKeyForChain(chainId, sourceTimeout) || '5s',
        },
      });
    } else {
      responses = await this.sdk.quoteService.estimateAllQuotes({
        request,
        config: {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
          timeout: getTimeoutKeyForChain(chainId, sourceTimeout) || '5s',
        },
      });
    }

    return responses;
  }

  buildSwapOptions(swapOptions: SwapOption[], recipient: Address) {
    const mappedResponses = swapOptions.map((option) => swapOptionToQuoteResponse(option, recipient));
    const reducedResponse = mappedResponses.reduce<Record<SourceId, QuoteResponse>>((acc, response) => {
      // eslint-disable-next-line no-param-reassign
      acc[response.source.id] = response;
      return acc;
    }, {});

    return this.sdk.quoteService.buildAllTxs({
      quotes: reducedResponse,
    });
  }

  getSupportedDexes() {
    return this.sdk.quoteService.supportedSources();
  }

  getSupportedChains() {
    return this.sdk.quoteService.supportedChains();
  }

  async getCustomToken(address: string, chainId: number): Promise<{ token: Token; balance: bigint } | undefined> {
    const validRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);

    if (!validRegex.test(address)) {
      return undefined;
    }

    const tokenResponse = await this.sdk.metadataService.getMetadataInChain({
      chainId,
      tokens: [address],
      config: { fields: { requirements: { decimals: 'required', symbol: 'required', name: 'required' } } },
    });

    const token = tokenResponse[address];

    if (!token) {
      return undefined;
    }

    const tokenData = toToken({ ...token, address, chainId });

    return {
      token: tokenData,
      balance: 0n,
    };
  }

  getTransactionReceipt(txHash: Address, chainId: number) {
    return this.sdk.providerService.getViemPublicClient({ chainId }).getTransactionReceipt({ hash: txHash });
  }

  getTransaction(txHash: Address, chainId: number) {
    return this.sdk.providerService.getViemPublicClient({ chainId }).getTransaction({ hash: txHash });
  }

  async getMultipleBalances(tokens: Token[], account: string): Promise<Record<number, Record<string, bigint>>> {
    const balances = await this.sdk.balanceService.getBalancesForAccount({
      account,
      tokens: tokens
        .filter((token) => token.address !== NULL_ADDRESS)
        .map((token) => ({ chainId: token.chainId, token: token.address })),
    });

    const chainIds = Object.keys(balances);

    return chainIds.reduce<Record<number, Record<string, bigint>>>((acc, chainId) => {
      // eslint-disable-next-line no-param-reassign
      acc[Number(chainId)] = Object.keys(balances[Number(chainId)]).reduce<Record<string, bigint>>(
        (tokenAcc, tokenAddress) => {
          // eslint-disable-next-line no-param-reassign
          tokenAcc[tokenAddress] = BigInt(balances[Number(chainId)][tokenAddress]);
          return tokenAcc;
        },
        {}
      );
      return acc;
    }, {});
  }

  async getMultipleAllowances(
    tokenChecks: Record<string, string>,
    user: string,
    chainId: number
  ): Promise<Record<string, Record<string, bigint>>> {
    const allowances = await this.sdk.allowanceService.getAllowancesInChain({
      chainId,
      allowances: Object.keys(tokenChecks).map((tokenAddress) => ({
        token: tokenAddress,
        owner: user,
        spender: tokenChecks[tokenAddress],
      })),
    });

    return Object.keys(tokenChecks).reduce<Record<string, Record<string, bigint>>>(
      (acc, address) => ({
        ...acc,
        [address]: {
          [tokenChecks[address]]: BigInt(allowances[address][user][tokenChecks[address]]),
        },
      }),
      {}
    );
  }

  // DCA Methods
  getDCAAllowanceTarget(args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['getAllowanceTarget']>[0]) {
    return this.sdk.dcaService.getAllowanceTarget(args) as Address;
  }

  buildCreatePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildCreatePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildCreatePositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  buildIncreasePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildIncreasePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildIncreasePositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  buildReducePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildReducePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildReducePositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  buildReduceToBuyPositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildReduceToBuyPositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildReduceToBuyPositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  buildWithdrawPositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildWithdrawPositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildWithdrawPositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  buildTerminatePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildTerminatePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildTerminatePositionTx(args) as Promise<PreparedTransactionRequest>;
  }

  getUsersDcaPositions(accounts: ArrayOneOrMore<string>) {
    return this.sdk.dcaService.getPositionsByAccount({
      accounts,
      chains: SUPPORTED_NETWORKS_DCA,
      includeHistory: false,
    });
  }

  getDcaSupportedPairs() {
    return this.sdk.dcaService.getSupportedPairs({
      chains: SUPPORTED_NETWORKS_DCA,
    });
  }

  async getDcaPosition({ chainId, positionId, hub }: { chainId: number; positionId: number; hub: string }) {
    const sdkPositions = await this.sdk.dcaService.getPositionsById({
      ids: [
        {
          chainId,
          hub,
          positionId,
        },
      ],
      includeHistory: true,
    });

    return sdkPositions[chainId][0];
  }

  async getAllStrategies(): Promise<SdkBaseStrategy[]> {
    const now = Date.now();
    const mockedStrategies = new Promise<SdkBaseStrategy[]>((resolve) => {
      setTimeout(() => {
        resolve(
          Array.from(Array(40)).map((_, index) =>
            index % 2 === 0
              ? { ...sdkStrategyMock, id: `${sdkStrategyMock.id}-${index}`, lastUpdatedAt: now }
              : { ...sdkStrategyMock2, id: `${sdkStrategyMock2.id}-${index}`, lastUpdatedAt: now }
          )
        );
      }, 3000);
    });

    return mockedStrategies;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDetailedStrategy({
    chainId,
    strategyId,
  }: {
    chainId: ChainId;
    strategyId: StrategyId;
  }): Promise<SdkBaseDetailedStrategy> {
    const now = Date.now();
    const mockedStrategies = new Promise<SdkBaseDetailedStrategy>((resolve) => {
      setTimeout(() => {
        resolve({
          ...sdkDetailedStrategyMock,
          id: strategyId,
          lastUpdatedAt: now,
          detailed: true,
          farm: { ...sdkDetailedStrategyMock.farm, chainId },
        });
      }, 1000);
    });

    return mockedStrategies;
  }
}
