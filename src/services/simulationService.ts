import { QuoteTransaction } from '@mean-finance/sdk';
import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import { BigNumber } from 'ethers';
import { BlowfishResponse } from '@types';

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
