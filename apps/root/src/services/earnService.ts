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
} from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import { IntervalSetActions } from '@constants/timing';
import AccountService from './accountService';
import compact from 'lodash/compact';
import { Address, formatUnits, Hex, maxUint256 } from 'viem';
import { parseSignatureValues } from '@common/utils/signatures';
import { EARN_COMPANION_ADDRESS } from '../constants/addresses';
import { getNewEarnPositionFromTxTypeData } from '@common/utils/transactions';
import { parseUsdPrice, parseNumberUsdPriceToBigInt, toToken, isSameToken } from '@common/utils/currency';
import { nowInSeconds } from '@common/utils/time';
import ProviderService from './providerService';
import { PermitData } from '@balmy/sdk';
import { EarnPermissionData } from '@balmy/sdk/dist/services/earn/types';
import ContractService from './contractService';
import { mapPermission } from '@balmy/sdk/dist/services/earn/earn-service';
import { getWrappedProtocolToken } from '@common/mocks/tokens';

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
    farms: {},
    guardians: {},
    tokens: {
      assets: {},
      rewards: {},
    },
    networks: {},
    yieldTypes: [],
  },
  earnPositionsParameters: {
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

  providerService: ProviderService;

  contractService: ContractService;

  constructor(
    sdkService: SdkService,
    accountService: AccountService,
    providerService: ProviderService,
    contractService: ContractService
  ) {
    super(defaultEarnServiceData);

    this.sdkService = sdkService;
    this.accountService = accountService;
    this.providerService = providerService;
    this.contractService = contractService;
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

    return summarizedParameters;
  }

  async fetchAllStrategies(): Promise<void> {
    this.hasFetchedAllStrategies = false;
    const strategies = await this.sdkService.getAllStrategies();
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
      'detailed' in existingStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      nowInSeconds() - existingStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
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

  batchUpdateUserStrategies(userStrategies: SdkEarnPosition[]) {
    let storedUserStrategies = [...this.userStrategies];

    userStrategies.forEach((strategy) => {
      const updatedUserStrategies = this.updateUserStrategy(strategy, storedUserStrategies);
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

    this.updateStrategy({ strategy: { ...strategy, detailed: true } });
  }

  async fetchUserStrategies(): Promise<SdkEarnPosition[]> {
    this.hasFetchedUserStrategies = false;
    const accounts = this.accountService.getWallets();
    const addresses = accounts.map((account) => account.address);
    const userStrategies = await this.sdkService.getUserStrategies({ accounts: addresses });
    const lastUpdatedAt = nowInSeconds();
    const strategiesArray = Object.values(userStrategies).reduce((acc, strategies) => {
      acc.push(...strategies);
      return acc;
    }, []);

    const savedUserStrategies = strategiesArray.map<SavedSdkEarnPosition>((strategy) => ({
      ...strategy,
      lastUpdatedAt,
      strategy: strategy.strategy.id,
      historicalBalances: strategy.historicalBalances || [],
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
      'detailed' in existingUserStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      nowInSeconds() - existingUserStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
    );
  }

  updateUserStrategy(userStrategy: SdkEarnPosition, savedUserStrategies: SavedSdkEarnPosition[]) {
    const userStrategyIndex = savedUserStrategies.findIndex((s) => s.id === userStrategy.id);

    const updatedUserStrategies = [...savedUserStrategies];

    if (userStrategyIndex === -1) {
      const newStrat: SavedSdkEarnPosition = {
        ...userStrategy,
        lastUpdatedAt: nowInSeconds(),
        strategy: userStrategy.strategy.id,
        historicalBalances: userStrategy.historicalBalances || [],
        ...(!!userStrategy.history ? { detailed: true } : {}),
      };
      updatedUserStrategies.push(newStrat);
    } else {
      const updatedBalances = userStrategy.balances.map((balance) => ({
        ...balance,
        profit:
          userStrategy.balances.find((fetchedBalance) => fetchedBalance.token.address === balance.token.address)
            ?.profit || balance.profit,
      }));

      const updatedDelayed = userStrategy.delayed;

      updatedUserStrategies[userStrategyIndex] = {
        ...updatedUserStrategies[userStrategyIndex],
        lastUpdatedAt: nowInSeconds(),
        strategy: userStrategy.strategy.id,
        historicalBalances:
          userStrategy.historicalBalances || updatedUserStrategies[userStrategyIndex].historicalBalances || [],
        balances: updatedBalances,
        delayed: updatedDelayed,
      };

      if (!!userStrategy.history && !updatedUserStrategies[userStrategyIndex].history) {
        updatedUserStrategies[userStrategyIndex] = {
          ...updatedUserStrategies[userStrategyIndex],
          history: userStrategy.history,
          detailed: true,
        };
      }
    }

    if (this.needsToUpdateStrategy({ strategyId: userStrategy.strategy.id })) {
      this.updateStrategy({ strategy: userStrategy.strategy });
    }

    return updatedUserStrategies;
  }

  async fetchUserStrategy(strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0]) {
    const needsToUpdate = this.needsToUpdateUserStrategy(strategyId);

    if (!needsToUpdate) {
      return;
    }

    const userStrategy = await this.sdkService.getUserStrategy(strategyId);

    return userStrategy;
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

    this.batchUpdateUserStrategies(results);
  }

  async increasePosition({
    earnPositionId,
    amount,
    permitSignature,
    permissionSignature,
  }: {
    earnPositionId: SdkEarnPositionId;
    amount: bigint;
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
            token: strategy.farm.asset.address,
            nonce: permitSignature.nonce,
            deadline: BigInt(permitSignature.deadline),
          },
          signature: permitSignature.signature,
        }
      : {
          token: strategy.farm.asset.address,
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
    permitSignature,
    tosSignature,
  }: {
    strategyId: StrategyId;
    user: Address;
    amount: bigint;
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
            token: strategy.farm.asset.address,
            nonce: permitSignature.nonce,
            deadline: BigInt(permitSignature.deadline),
          },
          signature: permitSignature.signature,
        }
      : {
          token: strategy.farm.asset.address,
          amount: amount,
        };

    const earnCompanionAddress = this.contractService.getEarnCompanionAddress(strategy.farm.chainId);

    const permissions = [
      {
        operator: earnCompanionAddress,
        permissions: [EarnPermission.INCREASE],
      },
    ];

    const wrappedProtocol = getWrappedProtocolToken(strategy.farm.chainId);

    // We ensure withdraw permission if the withdrawn token needs the be swaped in the process
    const hasSomeDelayedWithdraw =
      strategy.farm.asset.withdrawTypes.includes(WithdrawType.DELAYED) ||
      strategy.farm.rewards?.tokens.some((t) => t.withdrawTypes.includes(WithdrawType.DELAYED));

    if (strategy.farm.asset.address === wrappedProtocol.address || hasSomeDelayedWithdraw) {
      permissions.push({
        operator: earnCompanionAddress,
        permissions: [EarnPermission.WITHDRAW],
      });
    }

    const tx = await this.sdkService.buildEarnCreatePositionTx({
      chainId: strategy.farm.chainId,
      strategyId: strategy.id,
      owner: user,
      // We dont operate with smart wallets so we always need this
      permissions,
      deposit,
      strategyValidationData: tosSignature,
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: user,
      chainId: strategy.farm.chainId,
    });
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
      const originalTokenBalance = userStrategy.balances.find(
        (b) => b.token.address.toLowerCase() === w.token.address.toLowerCase()
      );

      const shouldWithdrawMax =
        originalTokenBalance?.amount.amount !== 0n && originalTokenBalance?.amount.amount === w.amount;

      const amount = shouldWithdrawMax ? maxUint256 : w.amount;
      return {
        token: w.token.address,
        amount,
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
      const newUserStrategy = getNewEarnPositionFromTxTypeData({
        newEarnPositionTypeData,
        user: transaction.from as Address,
        id: positionId,
        transaction: transaction.hash,
        depositFee: depositFee?.percentage,
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

        const earnVaultAddress = this.contractService.getEarnVaultAddress(transaction.chainId);

        const depositFee = this.allStrategies
          .find((s) => s.id === strategyId)
          ?.guardian?.fees.find((fee) => fee.type === FeeType.DEPOSIT);

        const newUserStrategy = getNewEarnPositionFromTxTypeData({
          newEarnPositionTypeData,
          user: transaction.from as Address,
          id: `${transaction.chainId}-${earnVaultAddress}-${Number(positionId)}`,
          depositFee: depositFee?.percentage,
          transaction: transaction.hash,
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
        const { positionId, strategyId, asset, assetAmount: assetAmountString } = increaseEarnPositionTypeData;
        const assetAmount = BigInt(assetAmountString);
        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];
        const existingUserStrategy = this.userStrategies.find((s) => s.id === positionId);

        if (!existingUserStrategy) {
          throw new Error('Could not find existing user strategy');
        }

        const modifiedStrategy = {
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

        const historyItem: EarnPositionAction = {
          action: EarnPositionActionType.INCREASED,
          deposited: depositedAmount,
          assetPrice: asset.price,
          tx: {
            timestamp: nowInSeconds(),
            hash: transaction.hash,
          },
        };

        if ('detailed' in modifiedStrategy) {
          modifiedStrategy.history.push(historyItem);
        } else {
          modifiedStrategy.history = [historyItem];
        }

        modifiedStrategy.pendingTransaction = '';

        userStrategies.push(modifiedStrategy);
        break;
      }
      case TransactionTypes.earnWithdraw: {
        const withdrawEarnPositionTypeData = transaction.typeData;
        const { positionId, strategyId, withdrawn } = withdrawEarnPositionTypeData;

        userStrategies = [...this.userStrategies.filter((s) => s.id !== positionId)];

        const existingUserStrategy = this.userStrategies.find((s) => s.id === positionId);
        if (!existingUserStrategy) {
          throw new Error('Could not find existing user strategy');
        }

        const strategy = this.allStrategies.find((s) => s.id === strategyId);
        if (!strategy) {
          throw new Error('Could not find strategy');
        }

        const modifiedStrategy = {
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

        const historyItem: EarnPositionAction = {
          action: EarnPositionActionType.WITHDREW,
          recipient: existingUserStrategy.owner,
          withdrawn: withdrawnAmounts,
          tx: {
            hash: transaction.hash,
            timestamp: nowInSeconds(),
          },
        };

        if ('detailed' in modifiedStrategy) {
          modifiedStrategy.history.push(historyItem);
        } else {
          modifiedStrategy.history = [historyItem];
        }

        modifiedStrategy.pendingTransaction = '';

        userStrategies.push(modifiedStrategy);

        break;
      }
      default:
        userStrategies = [...this.userStrategies];
        break;
    }

    this.userStrategies = userStrategies;
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async companionHasPermission(earnPositionId: SdkEarnPositionId, permission: EarnPermission) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }
    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }
    const companionAddress = EARN_COMPANION_ADDRESS[strategy.farm.chainId];

    // TODO: Call 'hasPermissions' on the Vault contract

    return !!companionAddress;
  }
}
