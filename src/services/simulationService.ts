import { ComparableQuote, QuoteTransaction, sortQuotesBy } from '@mean-finance/sdk';
import { BLOWFISH_ENABLED_CHAINS, NULL_ADDRESS, ONE_DAY } from '@constants';
import compact from 'lodash/compact';
import omit from 'lodash/omit';
import { BigNumber } from 'ethers';
import { BlowfishResponse, MeanPermit2Contract, SwapOption } from '@types';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { SwapSortOptions } from '@constants/aggregator';
import { quoteResponseToSwapOption } from '@common/utils/quotes';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

// MOCKS
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import ContractService from './contractService';
import SdkService from './sdkService';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SellOrderSwapWithGasMeasurementParam = Parameters<
  MeanPermit2Contract['callStatic']['sellOrderSwapWithGasMeasurement']
>[0];
interface CallInterface extends SellOrderSwapWithGasMeasurementParam {
  value: BigNumber;
}

export default class SimulationService {
  meanApiService: MeanApiService;

  providerService: ProviderService;

  contractService: ContractService;

  sdkService: SdkService;

  constructor(
    meanApiService: MeanApiService,
    providerService: ProviderService,
    contractService: ContractService,
    sdkService: SdkService
  ) {
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.sdkService = sdkService;
  }

  async simulateGasPriceTransaction(txData: QuoteTransaction): Promise<BlowfishResponse> {
    await this.providerService.estimateGas(txData);

    return {
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [],
      },
    };
  }

  async simulateQuotes(
    quotes: SwapOption[],
    sorting: SwapSortOptions,
    signature?: { nonce: BigNumber; deadline: number; v: number; r: Buffer; s: Buffer; rawSignature: string }
  ): Promise<SwapOption[]> {
    const meanPermit2Instance = await this.contractService.getMeanPermit2Instance();

    const address = await this.providerService.getAddress();

    const network = await this.providerService.getNetwork();

    const calls: CallInterface[][] = [];

    const amountPerGroup = 3;
    const mappedQuotes = quotes.map((quote) => {
      if (!quote.tx) {
        return null;
      }

      return {
        originalQuote: quote,
        // Deadline
        deadline: signature?.deadline || Math.floor(Date.now() / 1000) + ONE_DAY.toNumber(),
        // Take from caller
        tokenIn: quote.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : quote.sellToken.address,
        amountIn: quote.maxSellAmount.amount,
        nonce: signature?.nonce || BigNumber.from(0),
        signature: signature?.rawSignature || '0x',
        // Swapp approval
        allowanceTarget: quote.swapper.allowanceTarget,
        // Swap execution
        swapper: quote.tx.to,
        swapData: quote.tx.data,
        // Swap validation
        tokenOut: quote.buyToken.address === PROTOCOL_TOKEN_ADDRESS ? NULL_ADDRESS : quote.buyToken.address,
        minAmountOut: quote.minBuyAmount.amount,
        // Transfer token out
        transferOut: [{ recipient: quote.transferTo || address, shareBps: 0 }],
        value: quote.sellToken.address === PROTOCOL_TOKEN_ADDRESS ? quote.maxSellAmount.amount : BigNumber.from(0),
      };
    });

    const quotesToCall = compact(mappedQuotes);

    const groups = Math.ceil(quotesToCall.length / amountPerGroup);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < groups; i++) {
      // eslint-disable-next-line no-plusplus
      for (let k = 0; k < amountPerGroup; k++) {
        if (!calls[i]) {
          calls[i] = [];
        }

        calls[i].push(quotesToCall[i + k]);
      }
    }

    let results: ([BigNumber, BigNumber, BigNumber] | null)[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < calls.length; i++) {
      const promises: Promise<[BigNumber, BigNumber, BigNumber] | null>[] = [];
      // eslint-disable-next-line no-plusplus
      for (let k = 0; k < calls[i].length; k++) {
        promises.push(
          meanPermit2Instance.callStatic
            .sellOrderSwapWithGasMeasurement(omit(calls[i][k], 'value'), { value: calls[i][k].value })
            .catch(() => null)
        );
      }

      // eslint-disable-next-line no-await-in-loop
      const currentResults = await Promise.all(promises);

      results = [...results, ...currentResults];

      // Lets wait a second between each group of calls so the rpcs dont rate limit us
      // eslint-disable-next-line no-await-in-loop
      await timeout(1000);
    }

    const gasPrice = await this.sdkService.sdk.gasService.getQuickGasCalculator({
      chainId: network.chainId,
    });

    const hidratedQuotes = quotesToCall.map<ComparableQuote | null>((quoteRequest, index) => {
      const result = results[index];
      if (!result) {
        return null;
      }

      const { originalQuote } = quoteRequest;

      const [amountIn, amountOut, gas] = result;

      const sellAmountUsd = amountIn
        .mul(parseUnits(originalQuote.sellAmount.amountInUSD?.toString() || '0', 18))
        .div(originalQuote.sellAmount.amount);
      const buyAmountUsd = amountOut
        .mul(parseUnits(originalQuote.buyAmount.amountInUSD?.toString() || '0', 18))
        .div(originalQuote.buyAmount.amount);
      const gasCost = gasPrice.calculateGasCost({ gasEstimation: gas.toString() });

      const gasCostUsd = BigNumber.from(gasCost.standard.gasCostNativeToken)
        .mul(parseUnits(originalQuote.gas?.estimatedCostInUSD?.toString() || '0', 18))
        .div(originalQuote.gas?.estimatedCost || BigNumber.from(1));

      return {
        ...originalQuote,
        maxSellAmount: {
          ...originalQuote.maxSellAmount,
          amount: originalQuote.maxSellAmount.amount.toString(),
          amountInUSD: originalQuote.maxSellAmount.amountInUSD?.toString(),
        },
        minBuyAmount: {
          ...originalQuote.minBuyAmount,
          amount: originalQuote.minBuyAmount.amount.toString(),
          amountInUSD: originalQuote.minBuyAmount.amountInUSD?.toString(),
        },
        sellAmount: {
          ...originalQuote.sellAmount,
          amount: amountIn.toString(),
          amountInUnits: formatUnits(amountIn, originalQuote.sellToken.decimals),
          amountInUSD: formatUnits(sellAmountUsd, 18),
        },
        buyAmount: {
          ...originalQuote.buyAmount,
          amount: amountOut.toString(),
          amountInUnits: formatUnits(amountOut, originalQuote.buyToken.decimals),
          amountInUSD: formatUnits(buyAmountUsd, 18),
        },
        gas: {
          ...originalQuote.gas,
          estimatedGas: gas.toString(),
          estimatedCost: gasCost.standard.gasCostNativeToken,
          estimatedCostInUnits: formatUnits(gasCost.standard.gasCostNativeToken, 18),
          estimatedCostInUSD: formatUnits(gasCostUsd, 18),
          gasTokenSymbol: originalQuote.gas?.gasTokenSymbol || '',
        },
        source: originalQuote.swapper,
      };
    });

    const sortedQuotes = sortQuotesBy(compact(hidratedQuotes), sorting, 'sell/buy amounts');

    return sortedQuotes.map<SwapOption>(quoteResponseToSwapOption);
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
        value: BigNumber.from(txData.value || '0').toString(),
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
