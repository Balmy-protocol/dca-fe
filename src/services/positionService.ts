/* eslint-disable no-await-in-loop */
import { ethers, Signer, BigNumber, VoidSigner } from 'ethers';
import keyBy from 'lodash/keyBy';
import { TransactionResponse } from '@ethersproject/providers';
import { parseUnits } from '@ethersproject/units';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
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
  POSITION_VERSION_3,
  TRANSACTION_TYPES,
  PositionVersions,
} from 'config/constants';
import { PermissionManagerContract } from 'types/contracts';
import { fromRpcSig } from 'ethereumjs-util';
import gqlFetchAll, { GraphqlResults } from 'utils/gqlFetchAll';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import PairService from './pairService';
import MeanApiService from './meanApiService';

export default class PositionService {
  modal: SafeAppWeb3Modal;

  signer: Signer;

  currentPositions: PositionKeyBy;

  pastPositions: PositionKeyBy;

  contractService: ContractService;

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
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.pairService = pairService;
    this.meanApiService = meanApiService;
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

    const results = await Promise.all(promises);

    const currentPositions = {
      ...this.currentPositions,
    };

    this.currentPositions = results.reduce<PositionKeyBy>((acc, gqlResult, index) => {
      const { network, version } = networksAndVersions[index];
      const protocolToken = getProtocolToken(network);
      const wrappedProtocolToken = getWrappedProtocolToken(network);
      if (gqlResult.data) {
        return {
          ...acc,
          ...keyBy(
            gqlResult.data.positions.map((position: PositionResponse) => {
              const existingPosition = this.currentPositions[`${position.id}-v${version}`];

              const pendingTransaction = (existingPosition && existingPosition.pendingTransaction) || '';
              return {
                from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
                to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
                user: position.user,
                swapInterval: BigNumber.from(position.swapInterval.interval),
                swapped: BigNumber.from(position.totalSwapped),
                rate: BigNumber.from(position.current.rate),
                remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
                remainingSwaps: BigNumber.from(position.current.remainingSwaps),
                withdrawn: BigNumber.from(position.totalWithdrawn),
                toWithdraw: BigNumber.from(position.current.toWithdraw),
                totalSwaps: BigNumber.from(position.totalSwaps),
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

    const results = await Promise.all(promises);

    const pastPositions = {
      ...this.pastPositions,
    };

    this.pastPositions = results.reduce<PositionKeyBy>((acc, gqlResult, index) => {
      const { network, version } = networksAndVersions[index];
      const protocolToken = getProtocolToken(network);
      const wrappedProtocolToken = getWrappedProtocolToken(network);
      if (gqlResult.data) {
        return {
          ...acc,
          ...keyBy(
            gqlResult.data.positions.map((position: PositionResponse) => ({
              from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
              to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
              user: position.user,
              swapInterval: BigNumber.from(position.swapInterval.interval),
              swapped: BigNumber.from(position.totalSwapped),
              rate: BigNumber.from(position.current.rate),
              remainingLiquidity: BigNumber.from(position.current.remainingLiquidity),
              remainingSwaps: BigNumber.from(position.current.remainingSwaps),
              withdrawn: BigNumber.from(position.totalWithdrawn),
              toWithdraw: BigNumber.from(position.current.toWithdraw),
              totalSwaps: BigNumber.from(position.totalSwaps),
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
            })),
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
    const signer = this.walletService.getSigner();
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || (await this.contractService.getPermissionManagerAddress(version));
    const signName = erc712Name || 'Mean Finance - DCA Position';
    const currentNetwork = await this.walletService.getNetwork();
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

    const PermissionPermit = [
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
        version: '1',
        chainId: currentNetwork.chainId,
        verifyingContract: permissionManagerAddress,
      },
      { PermissionSet, PermissionPermit },
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
    const permissionManagerV2Address = await this.contractService.getPermissionManagerAddress(POSITION_VERSION_2);
    const hubAddress = await this.contractService.getHUBAddress();
    const hubV2Address = await this.contractService.getHUBAddress(POSITION_VERSION_2);
    const migratorAddress = await this.contractService.getMigratorAddress();
    const betaMigratorInstance = await this.contractService.getMigratorInstance();

    const erc712Name = 'Mean Finance DCA';

    const generatedSignature = await this.getSignatureForPermission(
      position,
      migratorAddress,
      PERMISSIONS.TERMINATE,
      permissionManagerV2Address,
      erc712Name
    );

    return betaMigratorInstance.migrate(hubV2Address, position.positionId, generatedSignature, hubAddress);
  }

  async companionHasPermission(position: Position, permission: number) {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);
    const companionAddress = await this.contractService.getHUBCompanionAddress(position.version);

    return permissionManagerInstance.hasPermission(position.positionId, companionAddress, permission);
  }

  async companionIsApproved(position: Position): Promise<boolean> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);
    const companionAddress = await this.contractService.getHUBCompanionAddress(position.version);

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
    const companionAddress = await this.contractService.getHUBCompanionAddress(position.version);

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
    frequencyValue: string
  ): Promise<TransactionResponse> {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

    if (amountOfSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (from.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase()) {
      return this.meanApiService.depositUsingProtocolToken(
        from.address,
        to.address,
        weiValue,
        amountOfSwaps,
        swapInterval,
        this.walletService.getAccount(),
        []
      );
    }

    const hubInstance = await this.contractService.getHubInstance();

    const toToUse = to.address.toLowerCase() === PROTOCOL_TOKEN_ADDRESS.toLowerCase() ? wrappedProtocolToken : to;

    return hubInstance.deposit(
      from.address,
      toToUse.address,
      weiValue,
      amountOfSwaps,
      swapInterval,
      this.walletService.getAccount(),
      []
    );
  }

  async withdraw(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

    if (
      position.to.address !== PROTOCOL_TOKEN_ADDRESS &&
      position.to.address !== wrappedProtocolToken.address &&
      useProtocolToken
    ) {
      throw new Error('Should not call withdraw without it being protocol token');
    }

    if (!useProtocolToken) {
      const hubInstance = await this.contractService.getHubInstance(position.version);

      return hubInstance.withdrawSwapped(position.positionId, this.walletService.getAccount());
    }

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.WITHDRAW);

    if (companionHasPermission) {
      return this.meanApiService.withdrawSwappedUsingProtocolToken(
        position.positionId,
        this.walletService.getAccount(),
        position.version
      );
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      await this.contractService.getHUBCompanionAddress(position.version),
      PERMISSIONS.WITHDRAW
    );

    return this.meanApiService.withdrawSwappedUsingProtocolToken(
      position.positionId,
      this.walletService.getAccount(),
      position.version,
      { permissions, deadline: deadline.toString(), v, r: r.toString(), s: s.toString(), tokenId: position.positionId }
    );
  }

  async terminate(position: Position, useProtocolToken: boolean): Promise<TransactionResponse> {
    const currentNetwork = await this.walletService.getNetwork();
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

    if (!useProtocolToken) {
      const hubInstance = await this.contractService.getHubInstance(position.version);

      return hubInstance.terminate(
        position.positionId,
        this.walletService.getAccount(),
        this.walletService.getAccount()
      );
    }

    const companionHasPermission = await this.companionHasPermission(position, PERMISSIONS.TERMINATE);

    if (companionHasPermission) {
      if (position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address) {
        return this.meanApiService.terminateUsingProtocolTokenAsTo(
          position.positionId,
          this.walletService.getAccount(),
          this.walletService.getAccount(),
          position.version
        );
      }
      return this.meanApiService.terminateUsingProtocolTokenAsFrom(
        position.positionId,
        this.walletService.getAccount(),
        this.walletService.getAccount(),
        position.version
      );
    }

    const permissionManagerAddress = await this.contractService.getPermissionManagerAddress(position.version);
    const companionAddress = await this.contractService.getHUBCompanionAddress(position.version);

    const erc712Name = position.version === POSITION_VERSION_3 ? undefined : 'Mean Finance DCA';

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      PERMISSIONS.TERMINATE,
      permissionManagerAddress,
      erc712Name
    );

    if (position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address) {
      return this.meanApiService.terminateUsingProtocolTokenAsTo(
        position.positionId,
        this.walletService.getAccount(),
        this.walletService.getAccount(),
        position.version,
        {
          permissions,
          deadline: deadline.toString(),
          v,
          r: r.toString(),
          s: s.toString(),
          tokenId: position.positionId,
        }
      );
    }

    return this.meanApiService.terminateUsingProtocolTokenAsFrom(
      position.positionId,
      this.walletService.getAccount(),
      this.walletService.getAccount(),
      position.version,
      { permissions, deadline: deadline.toString(), v, r: r.toString(), s: s.toString(), tokenId: position.positionId }
    );
  }

  async addFunds(position: Position, newDeposit: string): Promise<TransactionResponse> {
    const hubInstance = await this.contractService.getHubInstance(position.version);

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(position.remainingSwaps));

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return this.meanApiService.increasePositionUsingProtocolToken(
          position.positionId,
          newAmount.sub(position.remainingLiquidity),
          position.remainingSwaps,
          position.version
        );
      }
      return hubInstance.increasePosition(
        position.positionId,
        newAmount.sub(position.remainingLiquidity),
        position.remainingSwaps
      );
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return this.meanApiService.reducePositionUsingProtocolToken(
        position.positionId,
        position.remainingLiquidity.sub(newAmount),
        position.remainingSwaps,
        this.walletService.getAccount(),
        position.version
      );
    }

    return hubInstance.reducePosition(
      position.positionId,
      position.remainingLiquidity.sub(newAmount),
      position.remainingSwaps,
      this.walletService.getAccount()
    );
  }

  async resetPosition(position: Position, newDeposit: string, newSwaps: string): Promise<TransactionResponse> {
    const hubInstance = await this.contractService.getHubInstance(position.version);

    if (BigNumber.from(newSwaps).gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newRate = parseUnits(newDeposit, position.from.decimals)
      .add(position.remainingLiquidity)
      .div(BigNumber.from(newSwaps));

    const newAmount = newRate.mul(BigNumber.from(newSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return this.meanApiService.increasePositionUsingProtocolToken(
          position.positionId,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps),
          position.version
        );
      }
      return hubInstance.increasePosition(
        position.positionId,
        newAmount.sub(position.remainingLiquidity),
        BigNumber.from(newSwaps)
      );
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return this.meanApiService.reducePositionUsingProtocolToken(
        position.positionId,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount(),
        position.version
      );
    }

    return hubInstance.reducePosition(
      position.positionId,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.walletService.getAccount()
    );
  }

  async modifyRateAndSwaps(
    position: Position,
    newRate: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ): Promise<TransactionResponse> {
    const hubInstance = await this.contractService.getHubInstance(position.version);
    const currentNetwork = await this.walletService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const companionAddress = await this.contractService.getHUBCompanionAddress(position.version);

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

    const newAmount = BigNumber.from(parseUnits(newRate, position.from.decimals)).mul(BigNumber.from(newSwaps));

    if (position.from.address !== PROTOCOL_TOKEN_ADDRESS || useWrappedProtocolToken) {
      if (newAmount.gte(position.remainingLiquidity)) {
        return hubInstance.increasePosition(
          position.positionId,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps)
        );
      }

      return hubInstance.reducePosition(
        position.positionId,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount()
      );
    }

    if (newAmount.gte(position.remainingLiquidity)) {
      const companionHasIncrease = await this.companionHasPermission(position, PERMISSIONS.INCREASE);

      if (companionHasIncrease) {
        return this.meanApiService.increasePositionUsingProtocolToken(
          position.positionId,
          newAmount.sub(position.remainingLiquidity),
          BigNumber.from(newSwaps),
          position.version
        );
      }

      const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
        position,
        companionAddress,
        PERMISSIONS.INCREASE
      );

      return this.meanApiService.increasePositionUsingProtocolToken(
        position.positionId,
        newAmount.sub(position.remainingLiquidity),
        BigNumber.from(newSwaps),
        position.version,
        {
          permissions,
          deadline: deadline.toString(),
          v,
          r: r.toString(),
          s: s.toString(),
          tokenId: position.positionId,
        }
      );
    }

    const companionHasReduce = await this.companionHasPermission(position, PERMISSIONS.REDUCE);

    if (companionHasReduce) {
      return this.meanApiService.reducePositionUsingProtocolToken(
        position.positionId,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount(),
        position.version
      );
    }

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      PERMISSIONS.REDUCE
    );

    return this.meanApiService.reducePositionUsingProtocolToken(
      position.positionId,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.walletService.getAccount(),
      position.version,
      { permissions, deadline: deadline.toString(), v, r: r.toString(), s: s.toString(), tokenId: position.positionId }
    );
  }

  async removeFunds(position: Position, ammountToRemove: string): Promise<TransactionResponse> {
    const hubInstance = await this.contractService.getHubInstance(position.version);

    const newSwaps = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingSwaps;

    const newRate = parseUnits(ammountToRemove, position.from.decimals).eq(position.remainingLiquidity)
      ? BigNumber.from(0)
      : position.remainingLiquidity
          .sub(parseUnits(ammountToRemove, position.from.decimals))
          .div(BigNumber.from(position.remainingSwaps));

    if (newSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    const newAmount = newRate.mul(BigNumber.from(position.remainingSwaps));
    if (newAmount.gte(position.remainingLiquidity)) {
      if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
        return this.meanApiService.increasePositionUsingProtocolToken(
          position.positionId,
          newAmount.sub(position.remainingLiquidity),
          newSwaps,
          position.version
        );
      }

      return hubInstance.increasePosition(position.positionId, newAmount.sub(position.remainingLiquidity), newSwaps);
    }

    if (position.from.address === PROTOCOL_TOKEN_ADDRESS) {
      return this.meanApiService.reducePositionUsingProtocolToken(
        position.positionId,
        position.remainingLiquidity.sub(newAmount),
        BigNumber.from(newSwaps),
        this.walletService.getAccount(),
        position.version
      );
    }

    return hubInstance.reducePosition(
      position.positionId,
      position.remainingLiquidity.sub(newAmount),
      BigNumber.from(newSwaps),
      this.walletService.getAccount()
    );
  }

  async setPendingTransaction(transaction: TransactionDetails) {
    if (
      transaction.type === TRANSACTION_TYPES.NEW_PAIR ||
      transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN ||
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;

    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    let { id } = typeData;
    const network = await this.walletService.getNetwork();
    const protocolToken = getProtocolToken(network.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(network.chainId);

    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      const newPositionTypeData = typeData as NewPositionTypeData;
      id = `pending-transaction-${transaction.hash}`;
      this.currentPositions[`${id}-v${newPositionTypeData.version}`] = {
        from:
          newPositionTypeData.from.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.from,
        to: newPositionTypeData.to.address === wrappedProtocolToken.address ? protocolToken : newPositionTypeData.to,
        user: this.walletService.getAccount(),
        chainId: network.chainId,
        positionId: id,
        toWithdraw: BigNumber.from(0),
        swapInterval: BigNumber.from(newPositionTypeData.frequencyType),
        swapped: BigNumber.from(0),
        rate: parseUnits(newPositionTypeData.fromValue, newPositionTypeData.from.decimals).div(
          BigNumber.from(newPositionTypeData.frequencyValue)
        ),
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
        version: POSITION_VERSION_3,
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
      transaction.type === TRANSACTION_TYPES.WRAP_ETHER
    )
      return;
    const typeData = transaction.typeData as TransactionPositionTypeDataOptions;
    const { id } = typeData;
    if (transaction.type === TRANSACTION_TYPES.NEW_POSITION) {
      delete this.currentPositions[`pending-transaction-${transaction.hash}`];
    } else {
      this.currentPositions[id].pendingTransaction = '';
    }
  }

  handleTransaction(transaction: TransactionDetails) {
    if (transaction.type === TRANSACTION_TYPES.APPROVE_TOKEN) {
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
        this.pairService.addNewPair(newPositionTypeData.from, newPositionTypeData.to, newPositionTypeData.oracle);
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
            version: POSITION_VERSION_3,
            id: migratePositionTypeData.newId,
          };
        }
        delete this.currentPositions[migratePositionTypeData.id];
        break;
      }
      case TRANSACTION_TYPES.WITHDRAW_POSITION: {
        const withdrawPositionTypeData = transaction.typeData as WithdrawTypeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
        this.currentPositions[withdrawPositionTypeData.id].toWithdraw = BigNumber.from(0);
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
