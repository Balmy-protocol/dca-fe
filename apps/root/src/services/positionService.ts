/* eslint-disable no-await-in-loop */
import keyBy from 'lodash/keyBy';
import {
  parseUnits,
  TransactionRequest,
  maxUint256,
  getContract,
  Address,
  encodeFunctionData,
  formatUnits,
} from 'viem';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';
import {
  Token,
  Position,
  PositionKeyBy,
  TransactionDetails,
  NFTData,
  PositionPermission,
  TransactionTypes,
  PermissionSet as IPermissionSet,
  TokenType,
  SubmittedTransaction,
  PreparedTransactionRequest,
  PositionVersions,
  PositionWithHistory,
  isDcaType,
  // DcaTransactionTypes,
} from '@types';

// ABIS
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import {
  MAX_UINT_32,
  SUPPORTED_NETWORKS_DCA,
  POSITION_VERSION_2,
  LATEST_VERSION,
  SIGN_VERSION,
  PERMISSIONS,
  SDK_POSITION_STATUS_TO_POSITION_STATUSES,
  HUB_ADDRESS,
} from '@constants';
import { emptyTokenWithAddress, parseNumberUsdPriceToBigInt, parseUsdPrice, toToken } from '@common/utils/currency';
import { findHubAddressVersion, mapSdkAmountsOfToken, sdkDcaTokenToYieldOption } from '@common/utils/parsing';
import { doesCompanionNeedIncreaseOrReducePermission } from '@common/utils/companion';
import { parsePermissionsForSdk, sdkPermissionsToPermissionData } from '@common/utils/sdk';
import { AddFunds } from '@balmy/sdk';
import ContractService from './contractService';
import WalletService from './walletService';
import PairService from './pairService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import SafeService from './safeService';
import Permit2Service from './permit2Service';
import SdkService from './sdkService';
import AccountService from './accountService';
import { ArrayOneOrMore } from '@balmy/sdk/dist/utility-types';
import { isUndefined, some } from 'lodash';
import { abs } from '@common/utils/bigint';
import { EventsManager } from './eventsManager';
import { getNewPositionFromTxTypeData } from '@common/utils/transactions';
import { parseSignatureValues } from '@common/utils/signatures';

export interface PositionServiceData {
  currentPositions: PositionKeyBy;

  pastPositions: PositionKeyBy;

  hasFetchedCurrentPositions: boolean;

  hasFetchedPastPositions: boolean;

  hasFetchedUserHasPositions: boolean;

  userHasPositions: boolean;
}

const initialState: PositionServiceData = {
  hasFetchedCurrentPositions: false,
  hasFetchedPastPositions: false,
  currentPositions: {},
  pastPositions: {},
  hasFetchedUserHasPositions: false,
  userHasPositions: false,
};

export default class PositionService extends EventsManager<PositionServiceData> {
  contractService: ContractService;

  providerService: ProviderService;

  walletService: WalletService;

  pairService: PairService;

  meanApiService: MeanApiService;

  safeService: SafeService;

  permit2Service: Permit2Service;

  sdkService: SdkService;

  accountService: AccountService;

  constructor(
    walletService: WalletService,
    pairService: PairService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    safeService: SafeService,
    providerService: ProviderService,
    permit2Service: Permit2Service,
    sdkService: SdkService,
    accountService: AccountService
  ) {
    super(initialState);
    this.accountService = accountService;
    this.contractService = contractService;
    this.walletService = walletService;
    this.pairService = pairService;
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.safeService = safeService;
    this.permit2Service = permit2Service;
    this.sdkService = sdkService;
  }

  get hasFetchedCurrentPositions() {
    return this.serviceData.hasFetchedCurrentPositions;
  }

  set hasFetchedCurrentPositions(hasFetchedCurrentPositions) {
    this.serviceData = { ...this.serviceData, hasFetchedCurrentPositions };
  }

  get hasFetchedPastPositions() {
    return this.serviceData.hasFetchedPastPositions;
  }

  set hasFetchedPastPositions(hasFetchedPastPositions) {
    this.serviceData = { ...this.serviceData, hasFetchedPastPositions };
  }

  get currentPositions() {
    return this.serviceData.currentPositions;
  }

  set currentPositions(currentPositions) {
    this.serviceData = { ...this.serviceData, currentPositions };
  }

  get pastPositions() {
    return this.serviceData.pastPositions;
  }

  set pastPositions(pastPositions) {
    this.serviceData = { ...this.serviceData, pastPositions };
  }

  get hasFetchedUserHasPositions() {
    return this.serviceData.hasFetchedUserHasPositions;
  }

  set hasFetchedUserHasPositions(hasFetchedUserHasPositions) {
    this.serviceData = { ...this.serviceData, hasFetchedUserHasPositions };
  }

  get userHasPositions() {
    return this.serviceData.userHasPositions;
  }

  set userHasPositions(userHasPositions) {
    this.serviceData = { ...this.serviceData, userHasPositions };
  }

  getCurrentPositions() {
    return orderBy(values(this.currentPositions), 'startedAt', 'desc');
  }

  getPastPositions() {
    return orderBy(values(this.pastPositions), 'startedAt', 'desc');
  }

  getHasFetchedCurrentPositions() {
    return this.hasFetchedCurrentPositions;
  }

  getHasFetchedPastPositions() {
    return this.hasFetchedPastPositions;
  }

  getUserHasPositions() {
    return this.userHasPositions;
  }

  getHasFetchedUserHasPositions() {
    return this.hasFetchedUserHasPositions;
  }

  logOutUser() {
    this.resetData();
  }

  async fetchUserHasPositions() {
    const accounts = this.accountService.getWallets();
    const isLoggingUser = this.accountService.getIsLoggingUser();

    if (isLoggingUser) {
      return;
    }
    if (!accounts.length) {
      this.hasFetchedUserHasPositions = true;
      this.userHasPositions = false;
      return;
    }

    const results = await this.meanApiService.getUsersHavePositions({
      wallets: accounts.map((wallet) => wallet.address) as ArrayOneOrMore<string>,
    });

    this.userHasPositions = some(Object.values(results.data['owns-positions']), (hasPositions) => !!hasPositions);
    this.hasFetchedUserHasPositions = true;
  }

  async getPosition({
    positionId,
    chainId,
    version,
  }: {
    positionId: number;
    chainId: number;
    version: PositionVersions;
  }) {
    const position = await this.sdkService.getDcaPosition({ positionId, chainId, hub: HUB_ADDRESS[version][chainId] });

    const existingPosition = this.currentPositions[`${chainId}-${position.tokenId}-v${version}`];
    const fromToUse = toToken({ ...position.from, chainId });
    const toToUse = toToken({ ...position.to, chainId });

    const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';

    const userPosition: PositionWithHistory = {
      from: fromToUse,
      to: toToUse,
      user: position.owner as Address,
      swapInterval: BigInt(position.swapInterval),
      swapped: mapSdkAmountsOfToken(position.funds.swapped),
      rate: mapSdkAmountsOfToken(position.rate),
      remainingLiquidity: mapSdkAmountsOfToken(position.funds.remaining),
      remainingSwaps: BigInt(position.remainingSwaps),
      toWithdraw: mapSdkAmountsOfToken(position.funds.toWithdraw),
      totalSwaps: BigInt(position.executedSwaps + position.remainingSwaps),
      isStale: position.isStale,
      pairId: position.pair.variantPairId || position.pair.pairId,
      swappedYield:
        position.generatedByYield && !isUndefined(position.generatedByYield.swapped)
          ? mapSdkAmountsOfToken(position.generatedByYield.swapped)
          : undefined,
      toWithdrawYield:
        position.generatedByYield && !isUndefined(position.generatedByYield.toWithdraw)
          ? mapSdkAmountsOfToken(position.generatedByYield.toWithdraw)
          : undefined,
      remainingLiquidityYield:
        position.generatedByYield && !isUndefined(position.generatedByYield.remaining)
          ? mapSdkAmountsOfToken(position.generatedByYield.remaining)
          : undefined,
      id: `${position.chainId}-${position.tokenId}-v${version}`,
      positionId: position.tokenId,
      status: SDK_POSITION_STATUS_TO_POSITION_STATUSES[position.status],
      totalExecutedSwaps: BigInt(position.executedSwaps),
      pendingTransaction,
      version,
      chainId,
      nextSwapAvailableAt: position.nextSwapAvailableAt,
      startedAt: position.createdAt,
      history: position.history,
      yields: {
        from: sdkDcaTokenToYieldOption(position.from),
        to: sdkDcaTokenToYieldOption(position.to),
      },
      ...(!!position.permissions && { permissions: sdkPermissionsToPermissionData(position.permissions) }),
    };

    return userPosition;
  }

  async fetchCurrentPositions(clearPrevious?: boolean) {
    this.hasFetchedCurrentPositions = false;
    const accounts = this.accountService.getWallets();
    if (!accounts.length) {
      this.currentPositions = {};
      this.hasFetchedCurrentPositions = true;
      return;
    }

    const results = await this.sdkService.getUsersDcaPositions(
      accounts.map((wallet) => wallet.address) as ArrayOneOrMore<string>
    );

    let currentPositions = {
      ...(clearPrevious ? {} : this.currentPositions),
    };

    currentPositions = SUPPORTED_NETWORKS_DCA.reduce<PositionKeyBy>((acc, network) => {
      const positions = results[network];
      if (positions) {
        return {
          ...acc,
          ...keyBy(
            positions
              .filter((position) => position.status !== 'terminated')
              .map<Position>((position) => {
                const version = findHubAddressVersion(position.hub);
                const existingPosition = currentPositions[`${network}-${position.tokenId}-v${version}`];
                const fromToUse = toToken({ ...position.from, chainId: network });
                const toToUse = toToken({ ...position.to, chainId: network });

                const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
                const userPosition: Position = {
                  from: fromToUse,
                  to: toToUse,
                  user: position.owner as Address,
                  swapInterval: BigInt(position.swapInterval),
                  swapped: mapSdkAmountsOfToken(position.funds.swapped),
                  rate: mapSdkAmountsOfToken(position.rate),
                  remainingLiquidity: mapSdkAmountsOfToken(position.funds.remaining),
                  remainingSwaps: BigInt(position.remainingSwaps),
                  toWithdraw: mapSdkAmountsOfToken(position.funds.toWithdraw),
                  totalSwaps: BigInt(position.executedSwaps + position.remainingSwaps),
                  isStale: position.isStale,
                  pairId: position.pair.variantPairId || position.pair.pairId,
                  swappedYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.swapped)
                      ? mapSdkAmountsOfToken(position.generatedByYield.swapped)
                      : undefined,
                  toWithdrawYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.toWithdraw)
                      ? mapSdkAmountsOfToken(position.generatedByYield.toWithdraw)
                      : undefined,
                  remainingLiquidityYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.remaining)
                      ? mapSdkAmountsOfToken(position.generatedByYield.remaining)
                      : undefined,
                  id: `${position.chainId}-${position.tokenId}-v${version}`,
                  positionId: position.tokenId,
                  status: SDK_POSITION_STATUS_TO_POSITION_STATUSES[position.status],
                  totalExecutedSwaps: BigInt(position.executedSwaps),
                  pendingTransaction,
                  version,
                  chainId: network,
                  nextSwapAvailableAt: position.nextSwapAvailableAt,
                  startedAt: position.createdAt,
                  yields: {
                    from: sdkDcaTokenToYieldOption(position.from),
                    to: sdkDcaTokenToYieldOption(position.to),
                  },
                  ...(!!position.permissions && { permissions: sdkPermissionsToPermissionData(position.permissions) }),
                };

                return userPosition;
              }),
            'id'
          ),
        };
      }
      return acc;
    }, currentPositions);

    this.currentPositions = currentPositions;
    this.hasFetchedCurrentPositions = true;
  }

  async fetchPastPositions() {
    this.hasFetchedPastPositions = false;

    const accounts = this.accountService.getWallets();
    if (!accounts.length) {
      this.pastPositions = {};
      this.hasFetchedPastPositions = true;
      return;
    }

    const results = await this.sdkService.getUsersDcaPositions(
      accounts.map((wallet) => wallet.address) as ArrayOneOrMore<string>
    );

    let pastPositions = {
      ...this.pastPositions,
    };

    pastPositions = SUPPORTED_NETWORKS_DCA.reduce<PositionKeyBy>((acc, network) => {
      const positions = results[network];
      if (positions) {
        return {
          ...acc,
          ...keyBy(
            positions
              .filter((position) => position.status === 'terminated')
              .map<Position>((position) => {
                const version = findHubAddressVersion(position.hub);
                const existingPosition = this.currentPositions[`${network}-${position.tokenId}-v${version}`];
                const fromToUse = toToken({ ...position.from, chainId: network });
                const toToUse = toToken({ ...position.to, chainId: network });

                const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
                const userPosition: Position = {
                  from: fromToUse,
                  to: toToUse,
                  user: position.owner as Address,
                  swapInterval: BigInt(position.swapInterval),
                  swapped: mapSdkAmountsOfToken(position.funds.swapped),
                  rate: mapSdkAmountsOfToken(position.rate),
                  remainingLiquidity: mapSdkAmountsOfToken(position.funds.remaining),
                  remainingSwaps: BigInt(position.remainingSwaps),
                  toWithdraw: mapSdkAmountsOfToken(position.funds.toWithdraw),
                  totalSwaps: BigInt(position.executedSwaps + position.remainingSwaps),
                  isStale: position.isStale,
                  pairId: position.pair.variantPairId || position.pair.pairId,
                  swappedYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.swapped)
                      ? mapSdkAmountsOfToken(position.generatedByYield.swapped)
                      : undefined,
                  toWithdrawYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.toWithdraw)
                      ? mapSdkAmountsOfToken(position.generatedByYield.toWithdraw)
                      : undefined,
                  remainingLiquidityYield:
                    position.generatedByYield && !isUndefined(position.generatedByYield.remaining)
                      ? mapSdkAmountsOfToken(position.generatedByYield.remaining)
                      : undefined,
                  id: `${position.chainId}-${position.tokenId}-v${version}`,
                  positionId: position.tokenId,
                  status: SDK_POSITION_STATUS_TO_POSITION_STATUSES[position.status],
                  totalExecutedSwaps: BigInt(position.executedSwaps),
                  pendingTransaction,
                  version,
                  chainId: network,
                  nextSwapAvailableAt: position.nextSwapAvailableAt,
                  startedAt: position.createdAt,
                  yields: {
                    from: sdkDcaTokenToYieldOption(position.from),
                    to: sdkDcaTokenToYieldOption(position.to),
                  },
                  ...(!!position.permissions && { permissions: sdkPermissionsToPermissionData(position.permissions) }),
                };

                return userPosition;
              }),
            'id'
          ),
        };
      }
      return acc;
    }, pastPositions);

    this.pastPositions = pastPositions;
    this.hasFetchedPastPositions = true;
  }

  async fetchPositionSwapsForCSV(position: Position) {
    console.log('fetchPositionSwapsForCSV', position);
    const hub = HUB_ADDRESS[position.version][position.chainId];
    const positionId = `${position.chainId}-${hub}-${position.positionId}`;
    const apiData = await this.meanApiService.getDcaSwapsForExport([positionId]);
    console.log('apiData', apiData, positionId, hub, position);
    return apiData.data;
  }

  // POSITION METHODS
  async fillAddressPermissions(
    position: Position,
    contractAddress: Address,
    permission: PERMISSIONS,
    permissionManagerAddressProvided?: Address
  ) {
    const provider = this.providerService.getProvider(position.chainId);
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || this.contractService.getPermissionManagerAddress(position.chainId, version);
    if (!permissionManagerAddress) throw new Error('No permission manager address found');

    const permissionManagerInstance = getContract({
      abi: PERMISSION_MANAGER_ABI,
      address: permissionManagerAddress,
      client: provider,
    });

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.read.hasPermission([BigInt(positionId), contractAddress, PERMISSIONS.INCREASE]),
      permissionManagerInstance.read.hasPermission([BigInt(positionId), contractAddress, PERMISSIONS.REDUCE]),
      permissionManagerInstance.read.hasPermission([BigInt(positionId), contractAddress, PERMISSIONS.WITHDRAW]),
      permissionManagerInstance.read.hasPermission([BigInt(positionId), contractAddress, PERMISSIONS.TERMINATE]),
    ]);

    const defaultPermissions = [
      ...(hasIncrease ? [PERMISSIONS.INCREASE] : []),
      ...(hasReduce ? [PERMISSIONS.REDUCE] : []),
      ...(hasWithdraw ? [PERMISSIONS.WITHDRAW] : []),
      ...(hasTerminate ? [PERMISSIONS.TERMINATE] : []),
    ];

    return [{ operator: contractAddress, permissions: [...defaultPermissions, permission] }];
  }

  async getSignatureForPermission(
    position: Position,
    contractAddress: Address,
    permission: PERMISSIONS,
    permissionManagerAddressProvided?: Address,
    erc712Name?: string
  ) {
    const signer = await this.providerService.getSigner(position.user, position.chainId);
    if (!signer) {
      throw new Error('No signer found');
    }
    const provider = this.providerService.getProvider(position.chainId);
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || this.contractService.getPermissionManagerAddress(position.chainId, version);
    if (!permissionManagerAddress) throw new Error('No permission manager address found');

    const signName = erc712Name || 'Mean Finance - DCA Position';

    const permissionManagerInstance = getContract({
      abi: PERMISSION_MANAGER_ABI,
      address: permissionManagerAddress,
      client: {
        wallet: signer,
        public: provider,
      },
    });

    const nextNonce = await permissionManagerInstance.read.nonces([position.user]);

    const PermissionSet = [
      { name: 'operator', type: 'address' },
      { name: 'permissions', type: 'uint8[]' },
    ];

    const PermissionPermits = [
      { name: 'permissions', type: 'PermissionSet[]' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const permissions = await this.fillAddressPermissions(
      position,
      contractAddress,
      permission,
      permissionManagerAddressProvided
    );

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await signer.signTypedData({
      domain: {
        name: signName,
        version: SIGN_VERSION[position.version],
        chainId: position.chainId,
        verifyingContract: permissionManagerAddress,
      },
      types: { PermissionSet, PermissionPermit: PermissionPermits },
      message: { tokenId: positionId, permissions, nonce: nextNonce, deadline: maxUint256 - 1n },
      account: position.user,
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

  async companionHasPermission(position: Position, permission: number) {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance({
      chainId: position.chainId,
      version: position.version,
      readOnly: true,
    });
    const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);
    if (!permissionManagerInstance || !companionAddress)
      throw new Error('No permission manager instance or companion address found');

    return permissionManagerInstance.read.hasPermission([position.positionId, companionAddress, permission]);
  }

  async getModifyPermissionsTx(position: Position, newPermissions: IPermissionSet[]) {
    const signer = await this.providerService.getSigner(position.user);

    if (!signer) {
      throw new Error('No signer found');
    }

    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance({
      chainId: position.chainId,
      wallet: position.user,
      version: position.version,
      readOnly: false,
    });
    if (!permissionManagerInstance) throw new Error('No permission manager instance found');

    const data = encodeFunctionData({
      ...permissionManagerInstance,
      functionName: 'modify',
      args: [position.positionId, newPermissions],
    });

    return signer.prepareTransactionRequest({
      to: permissionManagerInstance.address,
      data,
      account: position.user,
      chain: null,
    }) as unknown as Promise<PreparedTransactionRequest>;
  }

  async modifyPermissions(position: Position, newPermissions: PositionPermission[]) {
    const tx = await this.getModifyPermissionsTx(
      position,
      newPermissions.map(({ permissions, operator }) => ({
        operator,
        permissions: permissions.map((permission) => PERMISSIONS[permission]),
      }))
    );

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
      chainId: position.chainId,
    });
  }

  async transfer(position: Position, toAddress: Address): Promise<SubmittedTransaction> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance({
      chainId: position.chainId,
      wallet: position.user,
      version: position.version,
      readOnly: false,
    });
    if (!permissionManagerInstance) throw new Error('No permission manager instance found');

    const data = encodeFunctionData({
      ...permissionManagerInstance,
      functionName: 'transferFrom',
      args: [position.user, toAddress, position.positionId],
    });

    const res = await this.providerService.sendTransaction({
      to: permissionManagerInstance.address,
      data,
      chainId: position.chainId,
      from: position.user,
    });

    return {
      hash: res.hash,
      from: position.user,
      chainId: position.chainId,
    };
  }

  async getTokenNFT(position: Position): Promise<NFTData> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance({
      chainId: position.chainId,
      version: position.version,
      readOnly: true,
    });
    if (!permissionManagerInstance) throw new Error('No permission manager instance found');

    const tokenData = await permissionManagerInstance.read.tokenURI([position.positionId]);

    const apiData = await this.meanApiService.getNFTData(tokenData);

    return apiData.data;
  }

  getAllowanceTarget(chainId: number, from: Token, yieldFrom?: Nullable<string>, usePermit2?: boolean) {
    const wrappedProtocolToken = getWrappedProtocolToken(chainId);

    const fromToUse =
      yieldFrom || (from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address);

    return this.sdkService.getDCAAllowanceTarget({
      chainId,
      from: fromToUse,
      depositWith: from.address,
      usePermit2,
    });
  }

  buildDepositParams(
    account: string,
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: bigint,
    frequencyValue: string,
    chainId: number,
    yieldFrom?: string,
    yieldTo?: string
  ) {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigInt(frequencyValue);
    const swapInterval = frequencyType;
    const companionAddress = this.contractService.getHUBCompanionAddress(chainId);
    if (!companionAddress) throw new Error('No companion address found');
    let permissions: number[] = [];

    if (amountOfSwaps > MAX_UINT_32) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (yieldFrom || from.address === PROTOCOL_TOKEN_ADDRESS) {
      permissions = [...permissions, PERMISSIONS.INCREASE, PERMISSIONS.REDUCE];
    }

    if (yieldTo || to.address === PROTOCOL_TOKEN_ADDRESS) {
      permissions = [...permissions, PERMISSIONS.WITHDRAW];
    }

    if (yieldFrom || yieldTo || from.address === PROTOCOL_TOKEN_ADDRESS || to.address === PROTOCOL_TOKEN_ADDRESS) {
      permissions = [...permissions, PERMISSIONS.TERMINATE];
    }

    return {
      takeFrom: from.address,
      from: from.address,
      to: to.address,
      totalAmmount: weiValue,
      swaps: amountOfSwaps,
      interval: swapInterval,
      account,
      permissions: [{ operator: companionAddress, permissions }],
      yieldFrom,
      yieldTo,
    };
  }

  buildDepositTx(
    owner: string,
    tokenFrom: Token,
    tokenTo: Token,
    fromValue: string,
    frequencyType: bigint,
    frequencyValue: string,
    chainId: number,
    possibleYieldFrom?: string,
    possibleYieldTo?: string,
    signature?: { deadline: number; nonce: bigint; rawSignature: string }
  ) {
    const { takeFrom, from, to, totalAmmount, swaps, interval, account, permissions, yieldFrom, yieldTo } =
      this.buildDepositParams(
        owner,
        tokenFrom,
        tokenTo,
        fromValue,
        frequencyType,
        frequencyValue,
        chainId,
        possibleYieldFrom,
        possibleYieldTo
      );

    const deposit: AddFunds =
      takeFrom.toLowerCase() !== PROTOCOL_TOKEN_ADDRESS.toLowerCase() && signature
        ? {
            permitData: {
              amount: totalAmmount,
              token: takeFrom,
              nonce: signature.nonce,
              deadline: BigInt(signature.deadline),
            },
            signature: signature.rawSignature,
          }
        : { token: takeFrom, amount: totalAmmount };

    const wrappedProtocolToken = getWrappedProtocolToken(chainId);

    const fromToUse =
      yieldFrom || (from.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken.address : from);
    const toToUse =
      yieldTo || (to.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken.address : to);

    return this.sdkService.buildCreatePositionTx({
      chainId,
      from: { address: from, variantId: fromToUse },
      to: { address: to, variantId: toToUse },
      swapInterval: Number(interval),
      amountOfSwaps: Number(swaps),
      owner: account,
      permissions: parsePermissionsForSdk(permissions),
      deposit,
    });
  }

  async approveAndDepositSafe(
    owner: Address,
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: bigint,
    frequencyValue: string,
    chainId: number,
    yieldFrom?: string,
    yieldTo?: string
  ) {
    const { totalAmmount } = this.buildDepositParams(
      owner,
      from,
      to,
      fromValue,
      frequencyType,
      frequencyValue,
      chainId,
      yieldFrom,
      yieldTo
    );

    const currentNetwork = await this.providerService.getNetwork(owner);
    if (!currentNetwork) throw new Error('No network found');

    const allowanceTarget = this.getAllowanceTarget(currentNetwork.chainId, from, yieldFrom, false);

    const approveTx = await this.walletService.buildApproveSpecificTokenTx(owner, from, allowanceTarget, totalAmmount);

    const depositTx = await this.buildDepositTx(
      owner,
      from,
      to,
      fromValue,
      frequencyType,
      frequencyValue,
      chainId,
      yieldFrom,
      yieldTo
    );

    return this.safeService.submitMultipleTxs([approveTx, depositTx]);
  }

  async deposit(
    user: Address,
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: bigint,
    frequencyValue: string,
    chainId: number,
    passedYieldFrom?: string,
    passedYieldTo?: string,
    signature?: { deadline: number; nonce: bigint; rawSignature: string }
  ) {
    const tx = await this.buildDepositTx(
      user,
      from,
      to,
      fromValue,
      frequencyType,
      frequencyValue,
      chainId,
      passedYieldFrom,
      passedYieldTo,
      signature
    );

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: user,
      chainId,
    });
  }

  async withdraw(position: Position, useProtocolToken: boolean) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : position.to;

    if (
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call withdraw without it being protocol token');
    }

    const hasYield = position.to.underlyingTokens.length;

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);
      if (!companionAddress) throw new Error('No companion address found');
      permissionPermit = await this.getSignatureForPermission(position, companionAddress, PERMISSIONS.WITHDRAW);
    }

    const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version || LATEST_VERSION);
    const tx = await this.sdkService.buildWithdrawPositionTx({
      chainId: position.chainId,
      positionId: position.positionId,
      withdraw: {
        convertTo: useProtocolToken ? PROTOCOL_TOKEN_ADDRESS : toToUse.address,
      },
      dcaHub: hubAddress,
      recipient: position.user,
      permissionPermit: permissionPermit && {
        permissions: parsePermissionsForSdk(permissionPermit.permissions),
        deadline: BigInt(permissionPermit.deadline),
        v: permissionPermit.v,
        r: permissionPermit.r,
        s: permissionPermit.s,
        tokenId: position.positionId.toString(),
      },
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
      chainId: position.chainId,
    });
  }

  async withdrawSafe(position: Position) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : position.to;

    const hasYield = position.to.underlyingTokens.length;

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version || LATEST_VERSION);

    const withdrawTx = await this.sdkService.buildWithdrawPositionTx({
      chainId: position.chainId,
      positionId: position.positionId,
      dcaHub: hubAddress,
      withdraw: {
        convertTo: toToUse.address,
      },
      recipient: position.user,
    });

    let txs: TransactionRequest[] = [withdrawTx];
    if (!companionHasPermission && hasYield) {
      const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);
      if (!companionAddress) throw new Error('No companion address found');
      const permissions = await this.fillAddressPermissions(position, companionAddress, PERMISSIONS.WITHDRAW);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async terminate(position: Position, useProtocolToken: boolean) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    if (
      position.from.address !== wrappedProtocolToken.address &&
      position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call terminate without it being protocol token');
    }

    const hasYield =
      (position.from.underlyingTokens.length && position.remainingLiquidity.amount > 0n) ||
      (position.to.underlyingTokens.length && position.toWithdraw.amount > 0n);

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, position.version);

      if (!companionAddress) throw new Error('No companion address found');

      const permissionManagerAddress = this.contractService.getPermissionManagerAddress(
        position.chainId,
        position.version
      );

      const erc712Name = position.version !== POSITION_VERSION_2 ? undefined : 'Mean Finance DCA';

      permissionPermit = await this.getSignatureForPermission(
        position,
        companionAddress,
        PERMISSIONS.TERMINATE,
        permissionManagerAddress,
        erc712Name
      );
    }

    const fromToUse =
      position.from.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
        ? wrappedProtocolToken.address
        : position.from.address;

    const toToUse =
      position.to.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
        ? wrappedProtocolToken.address
        : position.to.address;

    const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version || LATEST_VERSION);

    const tx = await this.sdkService.buildTerminatePositionTx({
      chainId: position.chainId,
      positionId: position.positionId,
      withdraw: {
        unswappedConvertTo: fromToUse,
        swappedConvertTo: toToUse,
      },
      dcaHub: hubAddress,
      recipient: position.user,
      permissionPermit: permissionPermit && {
        permissions: parsePermissionsForSdk(permissionPermit.permissions),
        deadline: permissionPermit.deadline.toString(),
        v: permissionPermit.v,
        r: permissionPermit.r,
        s: permissionPermit.s,
        tokenId: position.positionId.toString(),
      },
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
      chainId: position.chainId,
    });
  }

  async terminateSafe(position: Position) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    const hasYield =
      (position.from.underlyingTokens.length && position.remainingLiquidity.amount > 0n) ||
      (position.to.underlyingTokens.length && position.toWithdraw.amount > 0n);

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    const fromToUse =
      position.from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.from.address;

    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.to.address;

    const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version || LATEST_VERSION);
    const terminateTx = await this.sdkService.buildTerminatePositionTx({
      chainId: position.chainId,
      positionId: position.positionId,
      dcaHub: hubAddress,
      withdraw: {
        unswappedConvertTo: fromToUse,
        swappedConvertTo: toToUse,
      },
      recipient: position.user,
    });

    let txs: TransactionRequest[] = [terminateTx];

    if (!companionHasPermission && hasYield) {
      const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

      if (!companionAddress) throw new Error('No companion address found');

      const permissions = await this.fillAddressPermissions(position, companionAddress, PERMISSIONS.TERMINATE);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async terminateManyRaw(positions: Position[]): Promise<SubmittedTransaction> {
    const { chainId, user } = positions[0];

    // Check that all positions are from the same chain
    const isOneOnDifferentChain = positions.some((position) => position.chainId !== chainId);
    if (isOneOnDifferentChain) {
      throw new Error('Should not call terminate many for positions on different chains');
    }

    const companionInstance = await this.contractService.getHUBCompanionInstance({
      chainId,
      wallet: user,
      version: LATEST_VERSION,
      readOnly: false,
    });

    if (!companionInstance) throw new Error('No companion instance found');

    const terminatesData: Address[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version);
      if (!hubAddress) throw new Error('No hub address found');
      const terminateData = encodeFunctionData({
        ...companionInstance,
        functionName: 'terminate',
        args: [hubAddress, position.positionId, user, user],
      });
      terminatesData.push(terminateData);
    }

    const hash = await companionInstance.write.multicall([terminatesData], { chain: null, account: user });

    return {
      hash,
      from: user,
      chainId,
    };
  }

  async givePermissionToMultiplePositions(
    positions: Position[],
    permissions: PERMISSIONS[],
    permittedAddress: Address
  ) {
    const { chainId, user, version } = positions[0];

    // Check that all positions are from the same chain and same version
    const isOneOnDifferentChainOrVersion = positions.some(
      (position) => position.chainId !== chainId || position.version !== version
    );
    if (isOneOnDifferentChainOrVersion) {
      throw new Error('Should not call give permission many for positions on different chains or versions');
    }

    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance({
      chainId,
      wallet: user,
      version,
      readOnly: false,
    });

    if (!permissionManagerInstance) throw new Error('No permission manager instance found');

    const positionsDataPromises = positions.map(async ({ positionId }) => {
      const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await permissionManagerInstance.read.hasPermissions([
        positionId,
        permittedAddress,
        [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
      ]);

      const defaultPermissions = [
        ...(hasIncrease || permissions.includes(PERMISSIONS.INCREASE) ? [PERMISSIONS.INCREASE] : []),
        ...(hasReduce || permissions.includes(PERMISSIONS.REDUCE) ? [PERMISSIONS.REDUCE] : []),
        ...(hasWithdraw || permissions.includes(PERMISSIONS.WITHDRAW) ? [PERMISSIONS.WITHDRAW] : []),
        ...(hasTerminate || permissions.includes(PERMISSIONS.TERMINATE) ? [PERMISSIONS.TERMINATE] : []),
      ];

      return {
        tokenId: positionId,
        permissionSets: [
          {
            operator: permittedAddress,
            permissions: defaultPermissions,
          },
        ],
      };
    });

    const positionsData = await Promise.all(positionsDataPromises);

    const hash = await permissionManagerInstance.write.modifyMany([positionsData], { chain: null, account: user });

    return {
      hash,
      from: user,
    };
  }

  buildModifyRateAndSwapsParams(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

    if (!companionAddress) throw new Error('No companion address found');

    if (
      position.from.address !== wrappedProtocolToken.address &&
      position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
      useWrappedProtocolToken
    ) {
      throw new Error('Should not call modify rate and swaps without it being protocol token');
    }

    if (BigInt(newSwaps) > MAX_UINT_32) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newAmount = parseUnits(newRateUnderlying, position.from.decimals) * BigInt(newSwaps);
    const remainingLiquidity = position.rate.amount * position.remainingSwaps;

    const isIncrease = newAmount >= remainingLiquidity;

    return {
      id: position.positionId,
      amount: isIncrease ? newAmount - remainingLiquidity : remainingLiquidity - newAmount,
      swaps: BigInt(newSwaps),
      version: position.version,
      account: position.user,
      isIncrease,
      companionAddress,
      tokenFrom:
        position.from.address === PROTOCOL_TOKEN_ADDRESS && useWrappedProtocolToken
          ? wrappedProtocolToken.address
          : position.from.address,
    };
  }

  async getModifyRateAndSwapsSignature(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ) {
    const { companionAddress, isIncrease } = this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );

    const { permissions, deadline, v, r, s, yParity } = await this.getSignatureForPermission(
      position,
      companionAddress,
      isIncrease ? PERMISSIONS.INCREASE : PERMISSIONS.REDUCE
    );

    return {
      permissions,
      deadline: deadline.toString(),
      v,
      r,
      s,
      yParity,
      tokenId: position.positionId,
    };
  }

  async buildModifyRateAndSwapsTx(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean,
    getSignature = true,
    signature?: { deadline: number; nonce: bigint; rawSignature: string }
  ) {
    const { amount, swaps, account, isIncrease, tokenFrom } = this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );
    const hasYield = position.from.underlyingTokens.length;

    const yieldFrom = hasYield && position.from.underlyingTokens[0].address;

    // if it uses signature it means it goes through permit2
    const usesCompanion = tokenFrom === PROTOCOL_TOKEN_ADDRESS || yieldFrom || signature;

    let permissionSignature;

    if (usesCompanion) {
      let companionHasPermission = true;

      if (isIncrease) {
        companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.INCREASE);
      } else {
        companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.REDUCE);
      }

      if (!companionHasPermission && getSignature) {
        permissionSignature = await this.getModifyRateAndSwapsSignature(
          position,
          newRateUnderlying,
          newSwaps,
          useWrappedProtocolToken
        );
      }
    }

    const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version || LATEST_VERSION);

    if (isIncrease) {
      const increase: AddFunds =
        tokenFrom.toLowerCase() !== PROTOCOL_TOKEN_ADDRESS.toLowerCase() && signature
          ? {
              permitData: {
                amount,
                token: tokenFrom,
                nonce: signature.nonce,
                deadline: BigInt(signature.deadline),
              },
              signature: signature.rawSignature,
            }
          : { token: tokenFrom, amount: amount.toString() };

      return this.sdkService.buildIncreasePositionTx({
        chainId: position.chainId,
        positionId: position.positionId,
        dcaHub: hubAddress,
        amountOfSwaps: Number(swaps),
        permissionPermit: permissionSignature && {
          ...permissionSignature,
          tokenId: permissionSignature.tokenId.toString(),
          permissions: parsePermissionsForSdk(permissionSignature.permissions),
        },
        increase,
      });
    }

    const reduce: {
      amountToBuy: string;
      convertTo: string;
    } = { amountToBuy: amount.toString(), convertTo: tokenFrom };

    return this.sdkService.buildReduceToBuyPositionTx({
      chainId: position.chainId,
      positionId: position.positionId,
      dcaHub: hubAddress,
      amountOfSwaps: Number(swaps),
      permissionPermit: permissionSignature && {
        ...permissionSignature,
        tokenId: permissionSignature.tokenId.toString(),
        permissions: parsePermissionsForSdk(permissionSignature.permissions),
      },
      reduce,
      recipient: account,
    });
  }

  async modifyRateAndSwapsSafe(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ) {
    const { amount, tokenFrom, isIncrease } = this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );
    const hasYield = position.from.underlyingTokens.length;

    const allowanceTarget = this.getAllowanceTarget(
      position.chainId,
      emptyTokenWithAddress(tokenFrom),
      (hasYield && position.from.underlyingTokens[0].address) || undefined,
      false
    );

    const modifyTx = await this.buildModifyRateAndSwapsTx(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken,
      false
    );

    let txs: TransactionRequest[] = [modifyTx];

    let fromToUse = position.from;
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    if (fromToUse.address === PROTOCOL_TOKEN_ADDRESS) {
      fromToUse = wrappedProtocolToken;
    }

    const allowance = await this.walletService.getSpecificAllowance(
      useWrappedProtocolToken ? wrappedProtocolToken : position.from,
      allowanceTarget,
      position.user
    );

    const remainingLiquidityDifference = abs(
      position.remainingLiquidity.amount -
        BigInt(newSwaps || '0') * parseUnits(newRateUnderlying || '0', fromToUse.decimals)
    );

    const needsToApprove =
      fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
      allowance.allowance &&
      allowance.token.address !== PROTOCOL_TOKEN_ADDRESS &&
      allowance.token.address === fromToUse.address &&
      isIncrease &&
      parseUnits(allowance.allowance, fromToUse.decimals) < remainingLiquidityDifference;

    const companionNeedsPermission = doesCompanionNeedIncreaseOrReducePermission(position);

    if (needsToApprove) {
      const approveTx = await this.walletService.buildApproveSpecificTokenTx(
        position.user,
        emptyTokenWithAddress(tokenFrom),
        allowanceTarget,
        amount
      );

      txs = [approveTx, ...txs];
    }
    if (companionNeedsPermission) {
      let companionHasPermission = true;

      if (isIncrease) {
        companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.INCREASE);
      } else {
        companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.REDUCE);
      }

      if (!companionHasPermission) {
        const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId);
        if (!companionAddress) throw new Error('No companion address found');

        const permissions = await this.fillAddressPermissions(
          position,
          companionAddress,
          isIncrease ? PERMISSIONS.INCREASE : PERMISSIONS.REDUCE
        );
        const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

        txs = [modifyPermissionTx, ...txs];
      }
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async modifyRateAndSwaps(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean,
    signature?: { deadline: number; nonce: bigint; rawSignature: string }
  ) {
    const tx = await this.buildModifyRateAndSwapsTx(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken,
      true,
      signature
    );

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
      chainId: position.chainId,
    });
  }

  setPendingTransaction(transaction: TransactionDetails) {
    if (!isDcaType(transaction)) {
      return;
    }

    const currentPositions = {
      ...this.currentPositions,
    };

    const { typeData } = transaction;
    let { id } = typeData;

    if (transaction.type === TransactionTypes.newPosition) {
      const newPositionTypeData = transaction.typeData;
      id = `pending-transaction-${transaction.hash}`;

      const newPosition = getNewPositionFromTxTypeData({
        newPositionTypeData,
        chainId: transaction.chainId,
        user: transaction.from as Address,
        id,
        pendingTransaction: transaction.hash,
      });

      currentPositions[`${id}-v${newPositionTypeData.version}`] = newPosition;
    }

    if (!currentPositions[id] && transaction.position) {
      currentPositions[id] = {
        ...transaction.position,
      };
    }

    if (currentPositions[id]) {
      currentPositions[id].pendingTransaction = transaction.hash;
    }

    this.currentPositions = currentPositions;
    if (transaction.type === TransactionTypes.newPosition) {
      this.userHasPositions = true;
    }
  }

  handleTransactionRejection(transaction: TransactionDetails) {
    if (!isDcaType(transaction)) {
      return;
    }

    const currentPositions = {
      ...this.currentPositions,
    };

    const { typeData } = transaction;
    const { id } = typeData;
    if (transaction.type === TransactionTypes.newPosition) {
      delete currentPositions[`pending-transaction-${transaction.hash}-v${LATEST_VERSION}`];
    } else if (id && currentPositions[id]) {
      currentPositions[id].pendingTransaction = '';
    }

    this.currentPositions = currentPositions;
    if (Object.keys(currentPositions).length === 0) {
      this.userHasPositions = false;
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    if (!isDcaType(transaction)) {
      return;
    }

    const currentPositions = {
      ...this.currentPositions,
    };

    const pastPositions = {
      ...this.pastPositions,
    };

    if (!currentPositions[transaction.typeData.id] && transaction.type !== TransactionTypes.newPosition) {
      if (transaction.position) {
        currentPositions[transaction.typeData.id] = {
          ...transaction.position,
        };
      } else {
        return;
      }
    }
    switch (transaction.type) {
      case TransactionTypes.newPosition: {
        const newPositionTypeData = transaction.typeData;
        const newId = newPositionTypeData.id;
        if (!currentPositions[`${transaction.chainId}-${newId}-v${newPositionTypeData.version}`]) {
          const newPosition = getNewPositionFromTxTypeData({
            chainId: transaction.chainId,
            id: `${transaction.chainId}-${newId}-v${newPositionTypeData.version}`,
            positionId: BigInt(newId),
            newPositionTypeData,
            user: transaction.from as Address,
          });

          currentPositions[`${transaction.chainId}-${newId}-v${newPositionTypeData.version}`] = {
            ...(currentPositions[`pending-transaction-${transaction.hash}-v${newPositionTypeData.version}`] || {}),
            ...newPosition,
          };
        }

        delete currentPositions[`pending-transaction-${transaction.hash}-v${newPositionTypeData.version}`];
        break;
      }
      case TransactionTypes.terminatePosition: {
        const terminatePositionTypeData = transaction.typeData;

        pastPositions[terminatePositionTypeData.id] = {
          ...currentPositions[terminatePositionTypeData.id],
          toWithdraw: {
            amount: 0n,
            amountInUnits: '0',
            amountInUSD: '0',
          },
          remainingLiquidity: {
            amount: 0n,
            amountInUnits: '0',
            amountInUSD: '0',
          },
          remainingSwaps: 0n,
          toWithdrawYield: !isUndefined(currentPositions[terminatePositionTypeData.id].toWithdrawYield)
            ? {
                amount: 0n,
                amountInUnits: '0',
                amountInUSD: '0',
              }
            : undefined,
          remainingLiquidityYield: !isUndefined(currentPositions[terminatePositionTypeData.id].remainingLiquidityYield)
            ? {
                amount: 0n,
                amountInUnits: '0',
                amountInUSD: '0',
              }
            : undefined,
          pendingTransaction: '',
        };
        delete currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TransactionTypes.migratePositionYield: {
        const migratePositionYieldTypeData = transaction.typeData;
        pastPositions[migratePositionYieldTypeData.id] = {
          ...currentPositions[migratePositionYieldTypeData.id],
          pendingTransaction: '',
        };
        if (migratePositionYieldTypeData.newId) {
          const newPositionId = `${transaction.chainId}-${migratePositionYieldTypeData.newId}-v${LATEST_VERSION}`;
          currentPositions[newPositionId] = {
            ...currentPositions[migratePositionYieldTypeData.id],
            from: !migratePositionYieldTypeData.fromYield
              ? currentPositions[migratePositionYieldTypeData.id].from
              : {
                  ...currentPositions[migratePositionYieldTypeData.id].from,
                  underlyingTokens: [
                    emptyTokenWithAddress(migratePositionYieldTypeData.fromYield, TokenType.YIELD_BEARING_SHARE),
                  ],
                },
            to: !migratePositionYieldTypeData.toYield
              ? currentPositions[migratePositionYieldTypeData.id].to
              : {
                  ...currentPositions[migratePositionYieldTypeData.id].to,
                  underlyingTokens: [
                    emptyTokenWithAddress(migratePositionYieldTypeData.toYield, TokenType.YIELD_BEARING_SHARE),
                  ],
                },
            rate: currentPositions[migratePositionYieldTypeData.id].rate,
            toWithdrawYield: {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            },
            remainingLiquidityYield: {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            },
            pendingTransaction: '',
            toWithdraw: {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            },
            swapped: {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            },
            totalExecutedSwaps: 0n,
            status: 'ACTIVE',
            version: LATEST_VERSION,
            positionId: BigInt(migratePositionYieldTypeData.newId),
            id: newPositionId,
          };
        }
        delete currentPositions[migratePositionYieldTypeData.id];
        break;
      }
      case TransactionTypes.withdrawPosition: {
        const withdrawPositionTypeData = transaction.typeData;
        currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        currentPositions[withdrawPositionTypeData.id].toWithdraw = {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        };
        currentPositions[withdrawPositionTypeData.id].toWithdrawYield = !isUndefined(
          currentPositions[withdrawPositionTypeData.id].toWithdrawYield
        )
          ? {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            }
          : undefined;
        break;
      }
      case TransactionTypes.modifyRateAndSwapsPosition: {
        const modifyRateAndSwapsPositionTypeData = transaction.typeData;
        const newSwaps = BigInt(modifyRateAndSwapsPositionTypeData.newSwaps);
        const oldSwaps = BigInt(currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps);
        const modifiedRateAndSwapsSwapDifference = newSwaps < oldSwaps ? oldSwaps - newSwaps : newSwaps - oldSwaps;
        currentPositions[modifyRateAndSwapsPositionTypeData.id].pendingTransaction = '';
        currentPositions[modifyRateAndSwapsPositionTypeData.id].rate = {
          amount: BigInt(modifyRateAndSwapsPositionTypeData.newRate),
          amountInUnits: formatUnits(
            BigInt(modifyRateAndSwapsPositionTypeData.newRate),
            modifyRateAndSwapsPositionTypeData.decimals
          ),
          amountInUSD: parseUsdPrice(
            currentPositions[modifyRateAndSwapsPositionTypeData.id].from,
            BigInt(modifyRateAndSwapsPositionTypeData.newRate),
            parseNumberUsdPriceToBigInt(currentPositions[modifyRateAndSwapsPositionTypeData.id].from.price)
          ).toString(),
        };

        const totalSwaps = currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps;
        currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps =
          newSwaps < oldSwaps
            ? totalSwaps - modifiedRateAndSwapsSwapDifference
            : totalSwaps + modifiedRateAndSwapsSwapDifference;
        currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps = newSwaps;
        const newRemainingLiquidity =
          currentPositions[modifyRateAndSwapsPositionTypeData.id].rate.amount *
          currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps;
        currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingLiquidity = {
          amount: newRemainingLiquidity,
          amountInUnits: formatUnits(
            newRemainingLiquidity,
            currentPositions[modifyRateAndSwapsPositionTypeData.id].from.decimals
          ),
          amountInUSD: parseUsdPrice(
            currentPositions[modifyRateAndSwapsPositionTypeData.id].from,
            newRemainingLiquidity,
            parseNumberUsdPriceToBigInt(currentPositions[modifyRateAndSwapsPositionTypeData.id].from.price)
          ).toString(),
        };
        break;
      }
      case TransactionTypes.withdrawFunds: {
        const withdrawFundsTypeData = transaction.typeData;
        currentPositions[withdrawFundsTypeData.id].pendingTransaction = '';
        currentPositions[withdrawFundsTypeData.id].rate = {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        };
        currentPositions[withdrawFundsTypeData.id].totalSwaps =
          currentPositions[withdrawFundsTypeData.id].totalSwaps -
          currentPositions[withdrawFundsTypeData.id].remainingSwaps;
        currentPositions[withdrawFundsTypeData.id].remainingSwaps = 0n;
        currentPositions[withdrawFundsTypeData.id].remainingLiquidity = {
          amount: 0n,
          amountInUnits: '0',
          amountInUSD: '0',
        };
        currentPositions[withdrawFundsTypeData.id].remainingLiquidityYield = !isUndefined(
          currentPositions[withdrawFundsTypeData.id].remainingLiquidityYield
        )
          ? {
              amount: 0n,
              amountInUnits: '0',
              amountInUSD: '0',
            }
          : undefined;
        break;
      }
      case TransactionTypes.transferPosition: {
        const transferPositionTypeData = transaction.typeData;
        const wallets = this.accountService.getWallets();
        const recipientIsSameUser = wallets.some(
          (wallet) => wallet.address.toLowerCase() === transaction.typeData.toAddress.toLowerCase()
        );

        if (recipientIsSameUser) {
          currentPositions[transferPositionTypeData.id].user = transaction.typeData.toAddress.toLowerCase() as Address;
          currentPositions[transferPositionTypeData.id].pendingTransaction = '';
          currentPositions[transferPositionTypeData.id].permissions = [];
        } else {
          delete currentPositions[transferPositionTypeData.id];
        }
        break;
      }
      case TransactionTypes.modifyPermissions: {
        const { id, permissions } = transaction.typeData;
        currentPositions[id].pendingTransaction = '';
        const positionPermissions = currentPositions[id].permissions;
        if (positionPermissions) {
          let newPermissions = [...positionPermissions];
          permissions.forEach((permission) => {
            const permissionIndex = findIndex(positionPermissions, { operator: permission.operator.toLowerCase() });
            if (permissionIndex !== -1) {
              newPermissions[permissionIndex] = permission;
            } else {
              newPermissions = [...newPermissions, permission];
            }
          });
          currentPositions[id].permissions = newPermissions;
        } else {
          currentPositions[id].permissions = permissions;
        }
        break;
      }
      default:
        break;
    }

    this.currentPositions = currentPositions;
    this.pastPositions = pastPositions;
  }
}

/* eslint-enable no-await-in-loop */
