/* eslint-disable no-await-in-loop */
import { ethers, Signer, BigNumber, VoidSigner } from 'ethers';
import keyBy from 'lodash/keyBy';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import { hexlify } from 'ethers/lib/utils';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import {
  Token,
  TransactionPositionTypeDataOptions,
  Position,
  PositionKeyBy,
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  ModifySwapsPositionTypeData,
  RemoveFundsTypeData,
  ResetPositionTypeData,
  ModifyRateAndSwapsPositionTypeData,
  NFTData,
  TransferTypeData,
  PositionPermission,
  MigratePositionTypeData,
  ModifyPermissionsTypeData,
  PositionsGraphqlResponse,
  PositionResponse,
  WithdrawFundsTypeData,
  YieldOption,
  MigratePositionYieldTypeData,
} from 'types';

// GRAPHQL
import GET_POSITIONS from 'graphql/getPositions.graphql';

// ABIS
import PERMISSION_MANAGER_ABI from 'abis/PermissionsManager.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken, getProtocolToken } from 'mocks/tokens';
import {
  MAX_UINT_32,
  NETWORKS_FOR_MENU,
  PERMISSIONS,
  POSITIONS_VERSIONS,
  POSITION_VERSION_2,
  TRANSACTION_TYPES,
  PositionVersions,
  LATEST_VERSION,
  SIGN_VERSION,
  TOKEN_TYPE_YIELD_BEARING_SHARES,
} from 'config/constants';
import { PermissionManagerContract, PermissionPermit } from 'types/contracts';
import { fromRpcSig } from 'ethereumjs-util';
import { emptyTokenWithAddress } from 'utils/currency';
import { getDisplayToken } from 'utils/parsing';
import gqlFetchAll, { GraphqlResults } from 'utils/gqlFetchAll';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import PairService from './pairService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

export default class PositionService {
  modal: SafeAppWeb3Modal;

  signer: Signer;

  currentPositions: PositionKeyBy;

  pastPositions: PositionKeyBy;

  contractService: ContractService;

  providerService: ProviderService;

  walletService: WalletService;

  pairService: PairService;

  meanApiService: MeanApiService;

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  hasFetchedCurrentPositions: boolean;

  hasFetchedPastPositions: boolean;

  constructor(
    walletService: WalletService,
    pairService: PairService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>,
    providerService: ProviderService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.pairService = pairService;
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.apolloClient = DCASubgraph;
    this.currentPositions = {};
    this.pastPositions = {};
    this.hasFetchedCurrentPositions = false;
    this.hasFetchedPastPositions = false;
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
    const account = this.walletService.getAccount();
    if (!account) {
      this.currentPositions = {};
      this.hasFetchedCurrentPositions = true;
      return;
    }
    const promises: Promise<GraphqlResults<PositionsGraphqlResponse>>[] = [];
    const networksAndVersions: { network: number; version: PositionVersions }[] = [];

    POSITIONS_VERSIONS.forEach((version) =>
      NETWORKS_FOR_MENU.forEach((network) => {
        const currentApolloClient = this.apolloClient[version][network];
        if (!currentApolloClient || !currentApolloClient.getClient()) {
          return;
        }
        networksAndVersions.push({ version, network });
        promises.push(
          gqlFetchAll<PositionsGraphqlResponse>(
            currentApolloClient.getClient(),
            GET_POSITIONS,
            {
              address: account.toLowerCase(),
              status: ['ACTIVE', 'COMPLETED'],
            },
            'positions',
            'network-only'
          )
        );
      })
    );

    const results = await Promise.all(promises.map((promise) => promise.catch(() => ({ data: null, error: true }))));

    const currentPositions = {
      ...this.currentPositions,
    };

    const underlyingsNeededToFetch: {
      positionId: string;
      token: Token;
      amount: BigNumber;
      attr: 'remainingLiquidityUnderlying' | 'toWithdrawUnderlying';
    }[] = [];

    this.currentPositions = results.reduce<PositionKeyBy>((acc, gqlResult, index) => {
      const { network, version } = networksAndVersions[index];
      if (!gqlResult.error && gqlResult.data) {
        return {
          ...acc,
          ...keyBy(
            gqlResult.data.positions.map((position: PositionResponse) => {
              const existingPosition = this.currentPositions[`${position.id}-v${version}`];
              const fromToUse = getDisplayToken(position.from, network);
              const toToUse = getDisplayToken(position.to, network);

              if (fromToUse.underlyingTokens.length) {
                underlyingsNeededToFetch.push({
                  positionId: `${position.id}-v${version}`,
                  token: fromToUse,
                  attr: 'remainingLiquidityUnderlying',
                  amount: BigNumber.from(position.rate).mul(BigNumber.from(position.remainingSwaps)),
                });
              }
              if (toToUse.underlyingTokens.length) {
                underlyingsNeededToFetch.push({
                  positionId: `${position.id}-v${version}`,
                  token: toToUse,
                  attr: 'toWithdrawUnderlying',
                  amount: BigNumber.from(position.toWithdraw),
                });
              }

              const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
              return {
                from: fromToUse,
                to: toToUse,
                user: position.user,
                swapInterval: BigNumber.from(position.swapInterval.interval),
                swapped: BigNumber.from(position.totalSwapped),
                rate: BigNumber.from(position.rate),
                remainingLiquidity: BigNumber.from(position.remainingLiquidity),
                remainingSwaps: BigNumber.from(position.remainingSwaps),
                withdrawn: BigNumber.from(position.totalWithdrawn),
                toWithdraw: BigNumber.from(position.toWithdraw),
                totalSwaps: BigNumber.from(position.totalSwaps),
                toWithdrawUnderlying: null,
                remainingLiquidityUnderlying: null,
                depositedRateUnderlying: position.depositedRateUnderlying
                  ? BigNumber.from(position.depositedRateUnderlying)
                  : null,
                totalSwappedUnderlyingAccum: position.totalSwappedUnderlyingAccum
                  ? BigNumber.from(position.totalSwappedUnderlyingAccum)
                  : null,
                toWithdrawUnderlyingAccum: position.toWithdrawUnderlyingAccum
                  ? BigNumber.from(position.toWithdrawUnderlyingAccum)
                  : null,
                id: `${position.id}-v${version}`,
                positionId: position.id,
                status: position.status,
                startedAt: position.createdAtTimestamp,
                totalExecutedSwaps: BigNumber.from(position.totalExecutedSwaps),
                totalDeposited: BigNumber.from(position.totalDeposited),
                pendingTransaction,
                pairId: position.pair.id,
                version,
                chainId: network,
                pairLastSwappedAt:
                  (position.pair.swaps[0] && parseInt(position.pair.swaps[0].executedAtTimestamp, 10)) ||
                  position.createdAtTimestamp,
                pairNextSwapAvailableAt: position.createdAtTimestamp.toString(),
              };
            }),
            'id'
          ),
        };
      }
      return acc;
    }, currentPositions);

    const underlyingReponses = await this.meanApiService.getUnderlyingTokens(
      underlyingsNeededToFetch.map(({ token, amount }) => ({ token, amount }))
    );

    underlyingsNeededToFetch.forEach(({ token, amount }, index) => {
      const position = underlyingsNeededToFetch[index];
      const underlyingResponse =
        underlyingReponses[`${token.chainId}-${token.underlyingTokens[0].address}-${amount.toString()}`];
      if (underlyingResponse) {
        this.currentPositions[position.positionId][position.attr] = BigNumber.from(underlyingResponse.underlyingAmount);
      } else {
        console.warn('Could not fetch underlying for', token.address, amount.toString());
      }
    });

    this.hasFetchedCurrentPositions = true;
  }

  async fetchPastPositions() {
    this.hasFetchedPastPositions = false;

    const account = this.walletService.getAccount();

    if (!account) {
      this.pastPositions = {};
      this.hasFetchedPastPositions = true;
      return;
    }

    const promises: Promise<GraphqlResults<PositionsGraphqlResponse>>[] = [];
    const networksAndVersions: { network: number; version: PositionVersions }[] = [];

    POSITIONS_VERSIONS.forEach((version) =>
      NETWORKS_FOR_MENU.forEach((network) => {
        const currentApolloClient = this.apolloClient[version][network];
        if (!currentApolloClient || !currentApolloClient.getClient()) {
          return;
        }
        networksAndVersions.push({ version, network });
        promises.push(
          gqlFetchAll<PositionsGraphqlResponse>(
            currentApolloClient.getClient(),
            GET_POSITIONS,
            {
              address: account.toLowerCase(),
              status: ['TERMINATED'],
            },
            'positions',
            'network-only'
          )
        );
      })
    );

    const results = await Promise.all(promises.map((promise) => promise.catch(() => ({ data: null, error: true }))));

    const pastPositions = {
      ...this.pastPositions,
    };

    this.pastPositions = results.reduce<PositionKeyBy>((acc, gqlResult, index) => {
      const { network, version } = networksAndVersions[index];
      if (!gqlResult.error && gqlResult.data) {
        return {
          ...acc,
          ...keyBy(
            gqlResult.data.positions.map((position: PositionResponse) => {
              const fromToUse = getDisplayToken(position.from, network);
              const toToUse = getDisplayToken(position.to, network);

              return {
                from: fromToUse,
                to: toToUse,
                user: position.user,
                swapInterval: BigNumber.from(position.swapInterval.interval),
                swapped: BigNumber.from(position.totalSwapped),
                rate: BigNumber.from(position.rate),
                remainingLiquidity: BigNumber.from(position.remainingLiquidity),
                remainingSwaps: BigNumber.from(position.remainingSwaps),
                withdrawn: BigNumber.from(position.totalWithdrawn),
                toWithdraw: BigNumber.from(position.toWithdraw),
                totalSwaps: BigNumber.from(position.totalSwaps),
                toWithdrawUnderlying: null,
                remainingLiquidityUnderlying: null,
                depositedRateUnderlying: position.depositedRateUnderlying
                  ? BigNumber.from(position.depositedRateUnderlying)
                  : null,
                totalSwappedUnderlyingAccum: position.totalSwappedUnderlyingAccum
                  ? BigNumber.from(position.totalSwappedUnderlyingAccum)
                  : null,
                toWithdrawUnderlyingAccum: position.toWithdrawUnderlyingAccum
                  ? BigNumber.from(position.toWithdrawUnderlyingAccum)
                  : null,
                id: `${position.id}-v${version}`,
                positionId: position.id,
                status: position.status,
                startedAt: position.createdAtTimestamp,
                totalExecutedSwaps: BigNumber.from(position.totalExecutedSwaps),
                totalDeposited: BigNumber.from(position.totalDeposited),
                pendingTransaction: '',
                pairId: position.pair.id,
                version,
                chainId: network,
                pairLastSwappedAt:
                  (position.pair.swaps[0] && parseInt(position.pair.swaps[0].executedAtTimestamp, 10)) ||
                  position.createdAtTimestamp,
                pairNextSwapAvailableAt: position.createdAtTimestamp.toString(),
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
  async getSignatureForPermission(
    position: Position,
    contractAddress: string,
    permission: number,
    permissionManagerAddressProvided?: string,
    erc712Name?: string
  ) {
    const signer = this.providerService.getSigner();
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || (await this.contractService.getPermissionManagerAddress(version));
    const signName = erc712Name || 'Mean Finance - DCA Position';
    const currentNetwork = await this.providerService.getNetwork();
    const MAX_UINT_256 = BigNumber.from('2').pow('256').sub(1);

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

    const nextNonce = await permissionManagerInstance.nonces(await signer.getAddress());

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

    const permissions = [{ operator: contractAddress, permissions: [...defaultPermissions, permission] }];

    // eslint-disable-next-line no-underscore-dangle
    const rawSignature = await (signer as VoidSigner)._signTypedData(
      {
        name: signName,
        version: SIGN_VERSION[position.version],
        chainId: currentNetwork.chainId,
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

  async migratePosition(position: Position): Promise<TransactionResponse> {
    const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);
    let permissionsPermit: PermissionPermit | undefined;
    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

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
      position.from.address,
      position.to.address,
      this.walletService.getAccount(),
      position.version,
      permissionsPermit
    );
  }

  async migrateYieldPosition(
    position: Position,
    fromYield?: YieldOption | null,
    toYield?: YieldOption | null
  ): Promise<TransactionResponse> {
    const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);
    let permissionsPermit: PermissionPermit | undefined;
    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
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
      this.walletService.getAccount(),
      position.version,
      permissionsPermit
    );
  }

  async companionHasPermission(position: Position, permission: number) {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

    return permissionManagerInstance.hasPermission(position.positionId, companionAddress, permission);
  }

  async companionIsApproved(position: Position): Promise<boolean> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

    try {
      await permissionManagerInstance.ownerOf(position.positionId);
    } catch (e) {
      // hack for when the subgraph has not updated yet but the position has been terminated
      const error = e as { data?: { message?: string } };
      if (
        error &&
        error.data &&
        error.data.message &&
        error.data.message === 'execution reverted: ERC721: owner query for nonexistent token'
      )
        return true;
    }

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.hasPermission(position.positionId, companionAddress, PERMISSIONS.INCREASE),
      permissionManagerInstance.hasPermission(position.positionId, companionAddress, PERMISSIONS.REDUCE),
      permissionManagerInstance.hasPermission(position.positionId, companionAddress, PERMISSIONS.WITHDRAW),
      permissionManagerInstance.hasPermission(position.positionId, companionAddress, PERMISSIONS.TERMINATE),
    ]);

    return hasIncrease && hasReduce && hasWithdraw && hasTerminate;
  }

  async approveCompanionForPosition(position: Position): Promise<TransactionResponse> {
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);

    return permissionManagerInstance.modify(position.positionId, [
      {
        operator: companionAddress,
        permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.TERMINATE, PERMISSIONS.WITHDRAW],
      },
    ]);
  }

  async modifyPermissions(position: Position, newPermissions: PositionPermission[]): Promise<TransactionResponse> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);

    return permissionManagerInstance.modify(
      position.positionId,
      newPermissions.map(({ permissions, operator }) => ({
        operator,
        permissions: permissions.map((permission) => PERMISSIONS[permission]),
      }))
    );
  }

  async transfer(position: Position, toAddress: string): Promise<TransactionResponse> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);

    return permissionManagerInstance.transferFrom(position.user, toAddress, position.positionId);
  }

  async getTokenNFT(position: Position): Promise<NFTData> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);

    const tokenData = await permissionManagerInstance.tokenURI(position.positionId);
    return JSON.parse(atob(tokenData.substring(29))) as NFTData;
  }

  async deposit(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    yieldFrom?: string,
    yieldTo?: string
  ): Promise<TransactionResponse> {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const companionAddress = await this.contractService.getHUBCompanionAddress();

    if (amountOfSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (yieldFrom) {
      const permissions = yieldTo
        ? [
            {
              operator: companionAddress,
              permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.TERMINATE],
            },
          ]
        : [
            {
              operator: companionAddress,
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.TERMINATE],
            },
          ];
      return this.meanApiService.depositUsingYield(
        from.address,
        to.address,
        weiValue,
        amountOfSwaps,
        swapInterval,
        yieldFrom,
        yieldTo,
        this.walletService.getAccount(),
        permissions
      );
    }

    if (from.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase()) {
      return this.meanApiService.depositUsingProtocolToken(
        from.address,
        yieldTo || to.address,
        weiValue,
        amountOfSwaps,
        swapInterval,
        this.walletService.getAccount(),
        []
      );
    }

    const hubInstance = await this.contractService.getHubInstance();

    const toToUse = to.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken : to;

    const permissions = yieldTo
      ? [{ operator: companionAddress, permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE] }]
      : [];

    return hubInstance.deposit(
      from.address,
      yieldTo || toToUse.address,
      weiValue,
      amountOfSwaps,
      swapInterval,
      this.walletService.getAccount(),
      permissions
    );
  }

  async withdraw(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : position.to;

    if (
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call withdraw without it being protocol token');
    }

    const hasYield = position.to.underlyingTokens.length;

    if (!useProtocolToken && !hasYield) {
      const hubInstance = await this.contractService.getHubInstance(position.version);

      return hubInstance.withdrawSwapped(position.positionId, this.walletService.getAccount());
    }

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    if (companionHasPermission) {
      return this.meanApiService.withdrawSwappedUsingOtherToken(
        position.positionId,
        this.walletService.getAccount(),
        position.version,
        useProtocolToken ? PROTOCOL_TOKEN_ADDRESS : toToUse.address
      );
    }
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      PERMISSIONS.WITHDRAW
    );

    return this.meanApiService.withdrawSwappedUsingOtherToken(
      position.positionId,
      this.walletService.getAccount(),
      position.version,
      useProtocolToken ? PROTOCOL_TOKEN_ADDRESS : toToUse.address,
      { permissions, deadline: deadline.toString(), v, r: hexlify(r), s: hexlify(s), tokenId: position.positionId }
    );
  }

  async terminate(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

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

    if (!useProtocolToken && !hasYield) {
      const hubInstance = await this.contractService.getHubInstance(position.version);

      return hubInstance.terminate(
        position.positionId,
        this.walletService.getAccount(),
        this.walletService.getAccount()
      );
    }

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    if (companionHasPermission) {
      return this.meanApiService.terminateUsingOtherTokens(
        position.positionId,
        this.walletService.getAccount(),
        this.walletService.getAccount(),
        position.version,
        position.from.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
          ? wrappedProtocolToken.address
          : position.from.address,
        position.to.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
          ? wrappedProtocolToken.address
          : position.to.address
      );
    }

    const permissionManagerAddress = await this.contractService.getPermissionManagerAddress(position.version);
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

    const erc712Name = position.version !== POSITION_VERSION_2 ? undefined : 'Mean Finance DCA';

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      PERMISSIONS.TERMINATE,
      permissionManagerAddress,
      erc712Name
    );

    return this.meanApiService.terminateUsingOtherTokens(
      position.positionId,
      this.walletService.getAccount(),
      this.walletService.getAccount(),
      position.version,
      position.from.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
        ? wrappedProtocolToken.address
        : position.from.address,
      position.to.address === PROTOCOL_TOKEN_ADDRESS && !useProtocolToken
        ? wrappedProtocolToken.address
        : position.to.address,
      {
        permissions,
        deadline: deadline.toString(),
        v,
        r: hexlify(r),
        s: hexlify(s),
        tokenId: position.positionId,
      }
    );
  }

  async modifyRateAndSwaps(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ): Promise<TransactionResponse> {
    const hubInstance = await this.contractService.getHubInstance(position.version);
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    if (!companionAddress) {
      companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
    }

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
    const remainingLiquidity = (position.depositedRateUnderlying || position.rate).mul(position.remainingSwaps);

    const hasYield = position.from.underlyingTokens.length;

    if ((position.from.address !== PROTOCOL_TOKEN_ADDRESS || useWrappedProtocolToken) && !hasYield) {
      if (newAmount.gte(remainingLiquidity)) {
        return hubInstance.increasePosition(
          position.positionId,
          newAmount.sub(remainingLiquidity),
          BigNumber.from(newSwaps)
        );
      }

      return hubInstance.reducePosition(
        position.positionId,
        remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount()
      );
    }

    if (newAmount.gte(remainingLiquidity)) {
      const companionHasIncrease = await this.companionHasPermission(position, PERMISSIONS.INCREASE);

      if (companionHasIncrease) {
        return this.meanApiService.increasePositionUsingOtherToken(
          position.positionId,
          newAmount.sub(remainingLiquidity),
          BigNumber.from(newSwaps),
          position.version,
          position.from.address === PROTOCOL_TOKEN_ADDRESS && useWrappedProtocolToken
            ? wrappedProtocolToken.address
            : position.from.address
        );
      }

      const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
        position,
        companionAddress,
        PERMISSIONS.INCREASE
      );

      return this.meanApiService.increasePositionUsingOtherToken(
        position.positionId,
        newAmount.sub(remainingLiquidity),
        BigNumber.from(newSwaps),
        position.version,
        position.from.address === PROTOCOL_TOKEN_ADDRESS && useWrappedProtocolToken
          ? wrappedProtocolToken.address
          : position.from.address,
        {
          permissions,
          deadline: deadline.toString(),
          v,
          r: hexlify(r),
          s: hexlify(s),
          tokenId: position.positionId,
        }
      );
    }

    const companionHasReduce = await this.companionHasPermission(position, PERMISSIONS.REDUCE);

    if (companionHasReduce) {
      return this.meanApiService.reducePositionUsingOtherToken(
        position.positionId,
        remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount(),
        position.version,
        position.from.address === PROTOCOL_TOKEN_ADDRESS && useWrappedProtocolToken
          ? wrappedProtocolToken.address
          : position.from.address
      );
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      PERMISSIONS.REDUCE
    );

    return this.meanApiService.reducePositionUsingOtherToken(
      position.positionId,
      remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.walletService.getAccount(),
      position.version,
      position.from.address === PROTOCOL_TOKEN_ADDRESS && useWrappedProtocolToken
        ? wrappedProtocolToken.address
        : position.from.address,
      { permissions, deadline: deadline.toString(), v, r: hexlify(r), s: hexlify(s), tokenId: position.positionId }
    );
  }

  async setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN_EXACT ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    let { id } = typeData;
    const network = await this.providerService.getNetwork();
    const protocolToken = getProtocolToken(network.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(network.chainId);

    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      const newPositionTypeData = typeData as NewPositionTypeData;
      id = `pending-transaction-${transaction.hash}`;
      const { fromYield, toYield } = newPositionTypeData;

      let fromToUse =
        newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.from;
      let toToUse =
        newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.to;

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

      this.currentPositions[`${id}-v${newPositionTypeData.version}`] = {
        from: fromToUse,
        to: toToUse,
        user: this.walletService.getAccount(),
        chainId: network.chainId,
        positionId: id,
        toWithdraw: BigNumber.from(0),
        swapInterval: BigNumber.from(newPositionTypeData.frequencyType),
        swapped: BigNumber.from(0),
        rate: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
        depositedRateUnderlying: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
        toWithdrawUnderlying: null,
        remainingLiquidityUnderlying: null,
        totalSwappedUnderlyingAccum: BigNumber.from(0),
        toWithdrawUnderlyingAccum: BigNumber.from(0),
        remainingLiquidity: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        remainingSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        totalSwaps: BigNumber.from(newPositionTypeData.frequencyValue),
        withdrawn: BigNumber.from(0),
        totalExecutedSwaps: BigNumber.from(0),
        id,
        startedAt: newPositionTypeData.startedAt,
        totalDeposited: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals),
        pendingTransaction: transaction.hash,
        status: 'ACTIVE',
        version: LATEST_VERSION,
        pairLastSwappedAt: newPositionTypeData.startedAt,
        pairNextSwapAvailableAt: newPositionTypeData.startedAt.toString(),
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
  }

  handleTransactionRejection(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN_EXACT ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;
    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    const { id } = typeData;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      delete this.currentPositions[`pending-transaction-${transaction.hash}-v${LATEST_VERSION}`];
    } else if (id) {
      this.currentPositions[id].pendingTransaction = '';
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN_EXACT
    ) {
      return;
    }

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    if (!this.currentPositions[typeData.id] && transaction.type !== TRANSACTION_TYPES.NEW_POSITION) {
      if (transaction.position) {
        this.currentPositions[typeData.id] = {
          ...transaction.position,
        };
      } else {
        return;
      }
    }

    switch (transaction.type) {
      case TRANSACTION_TYPES.NEW_POSITION: {
        const newPositionTypeData = transaction.typeData as NewPositionTypeData;
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
          newPositionTypeData.oracle,
          BigNumber.from(newPositionTypeData.frequencyType)
        );
        break;
      }
      case TRANSACTION_TYPES.TERMINATE_POSITION: {
        const terminatePositionTypeData = transaction.typeData as TerminatePositionTypeData;
        this.pastPositions[terminatePositionTypeData.id] = {
          ...this.currentPositions[terminatePositionTypeData.id],
          toWithdraw: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingSwaps: BigNumber.from(0),
          pendingTransaction: '',
        };
        delete this.currentPositions[terminatePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MIGRATE_POSITION: {
        const migratePositionTypeData = transaction.typeData as MigratePositionTypeData;
        this.pastPositions[migratePositionTypeData.id] = {
          ...this.currentPositions[migratePositionTypeData.id],
          pendingTransaction: '',
        };
        if (migratePositionTypeData.newId) {
          this.currentPositions[migratePositionTypeData.newId] = {
            ...this.currentPositions[migratePositionTypeData.id],
            pendingTransaction: '',
            toWithdraw: BigNumber.from(0),
            swapped: BigNumber.from(0),
            withdrawn: BigNumber.from(0),
            totalExecutedSwaps: BigNumber.from(0),
            status: 'ACTIVE',
            version: LATEST_VERSION,
            id: migratePositionTypeData.newId,
          };
        }
        delete this.currentPositions[migratePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MIGRATE_POSITION_YIELD: {
        const migratePositionYieldTypeData = transaction.typeData as MigratePositionYieldTypeData;
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
            depositedRateUnderlying: this.currentPositions[migratePositionYieldTypeData.id].rate,
            toWithdrawUnderlyingAccum: BigNumber.from(0),
            totalSwappedUnderlyingAccum: BigNumber.from(0),
            pendingTransaction: '',
            toWithdraw: BigNumber.from(0),
            swapped: BigNumber.from(0),
            withdrawn: BigNumber.from(0),
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
      case TRANSACTION_TYPES.WITHDRAW_POSITION: {
        const withdrawPositionTypeData = transaction.typeData as WithdrawTypeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
        this.currentPositions[withdrawPositionTypeData.id].toWithdraw = BigNumber.from(0);
        this.currentPositions[withdrawPositionTypeData.id].toWithdrawUnderlying = BigNumber.from(0);
        this.currentPositions[withdrawPositionTypeData.id].toWithdrawUnderlyingAccum = BigNumber.from(0);
        break;
      }
      case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
        const addFundsTypeData = transaction.typeData as AddFundsTypeData;
        this.currentPositions[addFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[addFundsTypeData.id].remainingLiquidity = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.add(parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals));
        this.currentPositions[addFundsTypeData.id].rate = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[addFundsTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.RESET_POSITION: {
        const resetPositionTypeData = transaction.typeData as ResetPositionTypeData;
        const resetPositionSwapDifference = BigNumber.from(resetPositionTypeData.newSwaps).lt(
          this.currentPositions[resetPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[resetPositionTypeData.id].remainingSwaps.sub(
              BigNumber.from(resetPositionTypeData.newSwaps)
            )
          : BigNumber.from(resetPositionTypeData.newSwaps).sub(
              this.currentPositions[resetPositionTypeData.id].remainingSwaps
            );
        this.currentPositions[resetPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[resetPositionTypeData.id].remainingLiquidity = this.currentPositions[
          resetPositionTypeData.id
        ].remainingLiquidity.add(parseUnits(resetPositionTypeData.newFunds, resetPositionTypeData.decimals));
        this.currentPositions[resetPositionTypeData.id].totalSwaps = BigNumber.from(resetPositionTypeData.newSwaps).lt(
          this.currentPositions[resetPositionTypeData.id].remainingSwaps
        )
          ? this.currentPositions[resetPositionTypeData.id].totalSwaps.sub(resetPositionSwapDifference)
          : this.currentPositions[resetPositionTypeData.id].totalSwaps.add(resetPositionSwapDifference);
        this.currentPositions[resetPositionTypeData.id].remainingSwaps = this.currentPositions[
          resetPositionTypeData.id
        ].remainingSwaps.add(BigNumber.from(resetPositionTypeData.newSwaps));
        this.currentPositions[resetPositionTypeData.id].rate = this.currentPositions[
          resetPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[resetPositionTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.REMOVE_FUNDS: {
        const removeFundsTypeData = transaction.typeData as RemoveFundsTypeData;
        const removeFundsDifference = parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
          this.currentPositions[removeFundsTypeData.id].remainingLiquidity
        )
          ? this.currentPositions[removeFundsTypeData.id].remainingSwaps
          : BigNumber.from(0);
        const originalRemainingLiquidity = this.currentPositions[removeFundsTypeData.id].remainingLiquidity.toString();
        this.currentPositions[removeFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[removeFundsTypeData.id].totalSwaps = parseUnits(
          removeFundsTypeData.ammountToRemove,
          removeFundsTypeData.decimals
        ).eq(this.currentPositions[removeFundsTypeData.id].remainingLiquidity)
          ? this.currentPositions[removeFundsTypeData.id].totalSwaps.sub(removeFundsDifference)
          : this.currentPositions[removeFundsTypeData.id].totalSwaps;
        this.currentPositions[removeFundsTypeData.id].remainingLiquidity = this.currentPositions[
          removeFundsTypeData.id
        ].remainingLiquidity.sub(parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals));
        this.currentPositions[removeFundsTypeData.id].rate = this.currentPositions[
          removeFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[removeFundsTypeData.id].remainingSwaps);
        this.currentPositions[removeFundsTypeData.id].remainingSwaps = parseUnits(
          removeFundsTypeData.ammountToRemove,
          removeFundsTypeData.decimals
        ).eq(BigNumber.from(originalRemainingLiquidity))
          ? BigNumber.from(0)
          : this.currentPositions[removeFundsTypeData.id].remainingSwaps;
        break;
      }
      case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
        const modifySwapsPositionTypeData = transaction.typeData as ModifySwapsPositionTypeData;
        this.currentPositions[modifySwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifySwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifySwapsPositionTypeData.id].rate = this.currentPositions[
          modifySwapsPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps);
        break;
      }
      case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
        const modifyRateAndSwapsPositionTypeData = transaction.typeData as ModifyRateAndSwapsPositionTypeData;
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
      case TRANSACTION_TYPES.WITHDRAW_FUNDS: {
        const withdrawFundsTypeData = transaction.typeData as WithdrawFundsTypeData;
        this.currentPositions[withdrawFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawFundsTypeData.id].rate = BigNumber.from(0);
        this.currentPositions[withdrawFundsTypeData.id].depositedRateUnderlying = this.currentPositions[
          withdrawFundsTypeData.id
        ].depositedRateUnderlying
          ? BigNumber.from('0')
          : null;
        this.currentPositions[withdrawFundsTypeData.id].totalSwaps = this.currentPositions[
          withdrawFundsTypeData.id
        ].totalSwaps.sub(this.currentPositions[withdrawFundsTypeData.id].remainingSwaps);
        this.currentPositions[withdrawFundsTypeData.id].remainingSwaps = BigNumber.from(0);
        this.currentPositions[withdrawFundsTypeData.id].remainingLiquidity = BigNumber.from(0);
        break;
      }
      case TRANSACTION_TYPES.TRANSFER_POSITION: {
        const transferPositionTypeData = transaction.typeData as TransferTypeData;
        delete this.currentPositions[transferPositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.MODIFY_PERMISSIONS: {
        const modifyPermissionsTypeData = transaction.typeData as ModifyPermissionsTypeData;
        this.currentPositions[modifyPermissionsTypeData.id].pendingTransaction = '';
        break;
      }
      default:
        break;
    }
  }
}

/* eslint-enable no-await-in-loop */
