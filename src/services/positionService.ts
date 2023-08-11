/* eslint-disable no-await-in-loop */
import { ethers, Signer, BigNumber, VoidSigner, PopulatedTransaction } from 'ethers';
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
  PositionsGraphqlResponse,
  PositionResponse,
  YieldOption,
  PermissionManagerContract,
  PermissionPermit,
  TransactionTypes,
  PositionVersions,
} from '@types';

// GRAPHQL
import GET_POSITIONS from '@graphql/getPositions.graphql';

// ABIS
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager.json';

// MOCKS
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken, getProtocolToken } from '@common/mocks/tokens';
import {
  MAX_UINT_32,
  NETWORKS_FOR_MENU,
  POSITIONS_VERSIONS,
  POSITION_VERSION_2,
  LATEST_VERSION,
  SIGN_VERSION,
  TOKEN_TYPE_YIELD_BEARING_SHARES,
} from '@constants';
import { fromRpcSig } from 'ethereumjs-util';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { getDisplayToken, sortTokens } from '@common/utils/parsing';
import gqlFetchAll, { GraphqlResults } from '@common/utils/gqlFetchAll';
import { doesCompanionNeedIncreaseOrReducePermission } from '@common/utils/companion';
import { AddFunds, DCAPermission } from '@mean-finance/sdk';
import GraphqlService from './graphql';
import ContractService from './contractService';
import WalletService from './walletService';
import PairService from './pairService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';
import SafeService from './safeService';
import Permit2Service from './permit2Service';
import SdkService from './sdkService';

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

  apolloClient: Record<PositionVersions, Record<number, GraphqlService>>;

  hasFetchedCurrentPositions: boolean;

  hasFetchedPastPositions: boolean;

  constructor(
    walletService: WalletService,
    pairService: PairService,
    contractService: ContractService,
    meanApiService: MeanApiService,
    safeService: SafeService,
    DCASubgraph: Record<PositionVersions, Record<number, GraphqlService>>,
    providerService: ProviderService,
    permit2Service: Permit2Service,
    sdkService: SdkService
  ) {
    this.contractService = contractService;
    this.walletService = walletService;
    this.pairService = pairService;
    this.meanApiService = meanApiService;
    this.providerService = providerService;
    this.apolloClient = DCASubgraph;
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
                pairId: position.pair.id,
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
                version,
                chainId: network,
                pairLastSwappedAt:
                  (position.pair.swaps[0] && parseInt(position.pair.swaps[0].executedAtTimestamp, 10)) ||
                  position.createdAtTimestamp,
                pairNextSwapAvailableAt: position.createdAtTimestamp.toString(),
                ...(!!position.permissions && { permissions: position.permissions }),
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
  async fillAddressPermissions(
    position: Position,
    contractAddress: string,
    permission: DCAPermission,
    permissionManagerAddressProvided?: string
  ) {
    const signer = this.providerService.getSigner();
    const { positionId, version } = position;
    const permissionManagerAddress =
      permissionManagerAddressProvided || (await this.contractService.getPermissionManagerAddress(version));
    const permissionManagerInstance = new ethers.Contract(
      permissionManagerAddress,
      PERMISSION_MANAGER_ABI.abi,
      signer
    ) as unknown as PermissionManagerContract;

    const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await Promise.all([
      permissionManagerInstance.hasPermission(positionId, contractAddress, DCAPermission.INCREASE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, DCAPermission.REDUCE),
      permissionManagerInstance.hasPermission(positionId, contractAddress, DCAPermission.WITHDRAW),
      permissionManagerInstance.hasPermission(positionId, contractAddress, DCAPermission.TERMINATE),
    ]);

    const defaultPermissions = [
      ...(hasIncrease ? [DCAPermission.INCREASE] : []),
      ...(hasReduce ? [DCAPermission.REDUCE] : []),
      ...(hasWithdraw ? [DCAPermission.WITHDRAW] : []),
      ...(hasTerminate ? [DCAPermission.TERMINATE] : []),
    ];

    return [{ operator: contractAddress, permissions: [...defaultPermissions, permission] }];
  }

  async getSignatureForPermission(
    position: Position,
    contractAddress: string,
    permission: DCAPermission,
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

    const permissions = await this.fillAddressPermissions(
      position,
      contractAddress,
      permission,
      permissionManagerAddressProvided
    );

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

  async migrateYieldPosition(
    position: Position,
    fromYield?: YieldOption | null,
    toYield?: YieldOption | null
  ): Promise<TransactionResponse> {
    const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);
    let permissionsPermit: PermissionPermit | undefined;
    const companionHasPermission = await this.companionHasPermission(position, DCAPermission.TERMINATE);
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const fromToUse =
      position.from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.from.address;
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.to.address;

    if (!companionHasPermission) {
      const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
        position,
        companionAddress,
        DCAPermission.TERMINATE
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
    const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

    return permissionManagerInstance.hasPermission(position.positionId, companionAddress, permission);
  }

  async getModifyPermissionsTx(
    position: Position,
    newPermissions: { operator: string; permissions: DCAPermission[] }[]
  ): Promise<PopulatedTransaction> {
    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(position.version);

    return permissionManagerInstance.populateTransaction.modify(position.positionId, newPermissions);
  }

  async modifyPermissions(position: Position, newPermissions: PositionPermission[]): Promise<TransactionResponse> {
    const tx = await this.getModifyPermissionsTx(
      position,
      newPermissions.map(({ permissions, operator }) => ({
        operator,
        permissions: permissions.map((permission) => DCAPermission[permission]),
      }))
    );

    return this.providerService.sendTransactionWithGasLimit(tx);
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

  getAllowanceTarget(chainId: number, from: Token, yieldFrom?: Nullable<string>, usePermit2?: boolean) {
    const wrappedProtocolToken = getWrappedProtocolToken(chainId);

    const fromToUse =
      yieldFrom || (from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address);

    return this.sdkService.sdk.dcaService.management.getAllowanceTarget({
      chainId,
      from: fromToUse,
      depositWith: from.address,
      usePermit2,
    });
  }

  async buildDepositParams(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    yieldFrom?: string,
    yieldTo?: string
  ) {
    const token = from;

    const weiValue = parseUnits(fromValue, token.decimals);

    const amountOfSwaps = BigNumber.from(frequencyValue);
    const swapInterval = frequencyType;
    const companionAddress = await this.contractService.getHUBCompanionAddress();
    let permissions: number[] = [];

    if (amountOfSwaps.gt(BigNumber.from(MAX_UINT_32))) {
      throw new Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`);
    }

    if (yieldFrom) {
      permissions = [...permissions, DCAPermission.INCREASE, DCAPermission.REDUCE];
    }

    if (yieldTo) {
      permissions = [...permissions, DCAPermission.WITHDRAW];
    }

    if (yieldFrom || yieldTo) {
      permissions = [...permissions, DCAPermission.TERMINATE];
    }

    return {
      takeFrom: from.address,
      from: from.address,
      to: to.address,
      totalAmmount: weiValue,
      swaps: amountOfSwaps,
      interval: swapInterval,
      account: this.walletService.getAccount(),
      permissions: [{ operator: companionAddress, permissions }],
      yieldFrom,
      yieldTo,
    };
  }

  async buildDepositTx(
    fromToken: Token,
    toToken: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    possibleYieldFrom?: string,
    possibleYieldTo?: string,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ) {
    const { takeFrom, from, to, totalAmmount, swaps, interval, account, permissions, yieldFrom, yieldTo } =
      await this.buildDepositParams(
        fromToken,
        toToken,
        fromValue,
        frequencyType,
        frequencyValue,
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

    return this.sdkService.sdk.dcaService.management.buildCreatePositionTx({
      chainId: currentNetwork.chainId,
      from: { address: from, variantId: fromToUse },
      to: { address: to, variantId: toToUse },
      swapInterval: interval.toNumber(),
      amountOfSwaps: swaps.toNumber(),
      owner: account,
      permissions,
      deposit,
    });
  }

  async approveAndDepositSafe(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    yieldFrom?: string,
    yieldTo?: string
  ) {
    const { totalAmmount } = await this.buildDepositParams(
      from,
      to,
      fromValue,
      frequencyType,
      frequencyValue,
      yieldFrom,
      yieldTo
    );

    const currentNetwork = await this.providerService.getNetwork();

    const allowanceTarget = this.getAllowanceTarget(currentNetwork.chainId, from, yieldFrom, false);

    const approveTx = await this.walletService.buildApproveSpecificTokenTx(from, allowanceTarget, totalAmmount);

    const depositTx = await this.buildDepositTx(from, to, fromValue, frequencyType, frequencyValue, yieldFrom, yieldTo);

    return this.safeService.submitMultipleTxs([approveTx, depositTx]);
  }

  async deposit(
    from: Token,
    to: Token,
    fromValue: string,
    frequencyType: BigNumber,
    frequencyValue: string,
    passedYieldFrom?: string,
    passedYieldTo?: string,
    signature?: { deadline: number; nonce: BigNumber; rawSignature: string }
  ): Promise<TransactionResponse> {
    const tx = await this.buildDepositTx(
      from,
      to,
      fromValue,
      frequencyType,
      frequencyValue,
      passedYieldFrom,
      passedYieldTo,
      signature
    );

    return this.providerService.sendTransactionWithGasLimit(tx);
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

    const companionHasPermission = await this.companionHasPermission(position, DCAPermission.WITHDRAW);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

      permissionPermit = await this.getSignatureForPermission(position, companionAddress, DCAPermission.WITHDRAW);
    }

    const tx = await this.sdkService.sdk.dcaService.management.buildWithdrawPositionTx({
      chainId: currentNetwork.chainId,
      positionId: position.positionId,
      withdraw: {
        convertTo: useProtocolToken ? PROTOCOL_TOKEN_ADDRESS : toToUse.address,
      },
      recipient: position.user,
      permissionPermit: permissionPermit && {
        permissions: permissionPermit.permissions,
        deadline: permissionPermit.deadline.toString(),
        v: permissionPermit.v,
        r: hexlify(permissionPermit.r),
        s: hexlify(permissionPermit.s),
        tokenId: position.positionId,
      },
    });

    return this.providerService.sendTransactionWithGasLimit(tx);
  }

  async withdrawSafe(position: Position) {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken : position.to;

    const hasYield = position.to.underlyingTokens.length;

    const companionHasPermission = await this.companionHasPermission(position, DCAPermission.WITHDRAW);

    const withdrawTx = await this.sdkService.sdk.dcaService.management.buildWithdrawPositionTx({
      chainId: currentNetwork.chainId,
      positionId: position.positionId,
      withdraw: {
        convertTo: toToUse.address,
      },
      recipient: position.user,
    });

    let txs: TransactionRequest[] = [withdrawTx];
    if (!companionHasPermission && hasYield) {
      const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

      const permissions = await this.fillAddressPermissions(position, companionAddress, DCAPermission.WITHDRAW);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
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

    const companionHasPermission = await this.companionHasPermission(position, DCAPermission.TERMINATE);

    let permissionPermit: Awaited<ReturnType<typeof this.getSignatureForPermission>> | undefined;

    if (!companionHasPermission && (useProtocolToken || hasYield)) {
      let companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

      if (!companionAddress) {
        companionAddress = await this.contractService.getHUBCompanionAddress(position.version);
      }

      const permissionManagerAddress = await this.contractService.getPermissionManagerAddress(position.version);

      const erc712Name = position.version !== POSITION_VERSION_2 ? undefined : 'Mean Finance DCA';

      permissionPermit = await this.getSignatureForPermission(
        position,
        companionAddress,
        DCAPermission.TERMINATE,
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

    const tx = await this.sdkService.sdk.dcaService.management.buildTerminatePositionTx({
      chainId: currentNetwork.chainId,
      positionId: position.positionId,
      withdraw: {
        unswappedConvertTo: fromToUse,
        swappedConvertTo: toToUse,
      },
      recipient: position.user,
      permissionPermit: permissionPermit && {
        permissions: permissionPermit.permissions,
        deadline: permissionPermit.deadline.toString(),
        v: permissionPermit.v,
        r: hexlify(permissionPermit.r),
        s: hexlify(permissionPermit.s),
        tokenId: position.positionId,
      },
    });

    return this.providerService.sendTransactionWithGasLimit(tx);
  }

  async terminateSafe(position: Position) {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

    const hasYield =
      (position.from.underlyingTokens.length && position.remainingLiquidity.gt(BigNumber.from(0))) ||
      (position.to.underlyingTokens.length && position.toWithdraw.gt(BigNumber.from(0)));

    const companionHasPermission = await this.companionHasPermission(position, DCAPermission.TERMINATE);

    const fromToUse =
      position.from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.from.address;

    const toToUse = position.to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : position.to.address;

    const terminateTx = await this.sdkService.sdk.dcaService.management.buildTerminatePositionTx({
      chainId: currentNetwork.chainId,
      positionId: position.positionId,
      withdraw: {
        unswappedConvertTo: fromToUse,
        swappedConvertTo: toToUse,
      },
      recipient: position.user,
    });

    let txs: TransactionRequest[] = [terminateTx];

    if (!companionHasPermission && hasYield) {
      const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

      const permissions = await this.fillAddressPermissions(position, companionAddress, DCAPermission.TERMINATE);
      const modifyPermissionTx = await this.getModifyPermissionsTx(position, permissions);

      txs = [modifyPermissionTx, ...txs];
    }

    return this.safeService.submitMultipleTxs(txs);
  }

  async terminateManyRaw(positions: Position[]): Promise<TransactionResponse> {
    const { chainId } = positions[0];

    // Check that all positions are from the same chain
    const isOneOnDifferentChain = positions.some((position) => position.chainId !== chainId);
    if (isOneOnDifferentChain) {
      throw new Error('Should not call terminate many for positions on different chains');
    }

    const companionInstance = await this.contractService.getHUBCompanionInstance(LATEST_VERSION);
    const account = this.walletService.getAccount();
    const terminatesData: string[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const hubAddress = await this.contractService.getHUBAddress(position.version);

      const terminateData = companionInstance.interface.encodeFunctionData('terminate', [
        hubAddress,
        position.positionId,
        account,
        account,
      ]);
      terminatesData.push(terminateData);
    }

    return companionInstance.multicall(terminatesData);
  }

  async givePermissionToMultiplePositions(
    positions: Position[],
    permissions: DCAPermission[],
    permittedAddress: string
  ): Promise<TransactionResponse> {
    const { chainId, version } = positions[0];

    // Check that all positions are from the same chain and same version
    const isOneOnDifferentChainOrVersion = positions.some(
      (position) => position.chainId !== chainId || position.version !== version
    );
    if (isOneOnDifferentChainOrVersion) {
      throw new Error('Should not call give permission many for positions on different chains or versions');
    }

    const permissionManagerInstance = await this.contractService.getPermissionManagerInstance(version);

    const positionsDataPromises = positions.map(async ({ positionId }) => {
      const [hasIncrease, hasReduce, hasWithdraw, hasTerminate] = await permissionManagerInstance.hasPermissions(
        positionId,
        permittedAddress,
        [DCAPermission.INCREASE, DCAPermission.REDUCE, DCAPermission.WITHDRAW, DCAPermission.TERMINATE]
      );

      const defaultPermissions = [
        ...(hasIncrease || permissions.includes(DCAPermission.INCREASE) ? [DCAPermission.INCREASE] : []),
        ...(hasReduce || permissions.includes(DCAPermission.REDUCE) ? [DCAPermission.REDUCE] : []),
        ...(hasWithdraw || permissions.includes(DCAPermission.WITHDRAW) ? [DCAPermission.WITHDRAW] : []),
        ...(hasTerminate || permissions.includes(DCAPermission.TERMINATE) ? [DCAPermission.TERMINATE] : []),
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

  async buildModifyRateAndSwapsParams(
    position: Position,
    newRateUnderlying: string,
    newSwaps: string,
    useWrappedProtocolToken: boolean
  ) {
    const currentNetwork = await this.providerService.getNetwork();
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    const companionAddress = await this.contractService.getHUBCompanionAddress(LATEST_VERSION);

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

    const isIncrease = newAmount.gte(remainingLiquidity);

    return {
      id: position.positionId,
      amount: isIncrease ? newAmount.sub(remainingLiquidity) : remainingLiquidity.sub(newAmount),
      swaps: BigNumber.from(newSwaps),
      version: position.version,
      account: this.walletService.getAccount(),
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
    const { companionAddress, isIncrease } = await this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );

    const { permissions, deadline, v, r, s } = await this.getSignatureForPermission(
      position,
      companionAddress,
      isIncrease ? DCAPermission.INCREASE : DCAPermission.REDUCE
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
    const { amount, swaps, account, isIncrease, tokenFrom } = await this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );
    const hasYield = position.from.underlyingTokens.length;

    const currentNetwork = await this.providerService.getNetwork();

    const yieldFrom = hasYield && position.from.underlyingTokens[0].address;

    // if it uses signature it means it goes through permit2
    const usesCompanion = tokenFrom === PROTOCOL_TOKEN_ADDRESS || yieldFrom || signature;

    let permissionSignature;

    if (usesCompanion) {
      let companionHasPermission = true;

      if (isIncrease) {
        companionHasPermission = await this.companionHasPermission(position, DCAPermission.INCREASE);
      } else {
        companionHasPermission = await this.companionHasPermission(position, DCAPermission.REDUCE);
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

      return this.sdkService.sdk.dcaService.management.buildIncreasePositionTx({
        chainId: currentNetwork.chainId,
        positionId: position.positionId,
        amountOfSwaps: swaps.toNumber(),
        permissionPermit: permissionSignature,
        increase,
      });
    }

    const reduce: {
      amountToBuy: string;
      convertTo: string;
    } = { amountToBuy: amount.toString(), convertTo: tokenFrom };

    return this.sdkService.sdk.dcaService.management.buildReduceToBuyPositionTx({
      chainId: currentNetwork.chainId,
      positionId: position.positionId,
      amountOfSwaps: swaps.toNumber(),
      permissionPermit: permissionSignature,
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
    const { amount, tokenFrom, isIncrease } = await this.buildModifyRateAndSwapsParams(
      position,
      newRateUnderlying,
      newSwaps,
      useWrappedProtocolToken
    );
    const hasYield = position.from.underlyingTokens.length;

    const currentNetwork = await this.providerService.getNetwork();

    const allowanceTarget = this.getAllowanceTarget(
      currentNetwork.chainId,
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
    const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
    if (fromToUse.address === PROTOCOL_TOKEN_ADDRESS) {
      fromToUse = wrappedProtocolToken;
    }

    const allowance = await this.walletService.getSpecificAllowance(
      useWrappedProtocolToken ? wrappedProtocolToken : position.from,
      allowanceTarget
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
        emptyTokenWithAddress(tokenFrom),
        allowanceTarget,
        amount
      );

      txs = [approveTx, ...txs];
    }
    if (companionNeedsPermission) {
      let companionHasPermission = true;

      if (isIncrease) {
        companionHasPermission = await this.companionHasPermission(position, DCAPermission.INCREASE);
      } else {
        companionHasPermission = await this.companionHasPermission(position, DCAPermission.REDUCE);
      }

      if (!companionHasPermission) {
        const companionAddress = await this.contractService.getHUBCompanionAddress();
        const permissions = await this.fillAddressPermissions(
          position,
          companionAddress,
          isIncrease ? DCAPermission.INCREASE : DCAPermission.REDUCE
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

    return this.providerService.sendTransactionWithGasLimit(tx);
  }

  async setPendingTransaction(transaction: TransactionDetails) {
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
    const network = await this.providerService.getNetwork();
    const protocolToken = getProtocolToken(network.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(network.chainId);

    if (transaction.type === TransactionTypes.newPosition) {
      const newPositionTypeData = transaction.typeData;
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

      const [tokenA, tokenB] = sortTokens(newPositionTypeData.from, newPositionTypeData.to);
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
        pairId: `${tokenA.address}-${tokenB.address}`,
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
    } else if (id) {
      this.currentPositions[id].pendingTransaction = '';
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
      case TransactionTypes.migratePosition: {
        const migratePositionTypeData = transaction.typeData;
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
      case TransactionTypes.withdrawPosition: {
        const withdrawPositionTypeData = transaction.typeData;
        this.currentPositions[withdrawPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[withdrawPositionTypeData.id].withdrawn =
          this.currentPositions[withdrawPositionTypeData.id].swapped;
        this.currentPositions[withdrawPositionTypeData.id].toWithdraw = BigNumber.from(0);
        this.currentPositions[withdrawPositionTypeData.id].toWithdrawUnderlying = BigNumber.from(0);
        this.currentPositions[withdrawPositionTypeData.id].toWithdrawUnderlyingAccum = BigNumber.from(0);
        break;
      }
      case TransactionTypes.addFundsPosition: {
        const addFundsTypeData = transaction.typeData;
        this.currentPositions[addFundsTypeData.id].pendingTransaction = '';
        this.currentPositions[addFundsTypeData.id].remainingLiquidity = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.add(parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals));
        this.currentPositions[addFundsTypeData.id].rate = this.currentPositions[
          addFundsTypeData.id
        ].remainingLiquidity.div(this.currentPositions[addFundsTypeData.id].remainingSwaps);
        break;
      }
      case TransactionTypes.resetPosition: {
        const resetPositionTypeData = transaction.typeData;
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
      case TransactionTypes.removeFunds: {
        const removeFundsTypeData = transaction.typeData;
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
      case TransactionTypes.modifySwapsPosition: {
        const modifySwapsPositionTypeData = transaction.typeData;
        this.currentPositions[modifySwapsPositionTypeData.id].pendingTransaction = '';
        this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps = BigNumber.from(
          modifySwapsPositionTypeData.newSwaps
        );
        this.currentPositions[modifySwapsPositionTypeData.id].rate = this.currentPositions[
          modifySwapsPositionTypeData.id
        ].remainingLiquidity.div(this.currentPositions[modifySwapsPositionTypeData.id].remainingSwaps);
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
                permissions: [
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  ...positionPermissions[permissionIndex].permissions,
                  ...permissions,
                ],
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
