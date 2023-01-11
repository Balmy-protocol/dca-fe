import { buildSDKWithProvider } from 'mean-sdk/dist/sdk/builders';
import { Networks } from 'mean-sdk/dist/networks';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys } from 'config/constants/aggregator';
import { BigNumber } from 'ethers';
import ProviderService from './providerService';
import WalletService from './walletService';

export default class SdkService {
  sdk: ReturnType<typeof buildSDKWithProvider>;

  walletService: WalletService;

  providerService: ProviderService;

  constructor(walletService: WalletService, providerService: ProviderService) {
    this.walletService = walletService;
    this.providerService = providerService;
    // if (this.providerService.getBaseProvider()) {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   this.sdk = buildSDKWithProvider(this.providerService.getBaseProvider() as BaseProvider);
    // }
  }

  async resetProvider() {
    const provider = (await this.providerService.getBaseProvider()) as BaseProvider;
    this.sdk = buildSDKWithProvider({ provider });
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
    skipValidation?: boolean
  ) {
    const currentNetwork = await this.walletService.getNetwork();

    const network = Networks.byKey(currentNetwork.chainId);

    if (!network) {
      return Promise.resolve([]);
    }

    const responsesQuotes = await this.sdk.quoteService.getAllQuotes({
      sellToken: from,
      buyToken: to,
      network,
      order: buyAmount
        ? {
            type: 'buy',
            buyAmount: buyAmount.toString(),
          }
        : {
            type: 'sell',
            sellAmount: sellAmount?.toString() || '0',
          },
      ...(takerAddress && !skipValidation ? { takerAddress } : { takerAddress: '' }),
      ...(sellAmount ? { sellAmount: sellAmount.toString() } : {}),
      ...(buyAmount ? { buyAmount: buyAmount.toString() } : {}),
      ...(recipient ? { recipient } : {}),
      ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
      ...(gasSpeed ? { gasSpeed } : {}),
      ...(skipValidation ? { skipValidation } : {}),
    });

    console.log('quotes', responsesQuotes);

    const responses = await this.sdk.quoteService.getAllQuotes(
      {
        sellToken: from,
        buyToken: to,
        network,
        order: buyAmount
          ? {
              type: 'buy',
              buyAmount: buyAmount.toString(),
            }
          : {
              type: 'sell',
              sellAmount: sellAmount?.toString() || '0',
            },
        ...(takerAddress && !skipValidation ? { takerAddress } : { takerAddress: '' }),
        ...(sellAmount ? { sellAmount: sellAmount.toString() } : {}),
        ...(buyAmount ? { buyAmount: buyAmount.toString() } : {}),
        ...(recipient ? { recipient } : {}),
        ...(slippagePercentage && !isNaN(slippagePercentage) ? { slippagePercentage } : { slippagePercentage: 0.1 }),
        ...(gasSpeed ? { gasSpeed } : {}),
        ...(skipValidation ? { skipValidation } : {}),
      },
      {
        sort: {
          by: sortQuotesBy,
        },
        ignoredFailed: false,
      }
    );

    console.log('got a response', responses);

    return responses;
  }
}
