import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import { BLOWFISH_ENABLED_CHAINS } from 'config';
import { BlowfishResponse } from 'types';

// MOCKS
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

export default class SimulationService {
  meanApiService: MeanApiService;

  providerService: ProviderService;

  constructor(meanApiService: MeanApiService, providerService: ProviderService) {
    this.meanApiService = meanApiService;
    this.providerService = providerService;
  }

  async simulateGasPriceTransaction(txData: QuoteTx): Promise<BlowfishResponse> {
    await this.providerService.estimateGas(txData);

    return {
      action: 'NONE',
      warnings: [],
      simulationResults: {
        expectedStateChanges: [],
      },
    };
  }

  async simulateTransaction(txData: QuoteTx, chainId: number) {
    if (!BLOWFISH_ENABLED_CHAINS.includes(chainId)) {
      return this.simulateGasPriceTransaction(txData);
    }

    const results = await this.meanApiService.simulateTransaction(
      {
        from: txData.from,
        to: txData.to,
        value: txData.value?.toString() || '0',
        data: txData.data.toString(),
      },
      txData.from,
      {
        origin: window.location.origin,
      },
      chainId
    );

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
