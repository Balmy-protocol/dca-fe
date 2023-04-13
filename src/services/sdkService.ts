// eslint-disable-next-line max-classes-per-file
import { buildSDK, SourceId, SOURCES_METADATA } from '@mean-finance/sdk';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys } from 'config/constants/aggregator';
import { BigNumber } from 'ethers';
import { SwapOption, Token } from 'types';
import { AxiosInstance } from 'axios';
import { toToken } from 'utils/currency';
import { MEAN_API_URL } from 'config/constants/addresses';
import ProviderService from './providerService';
import WalletService from './walletService';

export default class SdkService {
  sdk: ReturnType<typeof buildSDK<{}>>;

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
          type: 'prioritized',
          sources: [{ type: 'updatable-ethers', provider: () => this.provider }, { type: 'public-rpcs' }],
        },
      },
      quotes: {
        sourceList: {
          type: 'overridable-source-list',
          lists: {
            default: {
              type: 'local',
            },
            overrides: [
              {
                list: {
                  type: 'api',
                  baseUri: ({ chainId, sourceId }: { chainId: number; sourceId: SourceId }) =>
                    `${MEAN_API_URL}/v1/swap/networks/${chainId}/quotes/${sourceId}`,
                  sources: SOURCES_METADATA,
                },
                sourceIds: ['uniswap', 'odos', 'rango', '0x', 'firebird', 'changelly'],
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

    return this.sdk.quoteService.getQuote({
      sourceId: quote.swapper.id,
      request: {
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
        ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
        ...(skipValidation ? { skipValidation } : {}),
        ...(isBuyOrder ? { estimateBuyOrdersWithSellOnlySources: true } : {}),
      },
      config: { timeout: '5s' },
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
      responses = await this.sdk.quoteService.estimateAllQuotes({
        request: {
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
          ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
          ...(skipValidation ? { skipValidation } : {}),
          ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
        },
        config: {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
          timeout: '5s',
        },
      });
    } else {
      responses = await this.sdk.quoteService.getAllQuotes({
        request: {
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
          ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
          ...(skipValidation ? { skipValidation } : {}),
          ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
        },
        config: {
          sort: {
            by: sortQuotesBy,
          },
          ignoredFailed: false,
          timeout: '5s',
        },
      });
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
    const account = this.walletService.getAccount();

    if (chainId === currentNetwork.chainId && !!account) {
      return this.walletService.getCustomToken(address);
    }

    const tokenResponse = await this.sdk.metadataService.getMetadataForChain({
      chainId,
      addresses: [address],
      config: { fields: { requirements: { decimals: 'required', symbol: 'required', name: 'required' } } },
    });

    const token = tokenResponse[address];

    if (!token) {
      return undefined;
    }

    const tokenData = toToken({ ...token, address, chainId });

    return {
      token: tokenData,
      balance: BigNumber.from(0),
    };
  }

  getTransactionReceipt(txHash: string, chainId: number) {
    return this.sdk.providerSource.getEthersProvider({ chainId }).getTransactionReceipt(txHash);
  }

  getTransaction(txHash: string, chainId: number) {
    return this.sdk.providerSource.getEthersProvider({ chainId }).getTransaction(txHash);
  }

  async getMultipleBalances(tokens: Token[]): Promise<Record<number, Record<string, BigNumber>>> {
    const account = this.walletService.getAccount();
    const balances = await this.sdk.balanceService.getBalancesForTokens({
      account,
      tokens: tokens.reduce<Record<number, string[]>>((acc, token) => {
        const newAcc = {
          ...acc,
        };

        if (!newAcc[token.chainId]) {
          newAcc[token.chainId] = [];
        }

        if (!newAcc[token.chainId].includes(token.address)) {
          newAcc[token.chainId] = [...newAcc[token.chainId], token.address];
        }

        return newAcc;
      }, {}),
    });

    const chainIds = Object.keys(balances);

    return chainIds.reduce(
      (acc, chainId) => ({
        ...acc,
        [chainId]: Object.keys(balances[Number(chainId)]).reduce(
          (tokenAcc, tokenAddress) => ({
            ...tokenAcc,
            [tokenAddress]: BigNumber.from(balances[Number(chainId)][tokenAddress]),
          }),
          {}
        ),
      }),
      {}
    );
  }

  async getMultipleAllowances(
    tokenChecks: Record<string, string>,
    chainId: number
  ): Promise<Record<string, Record<string, BigNumber>>> {
    const account = this.walletService.getAccount();
    const allowances = await this.sdk.allowanceService.getMultipleAllowances({
      chainId,
      check: Object.keys(tokenChecks).map((tokenAddress) => ({
        token: tokenAddress,
        owner: account,
        spender: tokenChecks[tokenAddress],
      })),
    });

    return Object.keys(tokenChecks).reduce<Record<string, Record<string, BigNumber>>>(
      (acc, address) => ({
        ...acc,
        [address]: {
          [tokenChecks[address]]: BigNumber.from(allowances[address][account][tokenChecks[address]]),
        },
      }),
      {}
    );
  }
}
