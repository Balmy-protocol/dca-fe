import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import { BLOWFISH_ENABLED_CHAINS } from 'config';

// MOCKS
import MeanApiService from './meanApiService';

export default class SimulationService {
  meanApiService: MeanApiService;

  constructor(meanApiService: MeanApiService) {
    this.meanApiService = meanApiService;
  }

  async simulateTransaction(txData: QuoteTx, chainId: number) {
    if (!BLOWFISH_ENABLED_CHAINS.includes(chainId)) {
      throw new Error('Blowfish url does not exist');
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
