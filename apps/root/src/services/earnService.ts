import {
  SdkEarnPosition,
  SdkStrategy,
  SummarizedSdkStrategyParameters,
  TokenListId,
  SavedSdkStrategy,
  SavedSdkEarnPosition,
  StrategyId,
  SdkEarnPositionId,
  TransactionTypes,
  TransactionDetails,
  FeeType,
  EarnPositionActionType,
  AmountsOfToken,
  isEarnType,
  Token,
  EarnPermission,
  EarnPositionAction,
  WithdrawType,
  EarnPositionWithdrewAction,
  EarnPositionDelayedWithdrawalClaimedAction,
  AccountId,
} from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import { IntervalSetActions } from '@constants/timing';
import AccountService from './accountService';
import compact from 'lodash/compact';
import { Address, encodeAbiParameters, formatUnits, Hex, parseAbiParameters } from 'viem';
import { parseSignatureValues } from '@common/utils/signatures';
import { getNewEarnPositionFromTxTypeData } from '@common/utils/transactions';
import { parseUsdPrice, parseNumberUsdPriceToBigInt, toToken, isSameToken } from '@common/utils/currency';
import { nowInSeconds } from '@common/utils/time';
import ProviderService from './providerService';
import { calculateDeadline, isSameAddress, PermitData } from '@balmy/sdk';
import { EarnPermissionData } from '@balmy/sdk/dist/services/earn/types';
import ContractService from './contractService';
import { mapPermission } from '@balmy/sdk/dist/services/earn/earn-service';
import { orderBy, uniqBy } from 'lodash';
import MeanApiService from './meanApiService';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { CustomTransactionErrorNames } from '@common/utils/errors';

export interface EarnServiceData {
  allStrategies: SavedSdkStrategy[];
  hasFetchedAllStrategies: boolean;
  strategiesParameters: SummarizedSdkStrategyParameters;
  earnPositionsParameters: SummarizedSdkStrategyParameters;
  hasFetchedUserStrategies: boolean;
  userStrategies: SavedSdkEarnPosition[];
}

const defaultEarnServiceData: EarnServiceData = {
  allStrategies: [],
  hasFetchedAllStrategies: false,
  hasFetchedUserStrategies: false,
  userStrategies: [],
  strategiesParameters: {
    protocols: [],
    guardians: {},
    tokens: {
      assets: {},
      rewards: {},
    },
    networks: {},
    yieldTypes: [],
  },
  earnPositionsParameters: {
    protocols: [],
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

  providerService: ProviderService;

  contractService: ContractService;

  meanApiService: MeanApiService;

  constructor(
    sdkService: SdkService,
    accountService: AccountService,
    providerService: ProviderService,
    contractService: ContractService,
    meanApiService: MeanApiService
  ) {
    super(defaultEarnServiceData);

    this.sdkService = sdkService;
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
    this.meanApiService = meanApiService;
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

  get earnPositionsParameters(): SummarizedSdkStrategyParameters {
    return this.serviceData.earnPositionsParameters;
  }

  set earnPositionsParameters(earnPositionsParameters) {
    this.serviceData = { ...this.serviceData, earnPositionsParameters };
  }

  getUserStrategies() {
    return this.userStrategies;
  }

  getHasFetchedUserStrategies() {
    return this.hasFetchedUserStrategies;
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

  getEarnPositionsParameters() {
    return this.earnPositionsParameters;
  }

  logOutUser() {
    const previousStrategies = this.allStrategies;
    this.resetData();
    this.userStrategies = [];
    this.allStrategies = previousStrategies.map((strategy) => ({
      ...strategy,
      userPositions: [],
    }));
  }

  processStrategyParameters(strategies: SdkStrategy[]) {
    const summarizedParameters = strategies.reduce<SummarizedSdkStrategyParameters>(
      (acc, strategy) => {
        // Protocols
        if (!acc.protocols.find((protocol) => protocol === strategy.farm.protocol)) {
          acc.protocols.push(strategy.farm.protocol);
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
        protocols: [],
        guardians: {},
        tokens: {
          assets: {},
          rewards: {},
        },
        networks: {},
        yieldTypes: [],
      }
    );

    return summarizedParameters;
  }

  async fetchAllStrategies(): Promise<void> {
    this.hasFetchedAllStrategies = false;
    const strategies = (await this.sdkService.getAllStrategies()).map((strategy) => this.updateStrategyToken(strategy));
    this.strategiesParameters = this.processStrategyParameters(strategies);
    const lastUpdatedAt = nowInSeconds();

    const allStrategies = strategies.map((strategy) => ({ ...strategy, lastUpdatedAt }));
    const existingUserPositions = this.userStrategies;
    this.batchUpdateStrategies(allStrategies, existingUserPositions);
    this.hasFetchedAllStrategies = true;
  }

  needsToUpdateStrategy({ strategyId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    const existingStrategy = this.allStrategies.find((s) => s.id === strategyId);

    return !(
      existingStrategy &&
      existingStrategy.hasFetchedHistoricalData &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      nowInSeconds() - existingStrategy.lastUpdatedAt > IntervalSetActions.strategyUpdate
    );
  }

  updateStrategy(
    { strategy, userStrategies }: { strategy: SdkStrategy | SavedSdkStrategy; userStrategies?: SavedSdkEarnPosition[] },
    allSavedStrategies?: SavedSdkStrategy[],
    updateStore = true
  ) {
    const allStategiesTouse = allSavedStrategies || this.allStrategies;
    const strategyIndex = allStategiesTouse.findIndex(
      (s) => s.id === strategy.id && s.farm.chainId === strategy.farm.chainId
    );

    const allStrategies = [...allStategiesTouse];

    const includedUserStrategies = userStrategies
      ?.filter((userStrategy) => userStrategy.strategy === strategy.id)
      .map((userStrategy) => userStrategy.id);

    if (strategyIndex === -1) {
      allStrategies.push({
        ...strategy,
        lastUpdatedAt: nowInSeconds(),
        userPositions: includedUserStrategies,
        hasFetchedHistoricalData: 'hasFetchedHistoricalData' in strategy ? strategy.hasFetchedHistoricalData : false,
      });
    } else {
      allStrategies[strategyIndex] = {
        ...allStrategies[strategyIndex],
        ...strategy,
        lastUpdatedAt: nowInSeconds(),
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
      allStrategies = this.updateStrategy({ strategy, userStrategies }, allStrategies, false);
    });

    this.allStrategies = allStrategies;
  }

  batchUpdateUserStrategies(userStrategies: SdkEarnPosition[], hasFetchedHistory?: boolean) {
    let storedUserStrategies = [...this.userStrategies];

    userStrategies.forEach((strategy) => {
      const updatedUserStrategies = this.updateUserStrategy(strategy, storedUserStrategies, hasFetchedHistory);
      storedUserStrategies = updatedUserStrategies;
    });

    this.userStrategies = storedUserStrategies;
  }

  async fetchDetailedStrategy({ strategyId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    const needsToUpdate = this.needsToUpdateStrategy({ strategyId });

    if (!needsToUpdate) {
      return;
    }

    const strategy = await this.sdkService.getDetailedStrategy({ strategyId });

    this.updateStrategy({ strategy: { ...this.updateStrategyToken(strategy), hasFetchedHistoricalData: true } });
  }

  async fetchUserStrategies(): Promise<SdkEarnPosition[]> {
    this.hasFetchedUserStrategies = false;
    const accounts = this.accountService.getWallets();
    const addresses = accounts.map((account) => account.address);
    const fetchedUserStrategies = await this.sdkService.getUserStrategies({ accounts: addresses });
    const userStrategies = Object.fromEntries(
      Object.entries(fetchedUserStrategies).map(([key, strategies]) => [
        key,
        strategies.map((strategy) => this.updateUserStrategyToken(strategy)),
      ])
    );

    const lastUpdatedAt = nowInSeconds();
    const strategiesArray = Object.values(userStrategies).reduce((acc, strategies) => {
      acc.push(...strategies);
      return acc;
    }, []);

    const savedUserStrategies = strategiesArray.map<SavedSdkEarnPosition>((strategy) => ({
      ...strategy,
      lastUpdatedAt,
      lastUpdatedAtFromApi: strategy.lastUpdatedAt,
      strategy: strategy.strategy.id,
      historicalBalances: strategy.historicalBalances || [],
      hasFetchedHistory: false,
      history: strategy.history || [],
    }));

    this.batchUpdateStrategies(
      strategiesArray.map((userStrategy) => userStrategy.strategy),
      savedUserStrategies
    );

    this.earnPositionsParameters = this.processStrategyParameters(
      strategiesArray.map((userStrategy) => userStrategy.strategy)
    );

    this.batchUpdateUserStrategies(strategiesArray);

    this.hasFetchedUserStrategies = true;

    return strategiesArray;
  }

  needsToUpdateUserStrategy(strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0]) {
    const existingUserStrategy = this.userStrategies.find((s) => s.id === strategyId);

    return !(
      existingUserStrategy &&
      existingUserStrategy.hasFetchedHistory &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      nowInSeconds() - existingUserStrategy.lastUpdatedAt > IntervalSetActions.strategyUpdate
    );
  }

  updateUserStrategy(
    userStrategy: SdkEarnPosition,
    savedUserStrategies: SavedSdkEarnPosition[],
    hasFetchedHistory?: boolean
  ) {
    const userStrategyIndex = savedUserStrategies.findIndex((s) => s.id === userStrategy.id);

    const updatedUserStrategies = [...savedUserStrategies];

    if (userStrategyIndex === -1) {
      const newStrat: SavedSdkEarnPosition = {
        ...userStrategy,
        lastUpdatedAt: nowInSeconds(),
        lastUpdatedAtFromApi: userStrategy.lastUpdatedAt,
        strategy: userStrategy.strategy.id,
        historicalBalances: userStrategy.historicalBalances || [],
        hasFetchedHistory: hasFetchedHistory || false,
        history: userStrategy.history || [],
      };
      updatedUserStrategies.push(newStrat);
    } else {
      let updatedBalances = userStrategy.balances.map((balance) => ({
        ...balance,
        profit:
          userStrategy.balances.find((fetchedBalance) => fetchedBalance.token.address === balance.token.address)
            ?.profit || balance.profit,
      }));

      let updatedDelayed = userStrategy.delayed || [];

      // Preserve locally stored historical balances
      const mergedHistoricalBalances = [
        ...(updatedUserStrategies[userStrategyIndex].historicalBalances || []),
        ...(userStrategy.historicalBalances || []),
      ];
      const updatedHistoricalBalances = orderBy(uniqBy(mergedHistoricalBalances, 'timestamp'), 'timestamp', 'desc');

      // it can happen that the fetched user strategy is still not indexed with our virtual events, so we need to apply the changes to the balances based on the different events that we had locally
      const currentHistory = updatedUserStrategies[userStrategyIndex].history;
      const eventsThatWeHaveThatTheUserStrategyIsMissing = currentHistory?.filter(
        // We keep only events that are after the last updated at timestamp from the api
        (event) => event.tx.timestamp > userStrategy.lastUpdatedAt
      );

      if (eventsThatWeHaveThatTheUserStrategyIsMissing) {
        updatedBalances = this.applyVirtualEventsToBalances(
          userStrategy.strategy,
          updatedBalances,
          eventsThatWeHaveThatTheUserStrategyIsMissing
        );
        updatedDelayed = this.applyVirtualEventsToDelayed(updatedDelayed, eventsThatWeHaveThatTheUserStrategyIsMissing);
      }

      const mergedHistory = [
        ...(updatedUserStrategies[userStrategyIndex].history || []),
        ...(userStrategy.history || []),
      ];
      const updatedHistory = orderBy(
        // More than one withdraw event can have the same hash
        uniqBy(mergedHistory, (tx) => `${tx.tx.hash}-${tx.action}`),
        'timestamp',
        'desc'
      );

      updatedUserStrategies[userStrategyIndex] = {
        ...updatedUserStrategies[userStrategyIndex],
        lastUpdatedAt: nowInSeconds(),
        lastUpdatedAtFromApi: userStrategy.lastUpdatedAt,
        strategy: userStrategy.strategy.id,
        historicalBalances: updatedHistoricalBalances,
        balances: updatedBalances,
        delayed: updatedDelayed,
        history: updatedHistory,
        hasFetchedHistory: hasFetchedHistory || updatedUserStrategies[userStrategyIndex].hasFetchedHistory,
      };
    }

    if (this.needsToUpdateStrategy({ strategyId: userStrategy.strategy.id })) {
      this.updateStrategy({ strategy: userStrategy.strategy });
    }

    return updatedUserStrategies;
  }

  applyVirtualEventsToBalances(
    strategy: SdkStrategy,
    balances: SdkEarnPosition['balances'],
    missingEvents: SdkEarnPosition['history']
  ) {
    let updatedBalances = [...balances];
    // Asc so we apply the oldest events first
    const orderedMissingEvents = orderBy(missingEvents, 'timestamp', 'asc');
    updatedBalances = orderedMissingEvents.reduce<SdkEarnPosition['balances']>((acc, event) => {
      switch (event.action) {
        case EarnPositionActionType.CREATED:
        case EarnPositionActionType.INCREASED:
          const depositBalanceIndex = acc.findIndex((b) => b.token.address === strategy.farm.asset.address);
          if (depositBalanceIndex !== -1) {
            const newAmount = acc[depositBalanceIndex].amount.amount + event.deposited.amount;
            const price = event.assetPrice;

            const amountInUSD = parseUsdPrice(
              strategy.farm.asset as unknown as Token,
              newAmount,
              parseNumberUsdPriceToBigInt(price)
            );
            // eslint-disable-next-line no-param-reassign
            acc[depositBalanceIndex].amount = {
              amount: newAmount,
              amountInUnits: formatUnits(newAmount, acc[depositBalanceIndex].token.decimals),
              amountInUSD: amountInUSD.toFixed(2),
            };
          }
          return acc;
        case EarnPositionActionType.WITHDREW:
          event.withdrawn.forEach((withdrawn) => {
            const withdrawBalanceIndex = acc.findIndex((b) => b.token.address === withdrawn.token.address);
            if (withdrawBalanceIndex !== -1) {
              const newAmount = acc[withdrawBalanceIndex].amount.amount - withdrawn.amount.amount;
              const price = withdrawn.token.price;

              const amountInUSD = parseUsdPrice(
                withdrawn.token as unknown as Token,
                newAmount,
                parseNumberUsdPriceToBigInt(price)
              );
              // eslint-disable-next-line no-param-reassign
              acc[withdrawBalanceIndex].amount = {
                amount: newAmount,
                amountInUnits: formatUnits(newAmount, acc[withdrawBalanceIndex].token.decimals),
                amountInUSD: amountInUSD.toFixed(2),
              };
            }
          });
          return acc;
      }

      return acc;
    }, updatedBalances);

    return updatedBalances;
  }

  applyVirtualEventsToDelayed(
    delayed: NonNullable<SdkEarnPosition['delayed']>,
    missingEvents: SdkEarnPosition['history']
  ) {
    let updatedDelayed = [...delayed];
    // Asc so we apply the oldest events first
    const orderedMissingEvents = orderBy(missingEvents, 'timestamp', 'asc');
    updatedDelayed = orderedMissingEvents.reduce<NonNullable<SdkEarnPosition['delayed']>>((acc, event) => {
      switch (event.action) {
        case EarnPositionActionType.WITHDREW:
          event.withdrawn
            .filter((withdrawn) => withdrawn.withdrawType === WithdrawType.DELAYED)
            .forEach((withdrawn) => {
              const initiatedDelayWithdrawIndex = acc.findIndex((b) => b.token.address === withdrawn.token.address);
              if (initiatedDelayWithdrawIndex !== -1) {
                const newAmount = acc[initiatedDelayWithdrawIndex].pending.amount + withdrawn.amount.amount;

                const amountInUSD = parseUsdPrice(
                  withdrawn.token as unknown as Token,
                  newAmount,
                  parseNumberUsdPriceToBigInt(withdrawn.token.price)
                );
                // eslint-disable-next-line no-param-reassign
                acc[initiatedDelayWithdrawIndex].pending = {
                  amount: newAmount,
                  amountInUnits: formatUnits(newAmount, acc[initiatedDelayWithdrawIndex].token.decimals),
                  amountInUSD: amountInUSD.toFixed(2),
                };
              }
            });
          return acc;
        case EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED:
          const claimedTokenIndex = acc.findIndex((b) => b.token.address === event.token.address);
          if (claimedTokenIndex !== -1) {
            const newAmount = acc[claimedTokenIndex].ready.amount - event.withdrawn.amount;
            const amountInUSD = parseUsdPrice(
              event.token as unknown as Token,
              newAmount,
              parseNumberUsdPriceToBigInt(event.token.price)
            );

            // eslint-disable-next-line no-param-reassign
            acc[claimedTokenIndex].ready = {
              amount: newAmount,
              amountInUnits: formatUnits(newAmount, acc[claimedTokenIndex].token.decimals),
              amountInUSD: amountInUSD.toFixed(2),
            };
          }
          return acc;
      }

      return acc;
    }, updatedDelayed);

    return updatedDelayed;
  }

  updateStrategyToken(strategy: SdkStrategy) {
    const protocolToken = getProtocolToken(strategy.farm.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(strategy.farm.chainId);
    const newStrategy = {
      ...strategy,
      farm: {
        ...strategy.farm,
        asset: isSameAddress(strategy.farm.asset.address, wrappedProtocolToken.address)
          ? { ...strategy.farm.asset, ...protocolToken }
          : strategy.farm.asset,
      },
    };

    return newStrategy;
  }

  updateUserStrategyToken(userStrategy: SdkEarnPosition): SdkEarnPosition {
    // Now lets update all WETH to ETH
    const protocolToken = getProtocolToken(userStrategy.strategy.farm.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(userStrategy.strategy.farm.chainId);
    const updatedUserStrategy = {
      ...userStrategy,
      strategy: this.updateStrategyToken(userStrategy.strategy),
    };

    updatedUserStrategy.balances = updatedUserStrategy.balances.map((balance) => {
      if (isSameAddress(balance.token.address, wrappedProtocolToken.address)) {
        return {
          ...balance,
          token: {
            ...balance.token,
            ...protocolToken,
          },
        };
      }
      return balance;
    });

    updatedUserStrategy.delayed = updatedUserStrategy.delayed?.map((delayed) => {
      if (isSameAddress(delayed.token.address, wrappedProtocolToken.address)) {
        return {
          ...delayed,
          token: {
            ...delayed.token,
            ...protocolToken,
          },
        };
      }
      return delayed;
    });

    updatedUserStrategy.history = updatedUserStrategy.history?.map((history) => {
      switch (history.action) {
        case EarnPositionActionType.WITHDREW:
          return {
            ...history,
            withdrawn: history.withdrawn.map((withdrawn) => ({
              ...withdrawn,
              token: isSameAddress(withdrawn.token.address, wrappedProtocolToken.address)
                ? {
                    ...withdrawn.token,
                    ...protocolToken,
                  }
                : withdrawn.token,
            })),
          };
        case EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED:
          return {
            ...history,
            token: isSameAddress(history.token.address, wrappedProtocolToken.address)
              ? {
                  ...history.token,
                  ...protocolToken,
                }
              : history.token,
          };
        case EarnPositionActionType.SPECIAL_WITHDREW:
          return {
            ...history,
            withdrawn: history.withdrawn.map((withdrawn) => ({
              ...withdrawn,
              token: isSameAddress(withdrawn.token.address, wrappedProtocolToken.address)
                ? {
                    ...withdrawn.token,
                    ...protocolToken,
                  }
                : withdrawn.token,
            })),
          };
        default:
          return history;
      }
    });

    updatedUserStrategy.historicalBalances = updatedUserStrategy.historicalBalances?.map((historicalBalance) => ({
      ...historicalBalance,
      balances: historicalBalance.balances.map((balance) => ({
        ...balance,
        token: isSameAddress(balance.token.address, wrappedProtocolToken.address)
          ? {
              ...balance.token,
              ...protocolToken,
            }
          : balance.token,
      })),
    }));

    return updatedUserStrategy;
  }

  async fetchUserStrategy(strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0]) {
    const needsToUpdate = this.needsToUpdateUserStrategy(strategyId);
    if (!needsToUpdate) {
      return;
    }

    const userStrategy = await this.sdkService.getUserStrategy(strategyId);

    if (!userStrategy) {
      return;
    }

    return this.updateUserStrategyToken(userStrategy);
  }

  async fetchMultipleEarnPositionsFromStrategy(strategyId: StrategyId) {
    const userStrategies = this.userStrategies;

    const positionsToFetch = userStrategies.filter((strat) => strat.strategy === strategyId);

    const promises = positionsToFetch.map((position) =>
      this.fetchUserStrategy(position.id).catch((e) => {
        console.error('Error fetching user strategy', e);
        return null;
      })
    );

    const results = compact(await Promise.all(promises));

    this.batchUpdateUserStrategies(results, true);
  }

  async increasePosition({
    earnPositionId,
    amount,
    permitSignature,
    permissionSignature,
    asset,
  }: {
    earnPositionId: SdkEarnPositionId;
    amount: bigint;
    asset: Token;
    permitSignature?: PermitData['permitData'] & { signature: Hex };
    permissionSignature?: EarnPermissionData['permitData'] & { signature: Hex };
  }) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }
    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    const increase = permitSignature
      ? {
          permitData: {
            amount,
            token: asset.address,
            nonce: permitSignature.nonce,
            deadline: BigInt(permitSignature.deadline),
          },
          signature: permitSignature.signature,
        }
      : {
          token: asset.address,
          amount: amount,
        };

    const permissionPermit =
      (permissionSignature && {
        permissions: permissionSignature.permissions,
        tokenId: userStrategy.id,
        deadline: BigInt(permissionSignature.deadline),
        signature: permissionSignature.signature,
      }) ||
      undefined;

    const tx = await this.sdkService.buildEarnIncreasePositionTx({
      chainId: strategy.farm.chainId,
      positionId: userStrategy.id,
      increase,
      permissionPermit,
      caller: userStrategy.owner,
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: userStrategy.owner,
      chainId: strategy.farm.chainId,
    });
  }

  async createPosition({
    user,
    strategyId,
    amount,
    asset,
    permitSignature,
    tosSignature,
  }: {
    strategyId: StrategyId;
    user: Address;
    amount: bigint;
    asset: Token;
    permitSignature?: PermitData['permitData'] & { signature: Hex };
    tosSignature?: Hex;
  }) {
    const strategy = this.allStrategies.find((s) => s.id === strategyId);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    const deposit = permitSignature
      ? {
          permitData: {
            amount,
            token: asset.address,
            nonce: permitSignature.nonce,
            deadline: BigInt(permitSignature.deadline),
          },
          signature: permitSignature.signature,
        }
      : {
          token: asset.address,
          amount: amount,
        };

    const earnCompanionAddress = this.contractService.getEarnCompanionAddress(strategy.farm.chainId);
    if (!earnCompanionAddress) throw new Error('No earn companion address found');
    const permissions = [
      {
        operator: earnCompanionAddress,
        permissions: [EarnPermission.INCREASE, EarnPermission.WITHDRAW],
      },
    ];

    const account = this.accountService.getUser()!;
    const strategyValidationData = await this.generateCreationData({
      tosSignature,
      accountId: account.id,
      strategyId: strategy.id,
      address: user,
      needsAPI: (strategy?.needsTier ?? 0) > 0,
    });

    const tx = await this.sdkService.buildEarnCreatePositionTx({
      chainId: strategy.farm.chainId,
      strategyId: strategy.id,
      owner: user,
      // We dont operate with smart wallets so we always need this
      permissions,
      deposit,
      strategyValidationData,
      caller: user,
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: user,
      chainId: strategy.farm.chainId,
    });
  }

  private async generateCreationData({
    tosSignature,
    accountId,
    strategyId,
    address,
    needsAPI,
    deadline,
  }: {
    tosSignature?: Hex;
    accountId: string;
    strategyId: StrategyId;
    address: Address;
    needsAPI?: boolean;
    deadline?: number;
  }): Promise<Hex> {
    const tosBytes = tosSignature ?? '0x';

    let signatureBytes: Hex = '0x';
    if (needsAPI) {
      const actualDeadline = BigInt(deadline ?? calculateDeadline('1d'));
      const { signature } = await this.getApiSignature({ accountId, strategyId, address, deadline: actualDeadline });
      signatureBytes = encodeAbiParameters(parseAbiParameters('bytes, uint'), [signature, actualDeadline]);
    }

    return encodeAbiParameters(parseAbiParameters('bytes[]'), [[tosBytes, signatureBytes]]);
  }

  private async getApiSignature({
    accountId,
    strategyId,
    address,
    deadline,
  }: {
    accountId: AccountId;
    strategyId: StrategyId;
    address: Address;
    deadline: bigint;
  }) {
    const signature = await this.accountService.getWalletVerifyingSignature({});
    try {
      return await this.meanApiService.getEarnStrategySignature({
        signature,
        accountId,
        strategyId,
        toValidate: address,
        deadline,
      });
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      e.name = CustomTransactionErrorNames.ApiSignatureForEarnCreateTransaction;
      throw e;
    }
  }

  async signStrategyToS(address: Address, strategyId: StrategyId) {
    const strategy = this.allStrategies.find((s) => s.id === strategyId);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    if (!strategy.tos) {
      throw new Error('Strategy does not have ToS');
    }

    const signer = await this.providerService.getSigner(address);

    if (!signer) {
      throw new Error('No signer found');
    }

    return signer.signMessage({
      message: strategy.tos,
      account: address,
    });
  }

  async withdrawPosition({
    earnPositionId,
    withdraw,
    permissionSignature,
  }: {
    earnPositionId: SdkEarnPositionId;
    withdraw: {
      amount: bigint;
      token: Token;
      convertTo?: Address;
      withdrawType: WithdrawType;
    }[];
    permissionSignature?: EarnPermissionData['permitData'] & { signature: Hex };
  }) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }
    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    const permissionPermit =
      (permissionSignature && {
        permissions: permissionSignature.permissions,
        tokenId: userStrategy.id,
        deadline: BigInt(permissionSignature.deadline),
        signature: permissionSignature.signature,
      }) ||
      undefined;

    const withdrawAmount = withdraw.map((w) => {
      return {
        token: w.token.address,
        amount: w.amount,
        convertTo: w.convertTo,
        type: w.withdrawType,
      };
    });

    const tx = await this.sdkService.buildEarnWithdrawPositionTx({
      chainId: strategy.farm.chainId,
      positionId: userStrategy.id,
      withdraw: { amounts: withdrawAmount },
      permissionPermit,
      recipient: userStrategy.owner,
      caller: userStrategy.owner,
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: userStrategy.owner,
      chainId: strategy.farm.chainId,
    });
  }

  async claimDelayedWithdrawPosition({
    earnPositionId,
    claim,
    convertTo,
    permissionSignature,
  }: {
    earnPositionId: SdkEarnPositionId;
    claim: Address;
    convertTo?: Address;
    permissionSignature?: EarnPermissionData['permitData'] & { signature: Hex };
  }) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }

    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    // NOTE: For the moment we should never expect the permissionSignature.
    // It's only required for swap & withdraw, that won't be supported for a while in delayed strategies
    const permissionPermit =
      (permissionSignature && {
        permissions: permissionSignature.permissions,
        tokenId: userStrategy.id,
        deadline: BigInt(permissionSignature.deadline),
        signature: permissionSignature.signature,
      }) ||
      undefined;

    const tx = await this.sdkService.buildEarnClaimDelayedWithdrawPositionTx({
      chainId: strategy.farm.chainId,
      positionId: userStrategy.id,
      recipient: userStrategy.owner,
      caller: userStrategy.owner,
      claim: {
        tokens: [{ token: claim, convertTo }],
      },
      permissionPermit,
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: userStrategy.owner,
      chainId: strategy.farm.chainId,
    });
  }

  private async fillAddressPermissions({
    earnPositionId,
    chainId,
    permission,
  }: {
    earnPositionId: SavedSdkEarnPosition['id'];
    chainId: number;
    permission: EarnPermission;
  }) {
    const earnCompanionInstance = await this.contractService.getEarnVaultInstance({ chainId, readOnly: true });
    const earnPositionTokenId = earnPositionId.split('-')[2];
    const companionAddress = this.contractService.getEarnCompanionAddress(chainId);
    if (!companionAddress || !earnCompanionInstance) throw new Error('No earn companion instance or address found');

    const [hasIncrease, hasWithdraw] = await Promise.all([
      earnCompanionInstance.read.hasPermission([
        BigInt(earnPositionTokenId),
        companionAddress,
        mapPermission(EarnPermission.INCREASE),
      ]),
      earnCompanionInstance.read.hasPermission([
        BigInt(earnPositionTokenId),
        companionAddress,
        mapPermission(EarnPermission.WITHDRAW),
      ]),
    ]);

    const defaultPermissions: EarnPermission[] = [
      ...(hasIncrease ? [EarnPermission.INCREASE] : []),
      ...(hasWithdraw ? [EarnPermission.WITHDRAW] : []),
    ];

    return [{ operator: companionAddress, permissions: [...defaultPermissions, permission] }];
  }

  async getSignatureForPermission({
    earnPositionId,
    chainId,
    permission,
  }: {
    earnPositionId: SdkEarnPositionId;
    chainId: number;
    permission: EarnPermission;
  }): Promise<EarnPermissionData['permitData'] & { signature: Hex }> {
    const earnPosition = this.userStrategies.find((s) => s.id === earnPositionId);
    if (!earnPosition) {
      throw new Error('No user position found');
    }

    const signer = await this.providerService.getSigner(earnPosition.owner, chainId);
    if (!signer) {
      throw new Error('No signer found');
    }

    const permissions = await this.fillAddressPermissions({
      chainId,
      earnPositionId,
      permission,
    });

    const data = await this.sdkService.sdk.earnService.preparePermissionData({
      chainId,
      positionId: earnPositionId,
      permissions,
      signerAddress: earnPosition.owner,
      signatureValidFor: '365d',
    });

    const typedData = data.dataToSign;

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await signer.signTypedData({
      domain: typedData.domain,
      types: typedData.types,
      message: typedData.message,
      account: earnPosition.owner,
      primaryType: typedData.primaryType,
    });

    const fixedSignature = parseSignatureValues(rawSignature);

    return {
      ...data.permitData,
      signature: fixedSignature.rawSignature,
    };
  }

  async estimateMarketWithdraw({
    chainId,
    positionId,
    token,
    amount,
  }: {
    chainId: number;
    positionId: SdkEarnPositionId;
    token: Address;
    amount: bigint;
  }) {
    return this.sdkService.estimateMarketWithdraw({
      chainId,
      positionId,
      token,
      amount,
    });
  }

  setPendingTransaction(transaction: TransactionDetails) {
    if (!isEarnType(transaction)) return;

    const { typeData } = transaction;
    let { positionId } = typeData;
    const { strategyId } = typeData;

    const userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

    if (transaction.type === TransactionTypes.earnCreate) {
      const newEarnPositionTypeData = transaction.typeData;
      positionId = `${transaction.chainId}-${strategyId}-${transaction.hash}` as SdkEarnPositionId;

      const depositFee = this.allStrategies
        .find((s) => s.id === strategyId)
        ?.guardian?.fees.find((fee) => fee.type === FeeType.DEPOSIT);
      const companionAddress = this.contractService.getEarnCompanionAddress(transaction.chainId);
      const newUserStrategy = getNewEarnPositionFromTxTypeData({
        newEarnPositionTypeData,
        user: transaction.from as Address,
        id: positionId,
        transaction: transaction.hash,
        depositFee: depositFee?.percentage,
        companionAddress,
      });

      userStrategies.push({ ...newUserStrategy, pendingTransaction: transaction.hash });
    }

    const existingStrategy = this.userStrategies.find((s) => s.id === positionId);
    if (existingStrategy) {
      existingStrategy.pendingTransaction = transaction.hash;
      userStrategies.push(existingStrategy);
    }

    this.userStrategies = userStrategies;
  }

  handleTransactionRejection(transaction: TransactionDetails) {
    if (!isEarnType(transaction)) return;

    const { typeData } = transaction;
    const { positionId, strategyId } = typeData;

    let userStrategies;

    switch (transaction.type) {
      case TransactionTypes.earnCreate:
        userStrategies = [
          ...this.userStrategies.filter((s) => s.id !== `${transaction.chainId}-${strategyId}-${transaction.hash}`),
        ];
        break;
      case TransactionTypes.earnIncrease:
      case TransactionTypes.earnWithdraw:
        const userStrategy = this.userStrategies.find((s) => s.id === positionId);
        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

        if (userStrategy) {
          userStrategies.push({
            ...userStrategy,
            pendingTransaction: '',
          });
        }
        break;
      default:
        userStrategies = [...this.userStrategies];
        break;
    }

    this.userStrategies = userStrategies;
  }

  handleStoredTransaction(transaction: TransactionDetails) {
    if (!isEarnType(transaction)) return;
    const existingUserStrategy = this.userStrategies.find((s) => s.id === transaction.typeData.positionId);
    const isValidCreateTransaction = !existingUserStrategy && transaction.type === TransactionTypes.earnCreate;
    const isValidNonCreateTransaction =
      existingUserStrategy &&
      transaction.type !== TransactionTypes.earnCreate &&
      existingUserStrategy.lastUpdatedAtFromApi < transaction.addedTime;
    if (!isValidCreateTransaction && !isValidNonCreateTransaction) return;

    this.handleTransaction(transaction);
  }

  handleTransaction(transaction: TransactionDetails) {
    if (!isEarnType(transaction)) return;

    let userStrategies;

    switch (transaction.type) {
      case TransactionTypes.earnCreate: {
        const newEarnPositionTypeData = transaction.typeData;
        const { positionId, strategyId } = newEarnPositionTypeData;

        if (!positionId) {
          throw new Error('Earn position ID should be set when handling transactions');
        }

        userStrategies = [
          ...this.userStrategies.filter((s) => s.id !== `${transaction.chainId}-${strategyId}-${transaction.hash}`),
        ];

        const depositFee = this.allStrategies
          .find((s) => s.id === strategyId)
          ?.guardian?.fees.find((fee) => fee.type === FeeType.DEPOSIT);

        const companionAddress = this.contractService.getEarnCompanionAddress(transaction.chainId);
        const newUserStrategy = getNewEarnPositionFromTxTypeData({
          newEarnPositionTypeData,
          user: transaction.from as Address,
          id: positionId,
          depositFee: depositFee?.percentage,
          transaction: transaction.hash,
          companionAddress,
        });

        userStrategies.push(newUserStrategy);

        const strategies = [...this.allStrategies.filter((s) => s.id !== strategyId)];
        const foundStrategy = this.allStrategies.find((s) => s.id === strategyId);
        if (foundStrategy) {
          strategies.push({
            ...foundStrategy,
            userPositions: [...(foundStrategy.userPositions || []), newUserStrategy.id],
          });

          this.allStrategies = strategies;
        }

        this.userStrategies = userStrategies;
        break;
      }
      case TransactionTypes.earnIncrease: {
        const increaseEarnPositionTypeData = transaction.typeData;
        const {
          positionId,
          strategyId,
          asset,
          assetAmount: assetAmountString,
          signedPermit,
        } = increaseEarnPositionTypeData;
        const assetAmount = BigInt(assetAmountString);
        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

        const existingUserStrategy = this.userStrategies.find((s) => s.id === positionId);
        if (!existingUserStrategy) {
          throw new Error('Could not find existing user strategy');
        }

        let modifiedStrategy = {
          ...existingUserStrategy,
        };

        const depositedAmount = {
          amount: assetAmount,
          amountInUnits: formatUnits(assetAmount, asset.decimals),
          amountInUSD: parseUsdPrice(asset, assetAmount, parseNumberUsdPriceToBigInt(asset.price)).toString(),
        };

        const depositFee = this.allStrategies
          .find((s) => s.id === strategyId)
          ?.guardian?.fees.find((fee) => fee.type === FeeType.DEPOSIT);
        let depositedAmountWithoutFee: AmountsOfToken | undefined;
        if (depositFee) {
          const feeAmount = (depositedAmount.amount * BigInt(depositFee.percentage * 100)) / 100000n;

          depositedAmountWithoutFee = {
            amount: assetAmount - feeAmount,
            amountInUnits: formatUnits(assetAmount - feeAmount, asset.decimals),
            amountInUSD: parseUsdPrice(
              asset,
              assetAmount - feeAmount,
              parseNumberUsdPriceToBigInt(asset.price)
            ).toFixed(2),
          };
        }

        const depositedForBalance = depositedAmountWithoutFee || depositedAmount;
        const newBalances = modifiedStrategy.balances.map((balance) =>
          balance.token.address !== asset.address
            ? balance
            : {
                ...balance,
                amount: {
                  amount: balance.amount.amount + depositedForBalance.amount,
                  amountInUnits: formatUnits(balance.amount.amount + depositedForBalance.amount, asset.decimals),
                  amountInUSD: parseUsdPrice(
                    asset,
                    balance.amount.amount + depositedForBalance.amount,
                    parseNumberUsdPriceToBigInt(asset.price)
                  ).toString(),
                },
              }
        );
        modifiedStrategy.lastUpdatedAt = nowInSeconds();
        modifiedStrategy.balances = newBalances;
        modifiedStrategy.historicalBalances.push({
          balances: newBalances,
          timestamp: nowInSeconds(),
        });

        const historyItem: EarnPositionAction = {
          action: EarnPositionActionType.INCREASED,
          deposited: depositedAmount,
          assetPrice: asset.price,
          tx: {
            timestamp: nowInSeconds(),
            hash: transaction.hash,
          },
        };

        if (modifiedStrategy.history && Array.isArray(modifiedStrategy.history)) {
          modifiedStrategy.history.push(historyItem);
        } else {
          modifiedStrategy = {
            ...modifiedStrategy,
            history: [historyItem],
          };
        }

        if (signedPermit) {
          const companionAddress = this.contractService.getEarnCompanionAddress(transaction.chainId);
          if (!companionAddress) throw new Error('No earn companion address found');

          const companionPermissions = modifiedStrategy.permissions[companionAddress];

          if (!companionPermissions) {
            modifiedStrategy.permissions[companionAddress] = [EarnPermission.INCREASE];
          } else {
            modifiedStrategy.permissions[companionAddress].push(EarnPermission.INCREASE);
          }
        }

        modifiedStrategy.pendingTransaction = '';

        userStrategies.push(modifiedStrategy);
        break;
      }
      case TransactionTypes.earnWithdraw: {
        const withdrawEarnPositionTypeData = transaction.typeData;
        const { positionId, strategyId, withdrawn, signedPermit } = withdrawEarnPositionTypeData;

        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

        const existingUserStrategy = this.userStrategies.find((s) => s.id === positionId);
        if (!existingUserStrategy) {
          throw new Error('Could not find existing user strategy');
        }

        const strategy = this.allStrategies.find((s) => s.id === strategyId);
        if (!strategy) {
          throw new Error('Could not find strategy');
        }

        let modifiedStrategy = {
          ...existingUserStrategy,
        };

        // Update Strategy Balances
        const withdrawnAmounts: EarnPositionWithdrewAction['withdrawn'] = withdrawn.map((withdrawnAmount) => ({
          token: withdrawnAmount.token,
          amount: {
            amount: BigInt(withdrawnAmount.amount),
            amountInUnits: formatUnits(BigInt(withdrawnAmount.amount), withdrawnAmount.token.decimals),
            amountInUSD: parseUsdPrice(
              withdrawnAmount.token,
              BigInt(withdrawnAmount.amount),
              parseNumberUsdPriceToBigInt(withdrawnAmount.token.price)
            ).toString(),
          },
          withdrawType: withdrawnAmount.withdrawType,
        }));

        const newBalances = modifiedStrategy.balances.map((balance) => {
          const withdrawnToken = withdrawnAmounts.find(
            (withdrawnAmount) => withdrawnAmount.token.address === balance.token.address
          );
          if (!withdrawnToken) {
            return balance;
          }

          const newTokenBalanceAmount = balance.amount.amount - withdrawnToken.amount.amount;

          return {
            ...balance,
            amount: {
              amount: newTokenBalanceAmount,
              amountInUnits: formatUnits(newTokenBalanceAmount, withdrawnToken.token.decimals),
              amountInUSD: parseUsdPrice(
                withdrawnToken.token,
                newTokenBalanceAmount,
                parseNumberUsdPriceToBigInt(withdrawnToken.token.price)
              ).toString(),
            },
          };
        });
        modifiedStrategy.lastUpdatedAt = nowInSeconds();
        modifiedStrategy.balances = newBalances;
        modifiedStrategy.historicalBalances.push({
          balances: newBalances,
          timestamp: nowInSeconds(),
        });

        // Update Delayed Withdraw Data
        const assetToken = toToken({ ...strategy.farm.asset, chainId: strategy.farm.chainId });
        const assetWithdrew = withdrawn.find((w) => isSameToken(w.token, assetToken));

        const hasInitiatedDelayedWithdraw =
          assetWithdrew && BigInt(assetWithdrew.amount) > 0n && assetWithdrew.withdrawType === WithdrawType.DELAYED;

        if (hasInitiatedDelayedWithdraw) {
          modifiedStrategy.delayed = modifiedStrategy.delayed || [];
          const prevAssetDelayedIndex = modifiedStrategy.delayed.findIndex((d) =>
            isSameToken(toToken({ ...d.token, chainId: strategy.farm.chainId }), assetToken)
          );

          if (prevAssetDelayedIndex !== -1) {
            const newPendingAmount =
              modifiedStrategy.delayed[prevAssetDelayedIndex].pending.amount + BigInt(assetWithdrew.amount);
            modifiedStrategy.delayed[prevAssetDelayedIndex] = {
              ...modifiedStrategy.delayed[prevAssetDelayedIndex],
              pending: {
                amount: newPendingAmount,
                amountInUnits: formatUnits(newPendingAmount, strategy.farm.asset.decimals),
                amountInUSD: parseUsdPrice(
                  assetWithdrew.token,
                  newPendingAmount,
                  parseNumberUsdPriceToBigInt(strategy.farm.asset.price)
                ).toString(),
              },
            };
          } else {
            modifiedStrategy.delayed.push({
              token: assetWithdrew.token,
              ready: {
                amount: 0n,
                amountInUnits: '0',
              },
              pending: {
                amount: BigInt(assetWithdrew.amount),
                amountInUnits: formatUnits(BigInt(assetWithdrew.amount), strategy.farm.asset.decimals),
                amountInUSD: parseUsdPrice(
                  assetWithdrew.token,
                  BigInt(assetWithdrew.amount),
                  parseNumberUsdPriceToBigInt(strategy.farm.asset.price)
                ).toString(),
              },
            });
          }
        }

        // For market withdrawals, we need to create a special history item
        const marketWithdrawnAmounts = withdrawnAmounts
          .filter((w) => w.withdrawType === WithdrawType.MARKET)
          .map((w) => ({
            token: w.token,
            amount: w.amount,
          }));
        const otherWithdrawnAmounts = withdrawnAmounts.filter((w) => w.withdrawType !== WithdrawType.MARKET);

        const specialWithdrewHistoryItem: EarnPositionAction = {
          action: EarnPositionActionType.SPECIAL_WITHDREW,
          recipient: existingUserStrategy.owner,
          withdrawn: marketWithdrawnAmounts,
          tx: {
            hash: transaction.hash,
            timestamp: nowInSeconds(),
          },
        };

        const withdrawHistoryItem: EarnPositionAction = {
          action: EarnPositionActionType.WITHDREW,
          recipient: existingUserStrategy.owner,
          withdrawn: otherWithdrawnAmounts,
          tx: {
            hash: transaction.hash,
            timestamp: nowInSeconds(),
          },
        };

        const withdrawHistoryItems: EarnPositionAction[] = [
          ...(marketWithdrawnAmounts.length > 0 ? [specialWithdrewHistoryItem] : []),
          ...(otherWithdrawnAmounts.length > 0 ? [withdrawHistoryItem] : []),
        ];

        if (modifiedStrategy.history && Array.isArray(modifiedStrategy.history)) {
          modifiedStrategy.history.push(...withdrawHistoryItems);
        } else {
          modifiedStrategy = {
            ...modifiedStrategy,
            history: withdrawHistoryItems,
          };
        }

        if (signedPermit) {
          const companionAddress = this.contractService.getEarnCompanionAddress(transaction.chainId);
          if (!companionAddress) throw new Error('No earn companion address found');

          const companionPermissions = modifiedStrategy.permissions[companionAddress];

          if (!companionPermissions) {
            modifiedStrategy.permissions[companionAddress] = [EarnPermission.WITHDRAW];
          } else {
            modifiedStrategy.permissions[companionAddress].push(EarnPermission.WITHDRAW);
          }
        }

        modifiedStrategy.pendingTransaction = '';

        userStrategies.push(modifiedStrategy);
        break;
      }
      case TransactionTypes.earnClaimDelayedWithdraw: {
        const claimDelayedWithdrawEarnPositionTypeData = transaction.typeData;
        const { positionId, strategyId, claim } = claimDelayedWithdrawEarnPositionTypeData;

        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

        const existingUserStrategy = this.userStrategies.find((s) => s.id === positionId);
        if (!existingUserStrategy) {
          throw new Error('Could not find existing user strategy');
        }

        const strategy = this.allStrategies.find((s) => s.id === strategyId);
        if (!strategy) {
          throw new Error('Could not find strategy');
        }

        let modifiedStrategy = {
          ...existingUserStrategy,
        };

        const claimedToken = modifiedStrategy.delayed?.find((delayedItem) =>
          isSameToken(claim, toToken({ ...delayedItem.token, chainId: strategy.farm.chainId }))
        );

        if (!claimedToken || claimedToken.ready.amount === 0n) {
          throw new Error('Claimed token is not in delayed list or has no pending amount');
        }

        const updatedDelayed = (modifiedStrategy.delayed || []).map((delayedItem) => {
          const sameToken = isSameToken(
            toToken({ ...delayedItem.token, chainId: strategy.farm.chainId }),
            toToken({ ...claimedToken.token, chainId: strategy.farm.chainId })
          );

          if (!sameToken) return delayedItem;

          if (delayedItem.pending.amount === 0n) return;

          return {
            ...delayedItem,
            ready: {
              amount: 0n,
              amountInUnits: '0',
            },
          };
        });

        const parsedDelayed = compact(updatedDelayed);

        modifiedStrategy.delayed = parsedDelayed.length > 0 ? parsedDelayed : undefined;

        const historyItem: EarnPositionDelayedWithdrawalClaimedAction = {
          action: EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED,
          recipient: existingUserStrategy.owner,
          token: claim,
          withdrawn: claimedToken.ready,
          tx: {
            hash: transaction.hash,
            timestamp: nowInSeconds(),
          },
        };

        if (modifiedStrategy.history && Array.isArray(modifiedStrategy.history)) {
          modifiedStrategy.history.push(historyItem);
        } else {
          modifiedStrategy = {
            ...modifiedStrategy,
            history: [historyItem],
          };
        }

        modifiedStrategy.pendingTransaction = '';
        modifiedStrategy.lastUpdatedAt = nowInSeconds();
        userStrategies.push(modifiedStrategy);

        break;
      }
      default:
        userStrategies = [...this.userStrategies];
        break;
    }

    this.userStrategies = userStrategies;
  }

  async transformVaultTokensToUnderlying(tokens: { token: Token; amount: bigint }[]) {
    const response = await this.meanApiService.transformTokensToUnderlying(tokens);
    const underlyingTokens = response.data.underlying;
    return underlyingTokens;
  }
}
