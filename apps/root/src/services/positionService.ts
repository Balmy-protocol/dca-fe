/* eslint-disable no-await-in-loop */
import { ethers, Signer, BigNumber, PopulatedTransaction } from 'ethers';
import keyBy from 'lodash/keyBy';
import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';
import { hexlify } from 'ethers/lib/utils';
import {
  Token,
  Position,
  PositionKeyBy,
  TransactionDetails,
  NFTData,
  PositionPermission,
  YieldOption,
  PermissionManagerContract,
  PermissionPermit,
  TransactionTypes,
  PermissionSet as IPermissionSet,
} from '@types';

// ABIS
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken, getProtocolToken } from '@common/mocks/tokens';
import {
  MAX_UINT_32,
  NETWORKS_FOR_MENU,
  POSITION_VERSION_2,
  LATEST_VERSION,
  SIGN_VERSION,
  TOKEN_TYPE_YIELD_BEARING_SHARES,
  PERMISSIONS,
} from '@constants';
import { fromRpcSig } from 'ethereumjs-util';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { findHubAddressVersion, getDisplayToken, sdkDcaTokenToToken, sortTokens } from '@common/utils/parsing';
import { doesCompanionNeedIncreaseOrReducePermission } from '@common/utils/companion';
import { parsePermissionsForSdk, sdkPermissionsToPermissionData } from '@common/utils/sdk';
import { AddFunds, DCAPermission } from '@mean-finance/sdk';
import ContractService from './contractService';
import WalletService from './walletService';
import PairService from './pairService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import SafeService from './safeService';
import Permit2Service from './permit2Service';
import SdkService from './sdkService';
import AccountService from './accountService';
import { ArrayOneOrMore } from '@mean-finance/sdk/dist/utility-types';

export default class PositionService {
  signer: Signer;

  currentPositions: PositionKeyBy;

  pastPositions: PositionKeyBy;

  contractService: ContractService;

  providerService: ProviderService;

  walletService: WalletService;

  pairService: PairService;

  meanApiService: MeanApiService;

  safeService: SafeService;

  permit2Service: Permit2Service;

  sdkService: SdkService;

  hasFetchedCurrentPositions: boolean;

  hasFetchedPastPositions: boolean;

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
    this.accountService = accountService;
    this.contractService = contractService;
    this.walletService = walletService;
    this.pairService = pairService;
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.safeService = safeService;
    this.permit2Service = permit2Service;
    this.currentPositions = {};
    this.pastPositions = {};
    this.hasFetchedCurrentPositions = false;
    this.hasFetchedPastPositions = false;
    this.sdkService = sdkService;
  }

  getSigner() {
    return this.signer;
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

  async fetchCurrentPositions() {
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

    const currentPositions = {
      ...this.currentPositions,
    };

    this.currentPositions = NETWORKS_FOR_MENU.reduce<PositionKeyBy>((acc, network) => {
      const positions = results[network];
      if (positions) {
        return {
          ...acc,
          ...keyBy(
            positions
              .filter((position) => position.status !== 'terminated')
              .map<Position>((position) => {
                const version = findHubAddressVersion(position.hub);
                const existingPosition = this.currentPositions[`${position.tokenId}-v${version}`];
                const fromToUse = getDisplayToken(sdkDcaTokenToToken(position.from, network), network);
                const toToUse = getDisplayToken(sdkDcaTokenToToken(position.to, network), network);

                const fromHasYield = position.from.variant.type === 'yield';
                const toHasYield = position.to.variant.type === 'yield';

                const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
                return {
                  from: fromToUse,
                  to: toToUse,
                  user: position.owner,
                  swapInterval: BigNumber.from(position.swapInterval),
                  swapped: BigNumber.from(position.funds.swapped),
                  rate: BigNumber.from(position.rate),
                  remainingLiquidity: BigNumber.from(position.funds.remaining),
                  remainingSwaps: BigNumber.from(position.remainingSwaps),
                  toWithdraw: BigNumber.from(position.funds.toWithdraw),
                  totalSwaps: BigNumber.from(position.executedSwaps + position.remainingSwaps),
                  isStale: position.isStale,
                  pairId: position.pair.pairId,
                  swappedYield: toHasYield ? BigNumber.from(position.funds.swapped) : null,
                  remainingLiquidityUnderlying: fromHasYield ? BigNumber.from(position.funds.remaining) : null,
                  toWithdrawUnderlying: toHasYield ? BigNumber.from(position.funds.toWithdraw) : null,
                  toWithdrawYield: (position.yield && BigNumber.from(position.yield.toWithdraw)) || null,
                  remainingLiquidityYield: (position.yield && BigNumber.from(position.yield.remaining)) || null,
                  id: `${position.tokenId}-v${version}`,
                  positionId: position.tokenId.toString(),
                  status: position.status,
                  totalExecutedSwaps: BigNumber.from(position.executedSwaps),
                  pendingTransaction,
                  version,
                  chainId: network,
                  nextSwapAvailableAt: position.nextSwapAvailableAt,
                  startedAt: position.createdAt,
                  ...(!!position.permissions && { permissions: sdkPermissionsToPermissionData(position.permissions) }),
                };
              }),
            'id'
          ),
        };
      }
      return acc;
    }, currentPositions);

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

    const pastPositions = {
      ...this.pastPositions,
    };

    this.pastPositions = NETWORKS_FOR_MENU.reduce<PositionKeyBy>((acc, network) => {
      const positions = results[network];
      if (positions) {
        return {
          ...acc,
          ...keyBy(
            positions
              .filter((position) => position.status === 'terminated')
              .map<Position>((position) => {
                const version = findHubAddressVersion(position.hub);
                const existingPosition = this.currentPositions[`${position.tokenId}-v${version}`];
                const fromToUse = getDisplayToken(sdkDcaTokenToToken(position.from, network), network);
                const toToUse = getDisplayToken(sdkDcaTokenToToken(position.to, network), network);

                const fromHasYield = position.from.variant.type === 'yield';
                const toHasYield = position.to.variant.type === 'yield';

                const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
                return {
                  from: fromToUse,
                  to: toToUse,
                  user: position.owner,
                  swapInterval: BigNumber.from(position.swapInterval),
                  swapped: BigNumber.from(position.funds.swapped),
                  rate: BigNumber.from(position.rate),
                  remainingLiquidity: BigNumber.from(position.funds.remaining),
                  remainingSwaps: BigNumber.from(position.remainingSwaps),
                  toWithdraw: BigNumber.from(position.funds.toWithdraw),
                  totalSwaps: BigNumber.from(position.executedSwaps + position.remainingSwaps),
                  isStale: position.isStale,
                  pairId: position.pair.pairId,
                  swappedYield: toHasYield ? BigNumber.from(position.funds.swapped) : null,
                  remainingLiquidityUnderlying: fromHasYield ? BigNumber.from(position.funds.remaining) : null,
                  toWithdrawUnderlying: toHasYield ? BigNumber.from(position.funds.toWithdraw) : null,
                  toWithdrawYield: (position.yield && BigNumber.from(position.yield.toWithdraw)) || null,
                  remainingLiquidityYield: (position.yield && BigNumber.from(position.yield.remaining)) || null,
                  id: `${position.tokenId}-v${version}`,
                  positionId: position.tokenId.toString(),
                  status: position.status,
                  totalExecutedSwaps: BigNumber.from(position.executedSwaps),
                  pendingTransaction,
                  version,
                  chainId: network,
                  nextSwapAvailableAt: position.nextSwapAvailableAt,
                  startedAt: position.createdAt,
                  ...(!!position.permissions && { permissions: sdkPermissionsToPermissionData(position.permissions) }),
                };
              }),
            'id'
          ),
        };
      }
      return acc;
    }, pastPositions);

    this.hasFetchedPastPositions = true;
  }

  // POSITION METHODS
  async fillAddressPermissions(
    position: Position,
    contractAddress: string,
    permission: PERMISSIONS,
    permissionManagerAddressProvided?: string
  ) {
    const signer = await this.providerService.getSigner(position.user, position.chainId);
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || this.contractService.getPermissionManagerAddress(position.chainId, version);
    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      signer
    ) as unknown as PermissionManagerContract;

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.INCREASE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.REDUCE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.WITHDRAW),
      permissionManagerInstance.hasPermission(positionId, contractAddress, PERMISSIONS.TERMINATE),
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
    contractAddress: string,
    permission: PERMISSIONS,
    permissionManagerAddressProvided?: string,
    erc712Name?: string
  ) {
    const signer = await this.providerService.getSigner(position.user, position.chainId);
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || this.contractService.getPermissionManagerAddress(position.chainId, version);
    const signName = erc712Name || 'Mean Finance - DCA Position';
    const MAX_UINT_256 = BigNumber.from('2').pow('256').sub(1);

    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      signer
    ) as unknown as PermissionManagerContract;

    const nextNonce = await permissionManagerInstance.nonces(position.user);

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
    const rawSignature = await signer._signTypedData(
      {
        name: signName,
        version: SIGN_VERSION[position.version],
        chainId: position.chainId,
        verifyingContract: permissionManagerAddress,
      },
      { PermissionSet, PermissionPermit: PermissionPermits },
      { tokenId: positionId, permissions, nonce: nextNonce, deadline: MAX_UINT_256 }
    );

    const { v, r, s } = fromRpcSig(rawSignature);

    return {
      permissions,
      deadline: MAX_UINT_256,
      v,
      r,
      s,
    };
  }

  async migrateYieldPosition(
    position: Position,
    fromYield?: YieldOption | null,
    toYield?: YieldOption | null
  ): Promise<TransactionResponse> {
    const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);
    let permissionsPermit: PermissionPermit | undefined;
    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const fromToUse =
      position.from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.from.address;
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.to.address;

    if (!companionHasPermission) {
      const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
        position,
        companionAddress,
        PERMISSIONS.TERMINATE
      );
      permissionsPermit = {
        permissions,
        deadline: deadline.toString(),
        v,
        r: hexlify(r),
        s: hexlify(s),
        tokenId: position.positionId,
      };
    }

    return this.meanApiService.migratePosition(
      position.positionId,
      fromYield?.tokenAddress || fromToUse,
      toYield?.tokenAddress || toToUse,
      position.user,
      position.version,
      position.chainId,
      permissionsPermit
    );
  }

  async companionHasPermission(position: Position, permission: number) {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(
      position.chainId,
      position.user,
      position.version
    );
    const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

    return permissionManagerInstance.hasPermission(position.positionId, companionAddress, permission);
  }

  async getModifyPermissionsTx(position: Position, newPermissions: IPermissionSet[]): Promise<PopulatedTransaction> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(
      position.chainId,
      position.user,
      position.version
    );

    return permissionManagerInstance.populateTransaction.modify(position.positionId, newPermissions);
  }

  async modifyPermissions(position: Position, newPermissions: PositionPermission[]): Promise<TransactionResponse> {
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
    });
  }

  async transfer(position: Position, toAddress: string): Promise<TransactionResponse> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(
      position.chainId,
      position.user,
      position.version
    );

    return permissionManagerInstance.transferFrom(position.user, toAddress, position.positionId);
  }

  async getTokenNFT(position: Position): Promise<NFTData> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(
      position.chainId,
      position.user,
      position.version
    );

    const tokenData = await permissionManagerInstance.tokenURI(position.positionId);
    return JSON.parse(atob(tokenData.substring(29))) as NFTData;
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
    frequencyType: BigNumber,
    frequencyValue: string,
    chainId: number,
    yieldFrom?: string,
    yieldTo?: string
  ) {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;
    const companionAddress = this.contractService.getHUBCompanionAddress(chainId);
    let permissions: number[] = [];

    if (amountOfSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (yieldFrom) {
      permissions = [...permissions, PERMISSIONS.INCREASE, PERMISSIONS.REDUCE];
    }

    if (yieldTo) {
      permissions = [...permissions, PERMISSIONS.WITHDRAW];
    }

    if (yieldFrom || yieldTo) {
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

  async buildDepositTx(
    owner: string,
    fromToken: Token,
    toToken: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    chainId: number,
    possibleYieldFrom?: string,
    possibleYieldTo?: string,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ) {
    const { takeFrom, from, to, totalAmmount, swaps, interval, account, permissions, yieldFrom, yieldTo } =
      this.buildDepositParams(
        owner,
        fromToken,
        toToken,
        fromValue,
        frequencyType,
        frequencyValue,
        chainId,
        possibleYieldFrom,
        possibleYieldTo
      );

    const currentNetwork = await this.providerService.getNetwork();

    const deposit: AddFunds =
      takeFrom.toLowerCase() !== PROTOCOL_TOKEN_ADDRESS.toLowerCase() && signature
        ? {
            permitData: {
              amount: totalAmmount.toString(),
              token: takeFrom,
              nonce: signature.nonce.toString(),
              deadline: signature.deadline.toString(),
            },
            signature: signature.rawSignature,
          }
        : { token: takeFrom, amount: totalAmmount.toString() };

    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

    const fromToUse =
      yieldFrom || (from.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken.address : from);
    const toToUse =
      yieldTo || (to.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken.address : to);

    return this.sdkService.buildCreatePositionTx({
      chainId: currentNetwork.chainId,
      from: { address: from, variantId: fromToUse },
      to: { address: to, variantId: toToUse },
      swapInterval: interval.toNumber(),
      amountOfSwaps: swaps.toNumber(),
      owner: account,
      permissions: parsePermissionsForSdk(permissions),
      deposit,
    });
  }

  async approveAndDepositSafe(
    owner: string,
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
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

    const currentNetwork = await this.providerService.getNetwork();

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
    user: string,
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    chainId: number,
    passedYieldFrom?: string,
    passedYieldTo?: string,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ): Promise<TransactionResponse> {
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
    });
  }

  async withdraw(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : position.to;

    if (
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call withdraw without it being protocol tokenm');
    }

    const hasYield = position.to.underlyingTokens.length;

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

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
        deadline: permissionPermit.deadline.toString(),
        v: permissionPermit.v,
        r: hexlify(permissionPermit.r),
        s: hexlify(permissionPermit.s),
        tokenId: position.positionId,
      },
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
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

      const permissions = await this.fillAddressPermissions(position, companionAddress, PERMISSIONS.WITHDRAW);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async terminate(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
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
      (position.from.underlyingTokens.length && position.remainingLiquidity.gt(BigNumber.from(0))) ||
      (position.to.underlyingTokens.length && position.toWithdraw.gt(BigNumber.from(0)));

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      let companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

      if (!companionAddress) {
        companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, position.version);
      }

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
        r: hexlify(permissionPermit.r),
        s: hexlify(permissionPermit.s),
        tokenId: position.positionId,
      },
    });

    return this.providerService.sendTransactionWithGasLimit({
      ...tx,
      from: position.user,
    });
  }

  async terminateSafe(position: Position) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    const hasYield =
      (position.from.underlyingTokens.length && position.remainingLiquidity.gt(BigNumber.from(0))) ||
      (position.to.underlyingTokens.length && position.toWithdraw.gt(BigNumber.from(0)));

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

      const permissions = await this.fillAddressPermissions(position, companionAddress, PERMISSIONS.TERMINATE);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async terminateManyRaw(positions: Position[]): Promise<TransactionResponse> {
    const { chainId, user } = positions[0];

    // Check that all positions are from the same chain
    const isOneOnDifferentChain = positions.some((position) => position.chainId !== chainId);
    if (isOneOnDifferentChain) {
      throw new Error('Should not call terminate many for positions on different chains');
    }

    const companionInstance = await this.contractService.getHUBCompanionInstance(chainId, user, LATEST_VERSION);
    const terminatesData: string[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const hubAddress = this.contractService.getHUBAddress(position.chainId, position.version);

      const terminateData = companionInstance.interface.encodeFunctionData('terminate', [
        hubAddress,
        position.positionId,
        user,
        user,
      ]);
      terminatesData.push(terminateData);
    }

    return companionInstance.multicall(terminatesData);
  }

  async givePermissionToMultiplePositions(
    positions: Position[],
    permissions: PERMISSIONS[],
    permittedAddress: string
  ): Promise<TransactionResponse> {
    const { chainId, user, version } = positions[0];

    // Check that all positions are from the same chain and same version
    const isOneOnDifferentChainOrVersion = positions.some(
      (position) => position.chainId !== chainId || position.version !== version
    );
    if (isOneOnDifferentChainOrVersion) {
      throw new Error('Should not call give permission many for positions on different chains or versions');
    }

    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(chainId, user, version);

    const positionsDataPromises = positions.map(async ({ positionId }) => {
      const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await permissionManagerInstance.hasPermissions(
        positionId,
        permittedAddress,
        [DCAPermission.INCREASE, DCAPermission.REDUCE, DCAPermission.WITHDRAW, DCAPermission.TERMINATE]
      );

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

    return permissionManagerInstance.modifyMany(positionsData);
  }

  buildModifyRateAndSwapsParams(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ) {
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
    const companionAddress = this.contractService.getHUBCompanionAddress(position.chainId, LATEST_VERSION);

    if (
      position.from.address !== wrappedProtocolToken.address &&
      position.from.address !== PROTOCOL_TOKEN_ADDRESS &&
      useWrappedProtocolToken
    ) {
      throw new Error('Should not call modify rate and swaps without it being protocol token');
    }

    if (BigNumber.from(newSwaps).gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newAmount = BigNumber.from(parseUnits(newRateUnderlying, position.from.decimals)).mul(
      BigNumber.from(newSwaps)
    );
    const remainingLiquidity = position.rate.mul(position.remainingSwaps);

    const isIncrease = newAmount.gte(remainingLiquidity);

    return {
      id: position.positionId,
      amount: isIncrease ? newAmount.sub(remainingLiquidity) : remainingLiquidity.sub(newAmount),
      swaps: BigNumber.from(newSwaps),
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

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      isIncrease ? PERMISSIONS.INCREASE : PERMISSIONS.REDUCE
    );

    return {
      permissions,
      deadline: deadline.toString(),
      v,
      r: hexlify(r),
      s: hexlify(s),
      tokenId: position.positionId,
    };
  }

  async buildModifyRateAndSwapsTx(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean,
    getSignature = true,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
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
                amount: amount.toString(),
                token: tokenFrom,
                nonce: signature.nonce.toString(),
                deadline: signature.deadline.toString(),
              },
              signature: signature.rawSignature,
            }
          : { token: tokenFrom, amount: amount.toString() };

      return this.sdkService.buildIncreasePositionTx({
        chainId: position.chainId,
        positionId: position.positionId,
        dcaHub: hubAddress,
        amountOfSwaps: swaps.toNumber(),
        permissionPermit: permissionSignature && {
          ...permissionSignature,
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
      amountOfSwaps: swaps.toNumber(),
      permissionPermit: permissionSignature && {
        ...permissionSignature,
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

    const remainingLiquidityDifference = position.remainingLiquidity
      .sub(BigNumber.from(newSwaps || '0').mul(parseUnits(newRateUnderlying || '0', fromToUse.decimals)))
      .abs();

    const needsToApprove =
      fromToUse.address !== PROTOCOL_TOKEN_ADDRESS &&
      allowance.allowance &&
      allowance.token.address !== PROTOCOL_TOKEN_ADDRESS &&
      allowance.token.address === fromToUse.address &&
      isIncrease &&
      parseUnits(allowance.allowance, fromToUse.decimals).lt(remainingLiquidityDifference);

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
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ): Promise<TransactionResponse> {
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
    });
  }

  setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TransactionTypes.newPair ||
      transaction.type === TransactionTypes.approveToken ||
      transaction.type === TransactionTypes.approveTokenExact ||
      transaction.type === TransactionTypes.swap ||
      transaction.type === TransactionTypes.wrap ||
      transaction.type === TransactionTypes.claimCampaign ||
      transaction.type === TransactionTypes.unwrap ||
      transaction.type === TransactionTypes.wrapEther
    )
      return;

    const { typeData } = transaction;
    let { id } = typeData;

    if (transaction.type === TransactionTypes.newPosition) {
      const newPositionTypeData = transaction.typeData;
      id = `pending-transaction-${transaction.hash}`;
      const { fromYield, toYield } = newPositionTypeData;
      const protocolToken = getProtocolToken(transaction.chainId);
      const wrappedProtocolToken = getWrappedProtocolToken(transaction.chainId);

      let fromToUse =
        newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.from;
      let toToUse =
        newPositionTypeData.to.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.to;

      if (fromYield) {
        fromToUse = {
          ...fromToUse,
          underlyingTokens: [emptyTokenWithAddress(fromYield)],
        };
      }
      if (toYield) {
        toToUse = {
          ...toToUse,
          underlyingTokens: [emptyTokenWithAddress(toYield)],
        };
      }

      const [tokenA, tokenB] = sortTokens(newPositionTypeData.from, newPositionTypeData.to);
      this.currentPositions[`${id}-v${newPositionTypeData.version}`] = {
        from: fromToUse,
        to: toToUse,
        user: transaction.from,
        chainId: transaction.chainId,
        positionId: id,
        toWithdraw: BigNumber.from(0),
        swapInterval: BigNumber.from(newPositionTypeData.frequencyType),
        swapped: BigNumber.from(0),
        rate: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
        pairId: `${tokenA.address}-${tokenB.address}`,
        remainingLiquidity: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        remainingSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        totalSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        totalExecutedSwaps: BigNumber.from(0),
        id,
        startedAt: newPositionTypeData.startedAt,
        pendingTransaction: transaction.hash,
        status: 'ACTIVE',
        version: LATEST_VERSION,
        isStale: false,
        swappedYield: (toYield && BigNumber.from(0)) || null,
        toWithdrawYield: (toYield && BigNumber.from(0)) || null,
        remainingLiquidityYield:
          (fromYield && parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals)) || null,
        nextSwapAvailableAt: newPositionTypeData.startedAt,
        permissions: [],
      };
    }

    if (!this.currentPositions[id] && transaction.position) {
      this.currentPositions[id] = {
        ...transaction.position,
      };
    }

    if (this.currentPositions[id]) {
      this.currentPositions[id].pendingTransaction = transaction.hash;
    }

    if (
      transaction.type === TransactionTypes.eulerClaimPermitMany ||
      transaction.type === TransactionTypes.eulerClaimTerminateMany
    ) {
      const { positionIds } = transaction.typeData;

      positionIds.forEach((positionId) => {
        if (this.currentPositions[positionId]) {
          this.currentPositions[positionId].pendingTransaction = transaction.hash;
        }
      });
    }
  }

  handleTransactionRejection(transaction: TransactionDetails) {
    if (
      transaction.type === TransactionTypes.newPair ||
      transaction.type === TransactionTypes.approveToken ||
      transaction.type === TransactionTypes.approveTokenExact ||
      transaction.type === TransactionTypes.swap ||
      transaction.type === TransactionTypes.wrap ||
      transaction.type === TransactionTypes.claimCampaign ||
      transaction.type === TransactionTypes.unwrap ||
      transaction.type === TransactionTypes.wrapEther
    )
      return;
    const { typeData } = transaction;
    const { id } = typeData;
    if (transaction.type === TransactionTypes.newPosition) {
      delete this.currentPositions[`pending-transaction-${transaction.hash}-v${LATEST_VERSION}`];
    } else if (
      transaction.type === TransactionTypes.eulerClaimPermitMany ||
      transaction.type === TransactionTypes.eulerClaimTerminateMany
    ) {
      const { positionIds } = transaction.typeData;

      positionIds.forEach((positionId) => {
        if (this.currentPositions[positionId]) {
          this.currentPositions[positionId].pendingTransaction = '';
        }
      });
    } else if (id) {
      this.currentPositions[id].pendingTransaction = '';
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TransactionTypes.newPair ||
      transaction.type === TransactionTypes.approveToken ||
      transaction.type === TransactionTypes.approveTokenExact ||
      transaction.type === TransactionTypes.swap ||
      transaction.type === TransactionTypes.wrap ||
      transaction.type === TransactionTypes.claimCampaign ||
      transaction.type === TransactionTypes.unwrap ||
      transaction.type === TransactionTypes.wrapEther
    ) {
      return;
    }

    if (
      !this.currentPositions[transaction.typeData.id] &&
      transaction.type !== TransactionTypes.newPosition &&
      transaction.type !== TransactionTypes.eulerClaimPermitMany &&
      transaction.type !== TransactionTypes.eulerClaimTerminateMany
    ) {
      if (transaction.position) {
        this.currentPositions[transaction.typeData.id] = {
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
        if (!this.currentPositions[`${newId}-v${newPositionTypeData.version}`]) {
          this.currentPositions[`${newId}-v${newPositionTypeData.version}`] = {
            ...this.currentPositions[`pending-transaction-${transaction.hash}-v${newPositionTypeData.version}`],
            pendingTransaction: '',
            id: `${newId}-v${newPositionTypeData.version}`,
            positionId: newId,
          };
        }
        delete this.currentPositions[`pending-transaction-${transaction.hash}-v${newPositionTypeData.version}`];
        this.pairService.addNewPair(
          newPositionTypeData.from,
          newPositionTypeData.to,
          BigNumber.from(newPositionTypeData.frequencyType)
        );
        break;
      }
      case TransactionTypes.terminatePosition: {
        const terminatePositionTypeData = transaction.typeData;
        this.pastPositions[terminatePositionTypeData.id] = {
          ...this.currentPositions[terminatePositionTypeData.id],
          toWithdraw: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingSwaps: BigNumber.from(0),
          toWithdrawYield: BigNumber.from(0),
          remainingLiquidityYield: BigNumber.from(0),
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TransactionTypes.eulerClaimTerminateMany: {
        const { positionIds } = transaction.typeData;
        positionIds.forEach((id) => {
          this.pastPositions[id] = {
            ...this.currentPositions[id],
            toWithdraw: BigNumber.from(0),
            remainingLiquidity: BigNumber.from(0),
            remainingSwaps: BigNumber.from(0),
            pendingTransaction: '',
          };
          delete this.currentPositions[id];
        });
        break;
      }
      case TransactionTypes.migratePositionYield: {
        const migratePositionYieldTypeData = transaction.typeData;
        this.pastPositions[migratePositionYieldTypeData.id] = {
          ...this.currentPositions[migratePositionYieldTypeData.id],
          pendingTransaction: '',
        };
        if (migratePositionYieldTypeData.newId) {
          const newPositionId = `${migratePositionYieldTypeData.newId}-v${LATEST_VERSION}`;
          this.currentPositions[newPositionId] = {
            ...this.currentPositions[migratePositionYieldTypeData.id],
            from: !migratePositionYieldTypeData.fromYield
              ? this.currentPositions[migratePositionYieldTypeData.id].from
              : {
                  ...this.currentPositions[migratePositionYieldTypeData.id].from,
                  underlyingTokens: [
                    emptyTokenWithAddress(migratePositionYieldTypeData.fromYield, TOKEN_TYPE_YIELD_BEARING_SHARES),
                  ],
                },
            to: !migratePositionYieldTypeData.toYield
              ? this.currentPositions[migratePositionYieldTypeData.id].to
              : {
                  ...this.currentPositions[migratePositionYieldTypeData.id].to,
                  underlyingTokens: [
                    emptyTokenWithAddress(migratePositionYieldTypeData.toYield, TOKEN_TYPE_YIELD_BEARING_SHARES),
                  ],
                },
            rate: this.currentPositions[migratePositionYieldTypeData.id].rate,
            toWithdrawYield: BigNumber.from(0),
            remainingLiquidityYield: BigNumber.from(0),
            pendingTransaction: '',
            toWithdraw: BigNumber.from(0),
            swapped: BigNumber.from(0),
            totalExecutedSwaps: BigNumber.from(0),
            status: 'ACTIVE',
            version: LATEST_VERSION,
            positionId: migratePositionYieldTypeData.newId,
            id: newPositionId,
          };
        }
        delete this.currentPositions[migratePositionYieldTypeData.id];
        break;
      }
      case TransactionTypes.withdrawPosition: {
        const withdrawPositionTypeData = transaction.typeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].toWithdraw = BigNumber.from(0);
        this.currentPositions[withdrawPositionTypeData.id].toWithdrawYield = BigNumber.from(0);
        break;
      }
      case TransactionTypes.modifyRateAndSwapsPosition: {
        const modifyRateAndSwapsPositionTypeData = transaction.typeData;
        const modifiedRateAndSwapsSwapDifference = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
          this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps.sub(
              BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps)
            )
          : BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).sub(
              this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps
            );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].rate = parseUnits(
          modifyRateAndSwapsPositionTypeData.newRate,
          modifyRateAndSwapsPositionTypeData.decimals
        );

        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps = BigNumber.from(
          modifyRateAndSwapsPositionTypeData.newSwaps
        ).lt(this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps)
          ? this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps.sub(
              modifiedRateAndSwapsSwapDifference
            )
          : this.currentPositions[modifyRateAndSwapsPositionTypeData.id].totalSwaps.add(
              modifiedRateAndSwapsSwapDifference
            );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifyRateAndSwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingLiquidity = this.currentPositions[
          modifyRateAndSwapsPositionTypeData.id
        ].rate.mul(this.currentPositions[modifyRateAndSwapsPositionTypeData.id].remainingSwaps);
        break;
      }
      case TransactionTypes.withdrawFunds: {
        const withdrawFundsTypeData = transaction.typeData;
        this.currentPositions[withdrawFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawFundsTypeData.id].rate = BigNumber.from(0);
        this.currentPositions[withdrawFundsTypeData.id].totalSwaps = this.currentPositions[
          withdrawFundsTypeData.id
        ].totalSwaps.sub(this.currentPositions[withdrawFundsTypeData.id].remainingSwaps);
        this.currentPositions[withdrawFundsTypeData.id].remainingSwaps = BigNumber.from(0);
        this.currentPositions[withdrawFundsTypeData.id].remainingLiquidity = BigNumber.from(0);
        this.currentPositions[withdrawFundsTypeData.id].remainingLiquidityYield = this.currentPositions[
          withdrawFundsTypeData.id
        ].remainingLiquidityYield
          ? BigNumber.from('0')
          : null;
        break;
      }
      case TransactionTypes.transferPosition: {
        const transferPositionTypeData = transaction.typeData;
        delete this.currentPositions[transferPositionTypeData.id];
        break;
      }
      case TransactionTypes.modifyPermissions: {
        const { id, permissions } = transaction.typeData;
        this.currentPositions[id].pendingTransaction = '';
        const positionPermissions = this.currentPositions[id].permissions;
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
          this.currentPositions[id].permissions = newPermissions;
        } else {
          this.currentPositions[id].permissions = permissions;
        }
        break;
      }
      case TransactionTypes.eulerClaimPermitMany: {
        const { positionIds, permissions, permittedAddress } = transaction.typeData;
        positionIds.forEach((id) => {
          const positionPermissions = this.currentPositions[id].permissions;
          if (positionPermissions) {
            let newPermissions = [...positionPermissions];
            const permissionIndex = findIndex(positionPermissions, { operator: permittedAddress.toLowerCase() });
            if (permissionIndex !== -1) {
              newPermissions[permissionIndex] = {
                ...positionPermissions[permissionIndex],
                permissions: [...positionPermissions[permissionIndex].permissions, ...permissions],
              };
            } else {
              newPermissions = [
                ...newPermissions,
                {
                  id: permittedAddress,
                  operator: permittedAddress,
                  permissions,
                },
              ];
            }
            this.currentPositions[id].permissions = newPermissions;
          } else {
            this.currentPositions[id].permissions = [
              {
                id: permittedAddress,
                operator: permittedAddress,
                permissions,
              },
            ];
          }

          this.currentPositions[id].pendingTransaction = '';
        });
        break;
      }
      default:
        break;
    }
  }
}

/* eslint-enable no-await-in-loop */
