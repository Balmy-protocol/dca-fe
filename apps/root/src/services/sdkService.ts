// eslint-disable-next-line max-classes-per-file
import {
  buildSDK,
  EstimatedQuoteRequest,
  ProviderSourceInput,
  QuoteRequest,
  SourceId,
  SOURCES_METADATA,
} from '@mean-finance/sdk';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys, TimeoutKey } from '@constants/aggregator';
import { BigNumber } from 'ethers';
import { SwapOption, Token } from '@types';
import { AxiosInstance } from 'axios';
import { toToken } from '@common/utils/currency';
import { MEAN_API_URL, NULL_ADDRESS } from '@constants/addresses';
import ProviderService from './providerService';
import WalletService from './walletService';
import ContractService from './contractService';

export default class SdkService {
  sdk: ReturnType<typeof buildSDK<object>>;

  walletService: WalletService;

  providerService: ProviderService;

  axiosClient: AxiosInstance;

  provider: BaseProvider | undefined;

  contractService: ContractService;

  constructor(
    walletService: WalletService,
    providerService: ProviderService,
    axiosClient: AxiosInstance,
    contractService: ContractService
  ) {
    this.walletService = walletService;
    this.providerService = providerService;
    this.axiosClient = axiosClient;
    this.contractService = contractService;
    this.sdk = buildSDK({
      provider: {
        source: {
          type: 'prioritized',
          sources: [
            {
              type: 'updatable',
              provider: () => this.provider && ({ type: 'ethers', instance: this.provider } as ProviderSourceInput),
            },
            { type: 'public-rpcs' },
          ],
        },
      },
      quotes: {
        defaultConfig: { global: { disableValidation: true } },
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
                sourceIds: ['1inch', 'uniswap', 'rango', '0x', 'firebird', 'changelly'],
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
            maxSize: 20,
          },
          underlyingSource: {
            type: 'prioritized',
            sources: [
              { type: 'coingecko' },
              { type: 'portals-fi' },
              // We place Mean Finance before DefiLlama because DefiLlama can quote 4626 tokens, but they are updated once
              // every hour. Mean's price source has the more up-to-date
              { type: 'mean-finance' },
              { type: 'defi-llama' },
            ],
          },
        },
      },
    });
  }

  async resetProvider() {
    this.provider = (await this.providerService.getProvider()) as BaseProvider;
  }

  async getSwapOption(
    quote: SwapOption,
    passedTakerAddress: string,
    chainId?: number,
    recipient?: string | null,
    slippagePercentage?: number,
    gasSpeed?: GasKeys,
    skipValidation?: boolean,
    usePermit2?: boolean
  ) {
    const currentNetwork = await this.providerService.getNetwork();

    const meanPermit2Address = await this.contractService.getMeanPermit2Address();

    const network = chainId || currentNetwork.chainId;

    const isBuyOrder = quote.type === 'buy';

    const takerAddress = usePermit2 && meanPermit2Address ? meanPermit2Address : passedTakerAddress;

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
        ...(recipient && !usePermit2 ? { recipient } : {}),
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
    disabledDexes?: string[],
    usePermit2 = false,
    sourceTimeout = TimeoutKey.patient
  ) {
    const currentNetwork = await this.providerService.getNetwork();

    const network = chainId || currentNetwork.chainId;

    let responses;

    if (!takerAddress) {
      const request: EstimatedQuoteRequest = {
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
        ...(recipient && !usePermit2 ? { recipient } : {}),
        ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
        ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
        ...(skipValidation ? { skipValidation } : {}),
        ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
      };

      responses = await (usePermit2
        ? this.sdk.permit2Service.quotes.estimateAllQuotes({
            request,
            config: {
              sort: {
                by: sortQuotesBy,
              },
              ignoredFailed: false,
              timeout: sourceTimeout || '5s',
            },
          })
        : this.sdk.quoteService.estimateAllQuotes({
            request,
            config: {
              sort: {
                by: sortQuotesBy,
              },
              ignoredFailed: false,
              timeout: sourceTimeout || '5s',
            },
          }));
    } else {
      const request: QuoteRequest = {
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
        ...(recipient && !usePermit2 ? { recipient } : {}),
        ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
        ...(gasSpeed ? { gasSpeed: { speed: gasSpeed, requirement: 'best effort' } } : {}),
        ...(skipValidation ? { skipValidation } : {}),
        ...(disabledDexes ? { filters: { excludeSources: disabledDexes } } : {}),
      };

      responses = await (usePermit2
        ? this.sdk.permit2Service.quotes.estimateAllQuotes({
            request,
            config: {
              sort: {
                by: sortQuotesBy,
              },
              ignoredFailed: false,
              timeout: sourceTimeout || '5s',
            },
          })
        : this.sdk.quoteService.getAllQuotes({
            request,
            config: {
              sort: {
                by: sortQuotesBy,
              },
              ignoredFailed: false,
              timeout: sourceTimeout || '5s',
            },
          }));
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
    const validRegex = RegExp(/^0x[A-Fa-f0-9]{40}$/);

    if (!validRegex.test(address)) {
      return undefined;
    }

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
    return this.sdk.providerService.getEthersProvider({ chainId }).getTransactionReceipt(txHash);
  }

  getTransaction(txHash: string, chainId: number) {
    return this.sdk.providerService.getEthersProvider({ chainId }).getTransaction(txHash);
  }

  async getMultipleBalances(tokens: Token[]): Promise<Record<number, Record<string, BigNumber>>> {
    const account = this.walletService.getAccount();
    if (!account) {
      throw new Error('account must exist');
    }
    const balances = await this.sdk.balanceService.getBalancesForTokens({
      account,
      tokens: tokens.reduce<Record<number, string[]>>((acc, token) => {
        const newAcc = {
          ...acc,
        };

        if (token.address === NULL_ADDRESS) {
          return newAcc;
        }

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
    const allowances = await this.sdk.allowanceService.getMultipleAllowancesInChain({
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

  // DCA Methods
  getDCAAllowanceTarget(args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['getAllowanceTarget']>[0]) {
    return this.sdk.dcaService.getAllowanceTarget(args);
  }

  buildCreatePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildCreatePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildCreatePositionTx(args);
  }

  buildIncreasePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildIncreasePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildIncreasePositionTx(args);
  }

  buildReducePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildReducePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildReducePositionTx(args);
  }

  buildReduceToBuyPositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildReduceToBuyPositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildReduceToBuyPositionTx(args);
  }

  buildWithdrawPositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildWithdrawPositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildWithdrawPositionTx(args);
  }

  buildTerminatePositionTx(
    args: Parameters<ReturnType<typeof buildSDK<object>>['dcaService']['buildTerminatePositionTx']>[0]
  ) {
    return this.sdk.dcaService.buildTerminatePositionTx(args);
  }
}
