import {
  ChainId,
  SdkEarnPosition,
  SdkStrategy,
  SummarizedSdkStrategyParameters,
  TokenListId,
  SavedSdkStrategy,
  SavedSdkEarnPosition,
} from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import { IntervalSetActions } from '@constants/timing';
import AccountService from './accountService';

export interface EarnServiceData {
  allStrategies: SavedSdkStrategy[];
  hasFetchedAllStrategies: boolean;
  strategiesParameters: SummarizedSdkStrategyParameters;
  hasFetchedUserStrategies: boolean;
  userStrategies: SavedSdkEarnPosition[];
}

const defaultEarnServiceData: EarnServiceData = {
  allStrategies: [],
  hasFetchedAllStrategies: false,
  hasFetchedUserStrategies: false,
  userStrategies: [],
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

  accountService: AccountService;

  constructor(sdkService: SdkService, accountService: AccountService) {
    super(defaultEarnServiceData);

    this.sdkService = sdkService;
    this.accountService = accountService;
  }

  get allStrategies(): SavedSdkStrategy[] {
    return this.serviceData.allStrategies;
  }

  set allStrategies(allStrategies) {
    this.serviceData = { ...this.serviceData, allStrategies };
  }

  get userStrategies(): SavedSdkEarnPosition[] {
    return this.serviceData.userStrategies;
  }

  set userStrategies(userStrategies) {
    this.serviceData = { ...this.serviceData, userStrategies };
  }

  get hasFetchedAllStrategies(): boolean {
    return this.serviceData.hasFetchedAllStrategies;
  }

  set hasFetchedAllStrategies(hasFetchedAllStrategies) {
    this.serviceData = { ...this.serviceData, hasFetchedAllStrategies };
  }

  get hasFetchedUserStrategies(): boolean {
    return this.serviceData.hasFetchedUserStrategies;
  }

  set hasFetchedUserStrategies(hasFetchedUserStrategies) {
    this.serviceData = { ...this.serviceData, hasFetchedUserStrategies };
  }

  get strategiesParameters(): SummarizedSdkStrategyParameters {
    return this.serviceData.strategiesParameters;
  }

  set strategiesParameters(strategiesParameters) {
    this.serviceData = { ...this.serviceData, strategiesParameters };
  }

  getUserStrategies() {
    return this.userStrategies;
  }

  getHasFetchedUserStrategies() {
    return this.hasFetchedAllStrategies;
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
    const lastUpdatedAt = Date.now();
    this.allStrategies = strategies.map((strategy) => ({ ...strategy, lastUpdatedAt }));
    this.hasFetchedAllStrategies = true;
  }

  needsToUpdateStrategy({ strategyId, chainId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    const existingStrategy = this.allStrategies.find((s) => s.id === strategyId && s.farm.chainId === chainId);

    return !(
      existingStrategy &&
      'detailed' in existingStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      Date.now() - existingStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
    );
  }

  updateStrategy(
    { strategy, userStrategies }: { strategy: SdkStrategy | SavedSdkStrategy; userStrategies?: SavedSdkEarnPosition[] },
    updateStore = true
  ) {
    const strategyIndex = this.allStrategies.findIndex(
      (s) => s.id === strategy.id && s.farm.chainId === strategy.farm.chainId
    );

    const allStrategies = [...this.allStrategies];

    const includedUserStrategies = userStrategies
      ?.filter((userStrategy) => userStrategy.strategy === strategy.id)
      .map((userStrategy) => userStrategy.id);

    if (strategyIndex === -1) {
      allStrategies.push({
        ...strategy,
        lastUpdatedAt: Date.now(),
        userPositions: includedUserStrategies,
      });
    } else {
      allStrategies[strategyIndex] = {
        ...allStrategies[strategyIndex],
        ...strategy,
        lastUpdatedAt: Date.now(),
        userPositions: includedUserStrategies || allStrategies[strategyIndex].userPositions,
      };
    }

    if (updateStore) {
      this.allStrategies = allStrategies;
    }

    return allStrategies;
  }

  batchUpdateStrategies(strategies: SdkStrategy[], userStrategies?: SavedSdkEarnPosition[]) {
    let allStrategies = [...this.allStrategies];

    strategies.forEach((strategy) => {
      allStrategies = this.updateStrategy({ strategy, userStrategies }, false);
    });

    this.allStrategies = allStrategies;
  }

  async fetchDetailedStrategy({ chainId, strategyId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    const needsToUpdate = this.needsToUpdateStrategy({ strategyId, chainId });

    if (!needsToUpdate) {
      return;
    }

    const strategy = await this.sdkService.getDetailedStrategy({ chainId, strategyId });

    this.updateStrategy({ strategy: { ...strategy, detailed: true } });
  }

  async fetchUserStrategies(): Promise<Record<ChainId, SdkEarnPosition[]>> {
    this.hasFetchedUserStrategies = false;
    const accounts = this.accountService.getWallets();
    const addresses = accounts.map((account) => account.address);
    const userStrategies = await this.sdkService.getUserStrategies({ accounts: addresses });
    const lastUpdatedAt = Date.now();
    const strategiesArray = Object.values(userStrategies).reduce((acc, strategies) => {
      acc.push(...strategies);
      return acc;
    }, []);

    const savedUserStrategies = strategiesArray.map<SavedSdkEarnPosition>((strategy) => ({
      ...strategy,
      lastUpdatedAt,
      strategy: strategy.strategy.id,
    }));

    this.batchUpdateStrategies(
      strategiesArray.map((userStrategy) => userStrategy.strategy),
      savedUserStrategies
    );

    this.userStrategies = savedUserStrategies;

    this.hasFetchedUserStrategies = true;

    return userStrategies;
  }

  needsToUpdateUserStrategy(strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0]) {
    const existingUserStrategy = this.userStrategies.find((s) => s.id === strategyId);

    return !(
      existingUserStrategy &&
      'detailed' in existingUserStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      Date.now() - existingUserStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
    );
  }

  updateUserStrategy(userStrategy: SdkEarnPosition) {
    const userStrategyIndex = this.userStrategies.findIndex((s) => s.id === userStrategy.id);

    const userStrategies = [...this.userStrategies];
    if (userStrategyIndex === -1) {
      userStrategies.push({ ...userStrategy, lastUpdatedAt: Date.now(), strategy: userStrategy.strategy.id });
    } else {
      userStrategies[userStrategyIndex] = {
        ...userStrategies[userStrategyIndex],
        ...userStrategy,
        lastUpdatedAt: Date.now(),
        strategy: userStrategy.strategy.id,
      };
    }

    if (
      this.needsToUpdateStrategy({ strategyId: userStrategy.strategy.id, chainId: userStrategy.strategy.farm.chainId })
    ) {
      this.updateStrategy({ strategy: userStrategy.strategy });
    }

    this.userStrategies = userStrategies;
  }

  async fetchUserStrategy(strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0]) {
    const needsToUpdate = this.needsToUpdateUserStrategy(strategyId);

    if (!needsToUpdate) {
      return;
    }

    const userStrategy = await this.sdkService.getUserStrategy(strategyId);

    this.updateUserStrategy(userStrategy);
  }
}
