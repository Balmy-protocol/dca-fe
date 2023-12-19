import { QuoteResponse, QuoteTransaction } from '@mean-finance/sdk';
import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import compact from 'lodash/compact';

import { BlowfishResponse, SwapOption, TransactionRequestWithChain } from '@types';
import { SwapSortOptions } from '@constants/aggregator';
import { quoteResponseToSwapOption, swapOptionToEstimatedQuoteResponseWithTx } from '@common/utils/quotes';

// MOCKS
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import ContractService from './contractService';
import SdkService from './sdkService';
import EventService from './eventService';

export default class SimulationService {
  meanApiService: MeanApiService;

  providerService: ProviderService;

  contractService: ContractService;

  sdkService: SdkService;

  eventService: EventService;

  constructor(
    meanApiService: MeanApiService,
    providerService: ProviderService,
    contractService: ContractService,
    sdkService: SdkService,
    eventService: EventService
  ) {
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.sdkService = sdkService;
    this.eventService = eventService;
  }

  async simulateGasPriceTransaction(txData: QuoteTransaction): Promise<BlowfishResponse> {
    await this.providerService.estimateGas(txData as TransactionRequestWithChain);

    return {
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [],
      },
    };
  }

  async simulateQuotes(
    user: string,
    quotes: SwapOption[],
    sorting: SwapSortOptions,
    signature?: { nonce: bigint; deadline: number; rawSignature: string },
    minimumReceived?: bigint
  ): Promise<SwapOption[]> {
    const network = await this.providerService.getNetwork(user);

    const transferTo = quotes.reduce((prev, current) => {
      if (prev !== current.transferTo) {
        throw new Error('Different transfer To found for different quotes');
      }

      return prev;
    }, quotes[0].transferTo);

    let totalAmountToApprove = quotes[0].maxSellAmount.amount;

    if (minimumReceived) {
      const maxBetweenQuotes = quotes.reduce<bigint>(
        (acc, quote) => (acc <= quote.maxSellAmount.amount ? quote.maxSellAmount.amount : acc),
        0n
      );

      totalAmountToApprove = maxBetweenQuotes;
    }

    const newQuotes = await this.sdkService.sdk.permit2Service.quotes.verifyAndPrepareQuotes({
      chainId: network.chainId,
      quotes: quotes.map(swapOptionToEstimatedQuoteResponseWithTx),
      takerAddress: user,
      recipient: transferTo || user,
      config: {
        sort: {
          by: sorting,
        },
        ignoredFailed: false,
      },
      permitData: signature && {
        amount: totalAmountToApprove.toString(),
        token: quotes[0].sellToken.address,
        nonce: signature.nonce.toString(),
        deadline: signature.deadline.toString(),
        signature: signature.rawSignature,
      },
    });

    newQuotes.forEach((quote) => {
      if ('failed' in quote) {
        // eslint-disable-next-line no-void
        void this.eventService.trackEvent('Aggregator - Transaction simulation error', { source: quote.source.id });
      } else {
        // eslint-disable-next-line no-void
        void this.eventService.trackEvent('Aggregator - Transaction simulation successfull', {
          source: quote.source.id,
        });
      }
    });
    const mappedQuotes = compact(newQuotes.filter((option) => !('failed' in option)) as QuoteResponse[])
      .filter((quote) => !minimumReceived || BigInt(quote.minBuyAmount.amount) >= minimumReceived)
      .map<SwapOption>(quoteResponseToSwapOption);

    return mappedQuotes;
  }

  async simulateTransaction(
    txData: QuoteTransaction,
    chainId: number,
    forceProviderSimulation?: boolean
  ): Promise<BlowfishResponse> {
    if (!BLOWFISH_ENABLED_CHAINS.includes(chainId) || forceProviderSimulation) {
      return this.simulateGasPriceTransaction(txData);
    }

    const results = await this.meanApiService.simulateTransaction(
      {
        from: txData.from,
        to: txData.to,
        value: BigInt(txData.value || '0').toString(),
        data: txData.data.toString(),
      },
      txData.from,
      {
        origin: window.location.origin,
      },
      chainId
    );

    // If blowfish simulation failed check for simulating the estimateGas
    if (results.data.simulationResults.error) {
      return this.simulateGasPriceTransaction(txData);
    }

    return {
      action: results.data.action,
      simulationResults: {
        ...results.data.simulationResults,
        expectedStateChanges: results.data.simulationResults.expectedStateChanges.reverse(),
      },
      warnings: results.data.warnings,
    };
  }
}
