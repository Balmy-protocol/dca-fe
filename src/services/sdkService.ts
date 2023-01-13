import { buildSDK } from '@mean-finance/sdk';
import isNaN from 'lodash/isNaN';
import { BaseProvider } from '@ethersproject/providers';
import { SwapSortOptions, SORT_MOST_PROFIT, GasKeys } from 'config/constants/aggregator';
import { BigNumber } from 'ethers';
import ProviderService from './providerService';
import WalletService from './walletService';

export default class SdkService {
  sdk: ReturnType<typeof buildSDK>;

  walletService: WalletService;

  providerService: ProviderService;

  constructor(walletService: WalletService, providerService: ProviderService) {
    this.walletService = walletService;
    this.providerService = providerService;
  }

  async resetProvider() {
    const provider = (await this.providerService.getBaseProvider()) as BaseProvider;
    this.sdk = buildSDK({ provider: { source: provider } });
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

    const responses = await this.sdk.quoteService.getAllQuotes(
      {
        sellToken: from,
        buyToken: to,
        chainId: currentNetwork.chainId,
        order: buyAmount
          ? {
              type: 'buy',
              buyAmount: buyAmount.toString(),
            }
          : {
              type: 'sell',
              sellAmount: sellAmount?.toString() || '0',
            },
        ...(takerAddress ? { takerAddress } : { takerAddress: '' }),
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

    console.log('aggregator response', responses);

    return responses;
  }
}
