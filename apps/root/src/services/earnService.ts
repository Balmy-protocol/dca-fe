import { SdkStrategy, SummarizedSdkStrategyParameters, TokenListId } from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import { IntervalSetActions } from '@constants/timing';

export interface EarnServiceData {
  allStrategies: SdkStrategy[];
  hasFetchedAllStrategies: boolean;
  strategiesParameters: SummarizedSdkStrategyParameters;
}

const defaultEarnServiceData: EarnServiceData = {
  allStrategies: [],
  hasFetchedAllStrategies: false,
  strategiesParameters: {
    farms: {},
    guardians: {},
    tokens: {
      assets: {},
      rewards: {},
    },
    networks: {},
    yieldTypes: [],
  },
};

export class EarnService extends EventsManager<EarnServiceData> {
  sdkService: SdkService;

  constructor(sdkService: SdkService) {
    super(defaultEarnServiceData);

    this.sdkService = sdkService;
  }

  get allStrategies(): SdkStrategy[] {
    return this.serviceData.allStrategies;
  }

  set allStrategies(allStrategies) {
    this.serviceData = { ...this.serviceData, allStrategies };
  }

  get hasFetchedAllStrategies(): boolean {
    return this.serviceData.hasFetchedAllStrategies;
  }

  set hasFetchedAllStrategies(hasFetchedAllStrategies) {
    this.serviceData = { ...this.serviceData, hasFetchedAllStrategies };
  }

  get strategiesParameters(): SummarizedSdkStrategyParameters {
    return this.serviceData.strategiesParameters;
  }

  set strategiesParameters(strategiesParameters) {
    this.serviceData = { ...this.serviceData, strategiesParameters };
  }

  getAllStrategies() {
    return this.allStrategies;
  }

  getHasFetchedAllStrategies() {
    return this.hasFetchedAllStrategies;
  }

  getStrategiesParameters() {
    return this.strategiesParameters;
  }

  processStrategyParameters(strategies: SdkStrategy[]) {
    const summarizedParameters = strategies.reduce<SummarizedSdkStrategyParameters>(
      (acc, strategy) => {
        // Farms
        if (!acc.farms[strategy.farm.id]) {
          // eslint-disable-next-line no-param-reassign
          acc.farms[strategy.farm.id] = strategy.farm;
        }

        // Guardians
        if (strategy.guardian && !acc.guardians[strategy.guardian.id]) {
          // eslint-disable-next-line no-param-reassign
          acc.guardians[strategy.guardian.id] = strategy.guardian;
        }

        // Asssets
        const assetTokenId = `${strategy.farm.chainId}-${strategy.farm.asset.address}` as TokenListId;
        if (!acc.tokens.assets[assetTokenId]) {
          // eslint-disable-next-line no-param-reassign
          acc.tokens.assets[assetTokenId] = strategy.farm.asset;
        }

        // Rewards
        strategy.farm.rewards?.tokens.forEach((rewardToken) => {
          const rewardTokenId = `${strategy.farm.chainId}-${rewardToken.address}` as TokenListId;
          if (!acc.tokens.rewards[rewardTokenId]) {
            // eslint-disable-next-line no-param-reassign
            acc.tokens.rewards[rewardTokenId] = rewardToken;
          }
        });

        // Networks
        if (!acc.networks[strategy.farm.chainId]) {
          const foundNetwork = Object.values(NETWORKS).find((network) => network.chainId === strategy.farm.chainId);
          if (foundNetwork) {
            // eslint-disable-next-line no-param-reassign
            acc.networks[strategy.farm.chainId] = foundNetwork;
          }
        }

        // Yield types
        if (!acc.yieldTypes.includes(strategy.farm.type)) {
          // eslint-disable-next-line no-param-reassign
          acc.yieldTypes.push(strategy.farm.type);
        }

        return acc;
      },
      {
        farms: {},
        guardians: {},
        tokens: {
          assets: {},
          rewards: {},
        },
        networks: {},
        yieldTypes: [],
      }
    );

    this.strategiesParameters = summarizedParameters;
  }

  async fetchAllStrategies(): Promise<void> {
    this.hasFetchedAllStrategies = false;
    const strategies = await this.sdkService.getAllStrategies();
    this.processStrategyParameters(strategies);

    this.allStrategies = strategies;
    this.hasFetchedAllStrategies = true;
  }

  async fetchDetailedStrategy({ chainId, strategyId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    // lets check if we need to fetch details or update them
    const strategyIndex = this.allStrategies.findIndex((s) => s.id === strategyId && s.farm.chainId === chainId);
    const existingStrategy = strategyIndex !== -1 ? this.allStrategies[strategyIndex] : undefined;

    // If it exists, and it has detailed information, and it was updated recently, we don't need to fetch it again
    if (
      existingStrategy &&
      'detailed' in existingStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      Date.now() - existingStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
    ) {
      return;
    }

    const allStrategies = [...this.allStrategies];
    const strategy = await this.sdkService.getDetailedStrategy({ chainId, strategyId });
    if (strategyIndex === -1) {
      allStrategies.push(strategy);
    } else {
      allStrategies[strategyIndex] = strategy;
    }

    this.allStrategies = allStrategies;
  }
}
