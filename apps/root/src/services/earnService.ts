import {
  ChainId,
  SdkEarnPosition,
  SdkStrategy,
  SummarizedSdkStrategyParameters,
  TokenListId,
  SavedSdkStrategy,
  SavedSdkEarnPosition,
  StrategyId,
  SdkEarnPositionId,
  TokenType,
  TransactionTypes,
  TransactionDetails,
  FeeType,
  EarnPositionActionType,
  AmountsOfToken,
  isEarnType,
  Token,
  EarnPermission,
} from 'common-types';
import { EventsManager } from './eventsManager';
import SdkService from './sdkService';
import { NETWORKS } from '@constants';
import { IntervalSetActions } from '@constants/timing';
import AccountService from './accountService';
import compact from 'lodash/compact';
import { sdkStrategyTokenToToken } from '@common/utils/earn/parsing';
import { Address, formatUnits, maxUint256 } from 'viem';
import { getNewEarnPositionFromTxTypeData } from '@common/utils/transactions';
import { parseUsdPrice, parseNumberUsdPriceToBigInt } from '@common/utils/currency';
import { nowInSeconds } from '@common/utils/time';
import ContractService from './contractService';
import { parseSignatureValues } from '@common/utils/signatures';
import ProviderService from './providerService';

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

  contractService: ContractService;

  providerService: ProviderService;

  constructor(
    sdkService: SdkService,
    accountService: AccountService,
    contractService: ContractService,
    providerService: ProviderService
  ) {
    super(defaultEarnServiceData);

    this.sdkService = sdkService;
    this.accountService = accountService;
    this.contractService = contractService;
    this.providerService = providerService;
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
    this.allStrategies = strategies.map((strategy) => ({ ...strategy, lastUpdatedAt }));
    this.hasFetchedAllStrategies = true;
  }

  needsToUpdateStrategy({ strategyId, chainId }: Parameters<typeof this.sdkService.getDetailedStrategy>[0]) {
    const existingStrategy = this.allStrategies.find((s) => s.id === strategyId && s.farm.chainId === chainId);

    return !(
      existingStrategy &&
      'detailed' in existingStrategy &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      nowInSeconds() - existingStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
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
    const lastUpdatedAt = nowInSeconds();
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

    this.earnPositionsParameters = this.processStrategyParameters(
      strategiesArray.map((userStrategy) => userStrategy.strategy)
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
      nowInSeconds() - existingUserStrategy.lastUpdatedAt < IntervalSetActions.strategyUpdate
    );
  }

  updateUserStrategy(userStrategy: SdkEarnPosition) {
    const userStrategyIndex = this.userStrategies.findIndex((s) => s.id === userStrategy.id);

    const userStrategies = [...this.userStrategies];
    if (userStrategyIndex === -1) {
      userStrategies.push({ ...userStrategy, lastUpdatedAt: nowInSeconds(), strategy: userStrategy.strategy.id });
    } else {
      userStrategies[userStrategyIndex] = {
        ...userStrategies[userStrategyIndex],
        ...userStrategy,
        lastUpdatedAt: nowInSeconds(),
        strategy: userStrategy.strategy.id,
      };

      if ('history' in userStrategy) {
        userStrategies[userStrategyIndex] = {
          ...userStrategies[userStrategyIndex],
          history: userStrategy.history,
          detailed: true,
        };
      }
    }

    if (
      this.needsToUpdateStrategy({ strategyId: userStrategy.strategy.id, chainId: userStrategy.strategy.farm.chainId })
    ) {
      this.updateStrategy({ strategy: userStrategy.strategy });
    }

    this.userStrategies = userStrategies;
  }

  async fetchUserStrategy(
    strategyId: Parameters<typeof this.sdkService.getUserStrategy>[0],
    updateStrategies?: boolean
  ) {
    const needsToUpdate = this.needsToUpdateUserStrategy(strategyId);

    if (!needsToUpdate) {
      return;
    }

    const userStrategy = await this.sdkService.getUserStrategy(strategyId);

    if (updateStrategies) {
      this.updateUserStrategy(userStrategy);
    }

    return userStrategy;
  }

  async fetchMultipleEarnPositionsFromStrategy(strategyId: StrategyId) {
    const userStrategies = this.userStrategies;

    const positionsToFetch = userStrategies.filter((strat) => strat.strategy === strategyId);

    const promises = positionsToFetch.map((position) =>
      this.fetchUserStrategy(position.id, false).catch((e) => {
        console.error('Error fetching user strategy', e);
        return null;
      })
    );

    const results = compact(await Promise.all(promises));

    results.forEach((result) => {
      this.updateUserStrategy(result);
    });
  }

  async increasePosition({
    earnPositionId,
    amount,
  }: {
    earnPositionId: SdkEarnPositionId;
    amount: bigint;
    signature?: { deadline: number; nonce: bigint; rawSignature: string };
  }) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }
    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    return this.accountService.web3Service.walletService.transferToken({
      from: '0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555'.toLowerCase() as Address,
      to: '0x1a00e1E311009E56e3b0B9Ed6F86f5Ce128a1C01'.toLowerCase() as Address,
      token: {
        ...sdkStrategyTokenToToken(
          strategy.farm.asset,
          `${strategy.farm.chainId}-${strategy.farm.asset.address}` as TokenListId,
          {},
          strategy.farm.chainId
        ),
        type: TokenType.ERC20_TOKEN,
      },
      amount,
    });
  }

  async createPosition({
    strategyId,
    amount,
  }: {
    strategyId: StrategyId;
    amount: bigint;
    signature?: { deadline: number; nonce: bigint; rawSignature: string };
  }) {
    const strategy = this.allStrategies.find((s) => s.id === strategyId);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    return this.accountService.web3Service.walletService.transferToken({
      from: '0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555'.toLowerCase() as Address,
      to: '0x1a00e1E311009E56e3b0B9Ed6F86f5Ce128a1C01'.toLowerCase() as Address,
      token: {
        ...sdkStrategyTokenToToken(
          strategy.farm.asset,
          `${strategy.farm.chainId}-${strategy.farm.asset.address}` as TokenListId,
          {},
          strategy.farm.chainId
        ),
        type: TokenType.ERC20_TOKEN,
      },
      amount,
    });
  }

  async withdrawPosition({
    earnPositionId,
    withdraw,
  }: {
    earnPositionId: SdkEarnPositionId;
    withdraw: {
      amount: bigint;
      token: Token;
      convertTo?: Address;
    }[];
  }) {
    const userStrategy = this.userStrategies.find((s) => s.id === earnPositionId);

    if (!userStrategy) {
      throw new Error('Could not find userStrategy');
    }
    const strategy = this.allStrategies.find((s) => s.id === userStrategy.strategy);

    if (!strategy) {
      throw new Error('Could not find strategy');
    }

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;
    const hasPermission = await this.companionHasPermission(earnPositionId, EarnPermission.WITHDRAW);

    if (!hasPermission) {
      const companionAddress = this.contractService.getEarnCompanionAddress(strategy.farm.chainId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      permissionPermit = await this.getSignatureForPermission({
        earnPosition: userStrategy,
        chainId: strategy.farm.chainId,
        contractAddress: companionAddress,
        permission: EarnPermission.WITHDRAW,
      });
    }

    const dummyAmmount = withdraw[0].amount;

    return this.accountService.web3Service.walletService.transferToken({
      from: '0xf488aaf75D987cC30a84A2c3b6dA72bd17A0a555'.toLowerCase() as Address,
      to: '0x1a00e1E311009E56e3b0B9Ed6F86f5Ce128a1C01'.toLowerCase() as Address,
      token: {
        ...sdkStrategyTokenToToken(
          strategy.farm.asset,
          `${strategy.farm.chainId}-${strategy.farm.asset.address}` as TokenListId,
          {},
          strategy.farm.chainId
        ),
        type: TokenType.ERC20_TOKEN,
      },
      amount: dummyAmmount,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async fillAddressPermissions({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    earnPosition,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chainId,
    contractAddress,
    permission,
  }: {
    earnPosition: SavedSdkEarnPosition;
    chainId: number;
    contractAddress: Address;
    permission: EarnPermission;
  }) {
    // const provider = this.providerService.getProvider(chainId);

    // TODO: Get Vault contract

    // const vaultInstance = getContract({
    //   abi: VAULT_ABI,
    //   address: vaultAddress,
    //   client: provider,
    // });

    // const [hasIncrease, hasWithdraw] = await Promise.all([
    //   vaultInstance.read.hasPermission([BigInt(positionId), contractAddress, EarnPermission.INCREASE]),
    //   vaultInstance.read.hasPermission([BigInt(positionId), contractAddress, EarnPermission.WITHDRAW]),
    // ]);

    const defaultPermissions: EarnPermission[] = [
      // ...(hasIncrease ? [EarnPermission.INCREASE] : []),
      // ...(hasWithdraw ? [EarnPermission.WITHDRAW] : []),
    ];

    return [{ operator: contractAddress, permissions: [...defaultPermissions, permission] }];
  }

  async getSignatureForPermission({
    earnPosition,
    chainId,
    contractAddress,
    permission,
  }: {
    earnPosition: SavedSdkEarnPosition;
    chainId: number;
    contractAddress: Address;
    permission: EarnPermission;
  }) {
    const signer = await this.providerService.getSigner(earnPosition.owner, chainId);
    if (!signer) {
      throw new Error('No signer found');
    }

    const PermissionSet = [
      { name: 'operator', type: 'address' },
      { name: 'permissions', type: 'uint8[]' },
    ];

    const PermissionPermits = [
      { name: 'permissions', type: 'PermissionSet[]' },
      { name: 'tokenId', type: 'uint256' },
      // { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const permissions = await this.fillAddressPermissions({
      chainId,
      earnPosition,
      contractAddress,
      permission,
    });

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await signer.signTypedData({
      domain: {
        // name: signName,
        // version: SIGN_VERSION[position.version],
        chainId: chainId,
        // verifyingContract: permissionManagerAddress,
      },
      types: { PermissionSet, PermissionPermit: PermissionPermits },
      message: {
        tokenId: earnPosition.id,
        permissions,
        // nonce: nextNonce,
        deadline: maxUint256 - 1n,
      },
      account: earnPosition.owner,
      primaryType: 'PermissionPermit',
    });

    const fixedSignature = parseSignatureValues(rawSignature);

    return {
      permissions,
      deadline: maxUint256 - 1n,
      v: fixedSignature.v,
      r: fixedSignature.r,
      s: fixedSignature.s,
      yParity: fixedSignature.yParity,
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
        ?.guardian?.fees.find((fee) => fee.type === FeeType.deposit);
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

        const depositFee = this.allStrategies
          .find((s) => s.id === strategyId)
          ?.guardian?.fees.find((fee) => fee.type === FeeType.deposit);

        const newUserStrategy = getNewEarnPositionFromTxTypeData({
          newEarnPositionTypeData,
          user: transaction.from as Address,
          id: positionId,
          depositFee: depositFee?.percentage,
          transaction: transaction.hash,
        });

        userStrategies.push(newUserStrategy);
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
          ?.guardian?.fees.find((fee) => fee.type === FeeType.deposit);
        let depositedAmountWithoutFee: AmountsOfToken | undefined;
        if (depositFee) {
          const feeAmount = (depositedAmount.amount * BigInt(depositFee.percentage * 100)) / 10000n;

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

        if ('history' in modifiedStrategy) {
          modifiedStrategy.history.push({
            timestamp: nowInSeconds(),
            action: EarnPositionActionType.INCREASED,
            deposited: depositedAmount,
            assetPrice: asset.price,
            tx: {
              hash: transaction.hash,
              timestamp: nowInSeconds(),
            },
          });
        }
        modifiedStrategy.pendingTransaction = '';

        userStrategies.push(modifiedStrategy);
        break;
      }
      case TransactionTypes.earnWithdraw: {
        const withdrawEarnPositionTypeData = transaction.typeData;
        // const { positionId, strategyId, asset, assetAmount: assetAmountString } = withdrawEarnPositionTypeData;
        const { positionId, strategyId, withdrawn } = withdrawEarnPositionTypeData;
        // const assetAmount = BigInt(assetAmountString);
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

        const withdrawnAmounts: { token: Token; amount: AmountsOfToken }[] = withdrawn.map((withdrawnAmount) => ({
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
              ).toFixed(2),
            },
          };
        });
        modifiedStrategy.lastUpdatedAt = nowInSeconds();
        modifiedStrategy.balances = newBalances;
        modifiedStrategy.historicalBalances.push({
          balances: newBalances,
          timestamp: nowInSeconds(),
        });

        if ('history' in modifiedStrategy) {
          modifiedStrategy.history.push({
            timestamp: nowInSeconds(),
            action: EarnPositionActionType.WITHDREW,
            recipient: existingUserStrategy.owner,
            withdrawn: withdrawnAmounts,
            tx: {
              hash: transaction.hash,
              timestamp: nowInSeconds(),
            },
          });
        }
        modifiedStrategy.pendingTransaction = '';

        const userHasRemainingFunds = modifiedStrategy.balances.some((balance) => balance.amount.amount > 0n);

        if (userHasRemainingFunds) {
          userStrategies.push(modifiedStrategy);
        }
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
    const companionAddress = this.contractService.getEarnCompanionAddress(strategy.farm.chainId);

    // TODO: Call 'hasPermissions' on the Vault contract

    return !!companionAddress;
  }
}
