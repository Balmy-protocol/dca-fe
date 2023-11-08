/* eslint-disable @typescript-eslint/unbound-method */
import {
  HubContract,
  NewPositionTypeData,
  PermissionData,
  Position,
  PositionStatus,
  PositionVersions,
  Token,
  TransactionDetails,
  TransactionTypes,
  WalletStatus,
  WalletType,
} from '@types';
import { createMockInstance } from '@common/utils/tests';
import isUndefined from 'lodash/isUndefined';
import {
  HUB_ADDRESS,
  LATEST_VERSION,
  MAX_UINT_32,
  ONE_DAY,
  PERMISSIONS,
  POSITION_VERSION_4,
  SIGN_VERSION,
} from '@constants';
import { emptyTokenWithAddress, toDcaPositionToken, toToken } from '@common/utils/currency';
import { BigNumber, ethers } from 'ethers';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { parseUnits } from '@ethersproject/units';
import { DCAPermissionsManager } from '@mean-finance/dca-v2-core/dist';
import { fromRpcSig } from 'ethereumjs-util';
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager.json';
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers';
import { DCAHubCompanion } from '@mean-finance/dca-v2-periphery/dist';

import ProviderService from './providerService';
import WalletService from './walletService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import SafeService from './safeService';
import PairService from './pairService';
import PositionService from './positionService';
import Permit2Service from './permit2Service';
import SdkService from './sdkService';
import {
  DCAPermission,
  DCAPositionAction,
  DCAPositionToken,
  PlatformMessage,
  PositionId,
  PositionSummary,
} from '@mean-finance/sdk';
import AccountService from './accountService';
import { parsePermissionsForSdk } from '@common/utils/sdk';

jest.mock('./providerService');
jest.mock('./walletService');
jest.mock('./contractService');
jest.mock('./meanApiService');
jest.mock('./safeService');
jest.mock('./pairService');
jest.mock('./sdkService');
jest.mock('./accountService');
jest.mock('./permit2Service');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('ethereumjs-util', () => ({
  ...jest.requireActual('ethereumjs-util'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  fromRpcSig: jest.fn(),
}));
jest.mock('@common/utils/gqlFetchAll');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ethers: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...jest.requireActual('ethers').ethers,
    getDefaultProvider: jest.fn(),
    Contract: jest.fn(),
  },
}));

const MockedEthers = jest.mocked(ethers, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedWalletService = jest.mocked(WalletService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedSafeService = jest.mocked(SafeService, { shallow: true });
const MockedPairService = jest.mocked(PairService, { shallow: true });
const MockedPermit2Service = jest.mocked(Permit2Service, { shallow: true });
const MockedSdkService = jest.mocked(SdkService, { shallow: false });
const MockedAccountService = jest.mocked(AccountService, { shallow: false });
const MockedFromRpcSig = jest.mocked(fromRpcSig, { shallow: true });

function createPositionMock({
  from,
  to,
  user,
  swapInterval,
  swapped,
  remainingLiquidity,
  remainingSwaps,
  totalSwaps,
  rate,
  toWithdraw,
  totalExecutedSwaps,
  id,
  positionId,
  status,
  startedAt,
  pendingTransaction,
  version,
  chainId,
  permissions,
  isStale,
  toWithdrawYield,
  remainingLiquidityYield,
  swappedYield,
  nextSwapAvailableAt,
}: {
  from?: Token;
  to?: Token;
  pairId?: string;
  user?: string;
  swapInterval?: BigNumber;
  swapped?: BigNumber;
  remainingLiquidity?: BigNumber;
  remainingSwaps?: BigNumber;
  totalSwaps?: BigNumber;
  rate?: BigNumber;
  toWithdraw?: BigNumber;
  totalExecutedSwaps?: BigNumber;
  id?: string;
  positionId?: string;
  status?: PositionStatus;
  startedAt?: number;
  pendingTransaction?: string;
  version?: PositionVersions;
  chainId?: number;
  permissions?: PermissionData[];
  isStale?: boolean;
  toWithdrawYield?: BigNumber;
  remainingLiquidityYield?: BigNumber;
  swappedYield?: BigNumber;
  nextSwapAvailableAt?: number;
}): Position {
  const fromToUse = (!isUndefined(from) && from) || toToken({ address: 'from' });
  const toToUse = (!isUndefined(to) && to) || toToken({ address: 'to' });
  const underlyingFrom = fromToUse.underlyingTokens[0];
  const underlyingTo = toToUse.underlyingTokens[0];

  return {
    from: fromToUse,
    to: toToUse,
    pairId: `${(underlyingFrom || fromToUse).address}-${(underlyingTo || toToUse).address}`,
    user: (!isUndefined(user) && user) || 'my account',
    swapInterval: (!isUndefined(swapInterval) && swapInterval) || ONE_DAY,
    swapped: (!isUndefined(swapped) && swapped) || parseUnits('10', 18),
    remainingLiquidity: (!isUndefined(remainingLiquidity) && remainingLiquidity) || parseUnits('10', 18),
    remainingSwaps: (!isUndefined(remainingSwaps) && remainingSwaps) || parseUnits('5', 18),
    totalSwaps: (!isUndefined(totalSwaps) && totalSwaps) || parseUnits('10', 18),
    rate: (!isUndefined(rate) && rate) || parseUnits('2', 18),
    toWithdraw: (!isUndefined(toWithdraw) && toWithdraw) || parseUnits('5', 18),
    totalExecutedSwaps: (!isUndefined(totalExecutedSwaps) && totalExecutedSwaps) || BigNumber.from(5),
    id: (!isUndefined(id) && id) || '10-1-v4',
    positionId: (!isUndefined(positionId) && positionId) || '1',
    status: (!isUndefined(status) && status) || 'ACTIVE',
    startedAt: (!isUndefined(startedAt) && startedAt) || 1686329816,
    pendingTransaction: (!isUndefined(pendingTransaction) && pendingTransaction) || '',
    version: (!isUndefined(version) && version) || PositionVersions.POSITION_VERSION_4,
    chainId: (!isUndefined(chainId) && chainId) || 10,
    permissions: (!isUndefined(permissions) && permissions) || [],
    isStale: (!isUndefined(isStale) && isStale) || false,
    toWithdrawYield: (!isUndefined(toWithdrawYield) && toWithdrawYield) || null,
    remainingLiquidityYield: (!isUndefined(remainingLiquidityYield) && remainingLiquidityYield) || null,
    swappedYield: (!isUndefined(swappedYield) && swappedYield) || null,
    nextSwapAvailableAt: (!isUndefined(nextSwapAvailableAt) && nextSwapAvailableAt) || 10,
  };
}

function createPositionTypeDataMock({
  from,
  to,
  fromYield,
  toYield,
  fromValue,
  frequencyType,
  frequencyValue,
  id,
  startedAt,
  isCreatingPair,
  addressFor,
  version,
}: {
  from?: Token;
  to?: Token;
  fromYield?: string;
  toYield?: string;
  fromValue?: string;
  frequencyType?: string;
  frequencyValue?: string;
  id?: string;
  startedAt?: number;
  isCreatingPair?: boolean;
  addressFor?: string;
  version?: PositionVersions;
}): NewPositionTypeData['typeData'] {
  return {
    from: (!isUndefined(from) && from) || toToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toToken({ address: 'to' }),
    id: (!isUndefined(id) && id) || 'hash',
    fromYield: fromYield || (!isUndefined(fromYield) && 'fromYield') || undefined,
    toYield: toYield || (!isUndefined(toYield) && 'toYield') || undefined,
    fromValue: (!isUndefined(fromValue) && fromValue) || '20',
    frequencyType: (!isUndefined(frequencyType) && frequencyType) || ONE_DAY.toString(),
    frequencyValue: (!isUndefined(frequencyValue) && frequencyValue) || '10',
    isCreatingPair: (!isUndefined(isCreatingPair) && isCreatingPair) || false,
    addressFor: (!isUndefined(addressFor) && addressFor) || HUB_ADDRESS[LATEST_VERSION][10],
    startedAt: (!isUndefined(startedAt) && startedAt) || 1686329816,
    version: (!isUndefined(version) && version) || PositionVersions.POSITION_VERSION_4,
  };
}

const buildPairId = (from?: DCAPositionToken, to?: DCAPositionToken): `${string}-${string}` =>
  `${((!isUndefined(from) && from) || toToken({ address: 'from' })).address}-${
    ((!isUndefined(to) && to) || toToken({ address: 'to' })).address
  }`;

const buildVariantPairId = (from?: DCAPositionToken, to?: DCAPositionToken): `${string}-${string}` =>
  `${((!isUndefined(from) && toToken({ address: from.variant.id })) || toToken({ address: 'from' })).address}-${
    ((!isUndefined(to) && toToken({ address: to.variant.id })) || toToken({ address: 'to' })).address
  }`;

function createSdkPositionMock({
  id,
  from,
  to,
  owner,
  pair,
  status,
  swapInterval,
  remainingSwaps,
  swapped,
  remainingLiquidity,
  toWithdraw,
  rate,
  totalSwaps,
  createdAt,
  permissions,
  toWithdrawYield,
  remainingLiquidityYield,
  swappedYield,
  chainId,
  hub,
  tokenId,
  isStale,
  executedSwaps,
  platformMessages,
  nextSwapAvailableAt,
  history,
}: {
  id?: PositionId;
  from?: DCAPositionToken;
  to?: DCAPositionToken;
  owner?: string;
  pair?: {
    pairId: string;
    variantPairId: `${string}-${string}`;
  };
  status?: 'ongoing' | 'empty' | 'terminated' | 'finished';
  totalExecutedSwaps?: BigNumber;
  swapInterval?: number;
  remainingSwaps?: number;
  swapped?: bigint;
  remainingLiquidity?: bigint;
  toWithdraw?: bigint;
  rate?: bigint;
  totalSwaps?: number;
  createdAt?: number;
  permissions?: Record<string, DCAPermission[]>;
  toWithdrawYield?: Nullable<bigint>;
  remainingLiquidityYield?: Nullable<bigint>;
  swappedYield?: Nullable<bigint>;
  chainId?: number;
  hub?: string;
  tokenId?: bigint;
  isStale?: boolean;
  executedSwaps?: number;
  platformMessages?: PlatformMessage[];
  nextSwapAvailableAt?: number;
  history?: DCAPositionAction[];
}): PositionSummary {
  return {
    chainId: (!isUndefined(chainId) && chainId) || 10,
    hub: (!isUndefined(hub) && hub) || HUB_ADDRESS[POSITION_VERSION_4][10],
    tokenId: (!isUndefined(tokenId) && tokenId) || 10n,
    isStale: (!isUndefined(isStale) && isStale) || false,
    executedSwaps: !isUndefined(executedSwaps) ? executedSwaps : 5,
    platformMessages: (!isUndefined(platformMessages) && platformMessages) || [],
    nextSwapAvailableAt: !isUndefined(nextSwapAvailableAt) ? nextSwapAvailableAt : 10,
    history: (!isUndefined(history) && history) || [],
    from: (!isUndefined(from) && from) || toDcaPositionToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toDcaPositionToken({ address: 'to' }),
    owner: (!isUndefined(owner) && owner) || 'my account',
    swapInterval: !isUndefined(swapInterval) ? swapInterval : ONE_DAY.toNumber(),
    funds: {
      swapped: !isUndefined(swapped) ? swapped : parseUnits('10', 18).toBigInt(),
      remaining: !isUndefined(remainingLiquidity) ? remainingLiquidity : parseUnits('10', 18).toBigInt(),
      toWithdraw: !isUndefined(toWithdraw) ? toWithdraw : parseUnits('5', 18).toBigInt(),
    },
    yield:
      ((toWithdrawYield || remainingLiquidityYield || swappedYield) && {
        swapped: !isUndefined(swappedYield) && swappedYield !== null ? swappedYield : parseUnits('10', 18).toBigInt(),
        remaining:
          !isUndefined(remainingLiquidityYield) && remainingLiquidityYield !== null
            ? remainingLiquidityYield
            : parseUnits('10', 18).toBigInt(),
        toWithdraw:
          !isUndefined(toWithdrawYield) && toWithdrawYield !== null ? toWithdrawYield : parseUnits('10', 18).toBigInt(),
      }) ||
      undefined,
    remainingSwaps: !isUndefined(remainingSwaps) ? remainingSwaps : 5,
    totalSwaps: !isUndefined(totalSwaps) ? totalSwaps : 10,
    rate: !isUndefined(rate) ? rate : parseUnits('2', 18).toBigInt(),
    id: !isUndefined(id) ? id : '1-position-1',
    status: (!isUndefined(status) && status) || 'ongoing',
    createdAt: !isUndefined(createdAt) ? createdAt : 1686329816,
    permissions: (!isUndefined(permissions) && permissions) || {},
    pair: (!isUndefined(pair) && pair) || {
      pairId: buildPairId(from, to),
      variantPairId: buildVariantPairId(from, to),
    },
  };
}

describe('Position Service', () => {
  let providerService: jest.MockedObject<ProviderService>;
  let walletService: jest.MockedObject<WalletService>;
  let contractService: jest.MockedObject<ContractService>;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let safeService: jest.MockedObject<SafeService>;
  let pairService: jest.MockedObject<PairService>;
  let permit2Service: jest.MockedObject<Permit2Service>;
  let sdkService: jest.MockedObject<SdkService>;
  let accountService: jest.MockedObject<AccountService>;
  let positionService: PositionService;

  beforeEach(() => {
    providerService = createMockInstance(MockedProviderService);
    walletService = createMockInstance(MockedWalletService);
    contractService = createMockInstance(MockedContractService);
    meanApiService = createMockInstance(MockedMeanApiService);
    safeService = createMockInstance(MockedSafeService);
    pairService = createMockInstance(MockedPairService);
    permit2Service = createMockInstance(MockedPermit2Service);
    sdkService = createMockInstance(MockedSdkService);
    accountService = createMockInstance(MockedAccountService);

    providerService.getNetwork.mockResolvedValue({ chainId: 10, defaultProvider: true });
    positionService = new PositionService(
      walletService,
      pairService,
      contractService,
      meanApiService,
      safeService,
      providerService,
      permit2Service,
      sdkService,
      accountService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getCurrentPositions', () => {
    test('it should return all positions ordered by startDate', () => {
      positionService.currentPositions = {
        'position-2': createPositionMock({ startedAt: 10 }),
        'position-1': createPositionMock({ startedAt: 30 }),
        'position-3': createPositionMock({ startedAt: 20 }),
      };

      expect(positionService.getCurrentPositions()).toEqual([
        createPositionMock({ startedAt: 30 }),
        createPositionMock({ startedAt: 20 }),
        createPositionMock({ startedAt: 10 }),
      ]);
    });
  });

  describe('fetchCurrentPositions', () => {
    beforeEach(() => {
      accountService.getWallets.mockReturnValue([
        {
          address: 'wallet-1',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          getProvider: jest.fn(),
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
        },
        {
          address: 'wallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          getProvider: jest.fn(),
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
        },
      ]);
      sdkService.getUsersDcaPositions.mockResolvedValue({
        10: [
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-1`,
            status: 'ongoing',
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('from'),
              variant: {
                id: 'fromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 1n,
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('to'),
              variant: {
                id: 'toYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            chainId: 10,
            rate: 20n,
            remainingSwaps: 5,
            toWithdraw: 13n,
            toWithdrawYield: 2n,
            swappedYield: 4n,
            swapped: 15n,
            remainingLiquidity: 110n,
            remainingLiquidityYield: 10n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('from'),
              variant: {
                id: 'fromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 2n,
            status: 'ongoing',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('to'),
              variant: {
                id: 'toYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            chainId: 10,
            rate: 25n,
            remainingSwaps: 5,
            toWithdraw: 16n,
            toWithdrawYield: 1n,
            swappedYield: 4n,
            swapped: 20n,
            remainingLiquidity: 130n,
            remainingLiquidityYield: 5n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherFrom'),
              variant: {
                id: 'anotherFromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 3n,
            chainId: 10,
            status: 'ongoing',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherTo'),
              variant: {
                id: 'anotherToYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            rate: 30n,
            remainingSwaps: 5,
            toWithdraw: 21n,
            toWithdrawYield: 1n,
            swappedYield: 5n,
            swapped: 30n,
            remainingLiquidity: 160n,
            remainingLiquidityYield: 10n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherFrom'),
              variant: {
                id: 'anotherFromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 3n,
            chainId: 10,
            status: 'terminated',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherTo'),
              variant: {
                id: 'anotherToYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            rate: 30n,
            remainingSwaps: 5,
            toWithdraw: 21n,
            toWithdrawYield: 1n,
            swappedYield: 5n,
            swapped: 30n,
            remainingLiquidity: 160n,
            remainingLiquidityYield: 10n,
          }),
        ],
      });
    });
    test('it should do nothing if the account is not connected', async () => {
      accountService.getWallets.mockReturnValue([]);
      await positionService.fetchCurrentPositions();

      expect(positionService.currentPositions).toEqual({});
      expect(positionService.hasFetchedCurrentPositions).toEqual(true);
    });
    test('it should fetch positions from all chains and all versions', async () => {
      await positionService.fetchCurrentPositions();
      expect(sdkService.getUsersDcaPositions).toHaveBeenCalledWith(['wallet-1', 'wallet-2']);
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchCurrentPositions();

      expect(positionService.currentPositions).toEqual({
        [`10-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                chainId: 10,
              }),
            ],
          }),
          positionId: '1',
          id: `10-1-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(13),
          toWithdrawYield: BigNumber.from(2),
          swapped: BigNumber.from(15),
          swappedYield: BigNumber.from(4),
          remainingLiquidity: BigNumber.from(110),
          remainingLiquidityYield: BigNumber.from(10),
          rate: BigNumber.from(20),
          remainingSwaps: BigNumber.from(5),
          totalSwaps: BigNumber.from(10),
        }),
        [`10-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                chainId: 10,
              }),
            ],
          }),
          positionId: '2',
          id: `10-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(16),
          toWithdrawYield: BigNumber.from(1),
          swapped: BigNumber.from(20),
          swappedYield: BigNumber.from(4),
          remainingLiquidity: BigNumber.from(130),
          remainingLiquidityYield: BigNumber.from(5),
          rate: BigNumber.from(25),
          remainingSwaps: BigNumber.from(5),
          totalSwaps: BigNumber.from(10),
        }),
        [`10-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherFromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherToYield',
                chainId: 10,
              }),
            ],
          }),
          positionId: '3',
          id: `10-3-v${PositionVersions.POSITION_VERSION_4}`,
          // pairId: 'pair',
          toWithdraw: BigNumber.from(21),
          toWithdrawYield: BigNumber.from(1),
          swapped: BigNumber.from(30),
          swappedYield: BigNumber.from(5),
          remainingLiquidity: BigNumber.from(160),
          remainingLiquidityYield: BigNumber.from(10),
          rate: BigNumber.from(30),
          remainingSwaps: BigNumber.from(5),
          totalSwaps: BigNumber.from(10),
        }),
      });
    });
  });

  describe('fetchPastPositions', () => {
    beforeEach(() => {
      accountService.getWallets.mockReturnValue([
        {
          address: 'wallet-1',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          getProvider: jest.fn(),
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
        },
        {
          address: 'wallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          getProvider: jest.fn(),
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
        },
      ]);
      sdkService.getUsersDcaPositions.mockResolvedValue({
        10: [
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-1`,
            status: 'terminated',
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('from'),
              variant: {
                id: 'fromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 1n,
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('to'),
              variant: {
                id: 'toYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            chainId: 10,
            rate: 20n,
            remainingSwaps: 0,
            toWithdraw: 0n,
            toWithdrawYield: 0n,
            swappedYield: 4n,
            swapped: 15n,
            remainingLiquidity: 0n,
            remainingLiquidityYield: 0n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('from'),
              variant: {
                id: 'fromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 2n,
            status: 'terminated',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('to'),
              variant: {
                id: 'toYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            chainId: 10,
            rate: 25n,
            remainingSwaps: 0,
            toWithdraw: 0n,
            toWithdrawYield: 0n,
            swappedYield: 4n,
            swapped: 20n,
            remainingLiquidity: 0n,
            remainingLiquidityYield: 0n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherFrom'),
              variant: {
                id: 'anotherFromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 3n,
            chainId: 10,
            status: 'terminated',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherTo'),
              variant: {
                id: 'anotherToYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            rate: 30n,
            remainingSwaps: 0,
            toWithdraw: 0n,
            toWithdrawYield: 0n,
            swappedYield: 5n,
            swapped: 30n,
            remainingLiquidity: 0n,
            remainingLiquidityYield: 0n,
          }),
          createSdkPositionMock({
            id: `10-${HUB_ADDRESS[POSITION_VERSION_4][10]}-2`,
            from: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherFrom'),
              variant: {
                id: 'anotherFromYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            tokenId: 3n,
            chainId: 10,
            status: 'ongoing',
            to: toDcaPositionToken({
              ...emptyTokenWithAddress('anotherTo'),
              variant: {
                id: 'anotherToYield',
                type: 'yield',
                apy: 0,
                tvl: 0,
                platform: 'aave',
              },
            }),
            rate: 30n,
            remainingSwaps: 0,
            toWithdraw: 0n,
            toWithdrawYield: 0n,
            swappedYield: 5n,
            swapped: 30n,
            remainingLiquidity: 0n,
            remainingLiquidityYield: 0n,
          }),
        ],
      });
    });
    test('it should do nothing if the account is not connected', async () => {
      accountService.getWallets.mockReturnValue([]);
      await positionService.fetchPastPositions();

      expect(positionService.pastPositions).toEqual({});
      expect(positionService.hasFetchedPastPositions).toEqual(true);
    });
    test('it should fetch positions from all chains and all versions', async () => {
      await positionService.fetchPastPositions();

      expect(sdkService.getUsersDcaPositions).toHaveBeenCalledWith(['wallet-1', 'wallet-2']);
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchPastPositions();

      expect(positionService.pastPositions).toEqual({
        [`10-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                chainId: 10,
              }),
            ],
          }),
          positionId: '1',
          status: 'TERMINATED',
          toWithdraw: BigNumber.from(0),
          toWithdrawYield: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingLiquidityYield: BigNumber.from(0),
          id: `10-1-v${PositionVersions.POSITION_VERSION_4}`,
          rate: BigNumber.from(20),
          remainingSwaps: BigNumber.from(0),
          swapped: BigNumber.from(15),
          swappedYield: BigNumber.from(4),
          totalSwaps: BigNumber.from(5),
          pairId: 'pair',
        }),
        [`10-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                chainId: 10,
              }),
            ],
          }),
          positionId: '2',
          status: 'TERMINATED',
          id: `10-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(0),
          toWithdrawYield: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingLiquidityYield: BigNumber.from(0),
          rate: BigNumber.from(25),
          remainingSwaps: BigNumber.from(0),
          pairId: 'pair',
          swapped: BigNumber.from(20),
          swappedYield: BigNumber.from(4),
          totalSwaps: BigNumber.from(5),
        }),
        [`10-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherFromYield',
                chainId: 10,
              }),
            ],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherToYield',
                chainId: 10,
              }),
            ],
          }),
          pairId: 'pair',
          positionId: '3',
          status: 'TERMINATED',
          toWithdraw: BigNumber.from(0),
          toWithdrawYield: BigNumber.from(0),
          remainingLiquidity: BigNumber.from(0),
          remainingLiquidityYield: BigNumber.from(0),
          id: `10-3-v${PositionVersions.POSITION_VERSION_4}`,
          rate: BigNumber.from(30),
          remainingSwaps: BigNumber.from(0),
          swapped: BigNumber.from(30),
          swappedYield: BigNumber.from(5),
          totalSwaps: BigNumber.from(5),
        }),
      });
    });
  });

  describe('getSignatureForPermission', () => {
    let mockedPermissionManagerInstance: jest.Mocked<DCAPermissionsManager>;
    let mockedSigner: jest.Mocked<JsonRpcSigner>;
    beforeEach(() => {
      mockedPermissionManagerInstance = {
        nonces: jest.fn().mockResolvedValue(10),
        hasPermission: jest.fn().mockImplementation((positionId, contractAddress, permission) => {
          switch (permission) {
            case PERMISSIONS.INCREASE: {
              return false;
            }
            case PERMISSIONS.REDUCE: {
              return false;
            }
            case PERMISSIONS.WITHDRAW: {
              return true;
            }
            case PERMISSIONS.TERMINATE: {
              return true;
            }

            default: {
              return false;
            }
          }
        }),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      mockedSigner = {
        getAddress: jest.fn().mockResolvedValue('address'),
        _signTypedData: jest.fn().mockResolvedValue('signed data'),
      } as unknown as jest.Mocked<JsonRpcSigner>;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      MockedEthers.Contract.mockImplementation(() => mockedPermissionManagerInstance);
      providerService.getSigner.mockResolvedValue(mockedSigner);
      MockedFromRpcSig.mockReturnValue({
        v: 'v',
        r: 'r',
        s: 's',
      } as never);
      contractService.getPermissionManagerAddress.mockReturnValue('permissionManagerAddress');
    });
    describe('when an address is passed', () => {
      test('it should use the specific permission manager address for the signature', async () => {
        await positionService.getSignatureForPermission(
          createPositionMock({}),
          'contractAddress',
          PERMISSIONS.INCREASE,
          'providedPermissionManagerAddress'
        );

        expect(MockedEthers.Contract).toHaveBeenCalledTimes(2);
        expect(MockedEthers.Contract).toHaveBeenCalledWith(
          'providedPermissionManagerAddress',
          PERMISSION_MANAGER_ABI.abi,
          mockedSigner
        );
      });
    });

    describe('when the erc712 name is passed', () => {
      test('it should use the specific name address for the signature', async () => {
        await positionService.getSignatureForPermission(
          createPositionMock({}),
          'contractAddress',
          PERMISSIONS.INCREASE,
          undefined,
          'erc712Name'
        );

        // eslint-disable-next-line no-underscore-dangle
        expect(mockedSigner._signTypedData).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line no-underscore-dangle
        expect(mockedSigner._signTypedData).toHaveBeenCalledWith(
          {
            name: 'erc712Name',
            version: SIGN_VERSION[PositionVersions.POSITION_VERSION_4],
            chainId: 10,
            verifyingContract: 'permissionManagerAddress',
          },
          {
            PermissionSet: [
              { name: 'operator', type: 'address' },
              { name: 'permissions', type: 'uint8[]' },
            ],
            PermissionPermit: [
              { name: 'permissions', type: 'PermissionSet[]' },
              { name: 'tokenId', type: 'uint256' },
              { name: 'nonce', type: 'uint256' },
              { name: 'deadline', type: 'uint256' },
            ],
          },
          {
            tokenId: '1',
            permissions: [
              {
                operator: 'contractAddress',
                permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
              },
            ],
            nonce: 10,
            deadline: BigNumber.from('2').pow('256').sub(1),
          }
        );
      });
    });

    test('it should build a signature by extending the position permissions', async () => {
      const result = await positionService.getSignatureForPermission(
        createPositionMock({}),
        'contractAddress',
        PERMISSIONS.INCREASE
      );

      // eslint-disable-next-line no-underscore-dangle
      expect(mockedSigner._signTypedData).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(mockedSigner._signTypedData).toHaveBeenCalledWith(
        {
          name: 'Mean Finance - DCA Position',
          version: SIGN_VERSION[PositionVersions.POSITION_VERSION_4],
          chainId: 10,
          verifyingContract: 'permissionManagerAddress',
        },
        {
          PermissionSet: [
            { name: 'operator', type: 'address' },
            { name: 'permissions', type: 'uint8[]' },
          ],
          PermissionPermit: [
            { name: 'permissions', type: 'PermissionSet[]' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        {
          tokenId: '1',
          permissions: [
            {
              operator: 'contractAddress',
              permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
            },
          ],
          nonce: 10,
          deadline: BigNumber.from('2').pow('256').sub(1),
        }
      );

      expect(MockedFromRpcSig).toHaveBeenCalledTimes(1);
      expect(MockedFromRpcSig).toHaveBeenCalledWith('signed data');

      expect(result).toEqual({
        permissions: [
          {
            operator: 'contractAddress',
            permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
          },
        ],
        deadline: BigNumber.from('2').pow('256').sub(1),
        v: 'v',
        r: 'r',
        s: 's',
      });
    });
  });

  describe('companionHasPermission', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        hasPermission: jest.fn().mockResolvedValue(false),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
    });
    test('it should use the latest companion to call the permission manager to get the permission', async () => {
      const result = await positionService.companionHasPermission(
        createPositionMock({ version: PositionVersions.POSITION_VERSION_3 }),
        PERMISSIONS.INCREASE
      );

      expect(contractService.getPermissionManagerInstance).toHaveBeenCalledWith(
        10,
        'my account',
        PositionVersions.POSITION_VERSION_3
      );
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, LATEST_VERSION);

      expect(result).toEqual(false);
    });
  });

  describe('modifyPermissions', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        modify: jest.fn().mockResolvedValue('modify'),
        populateTransaction: {
          modify: jest.fn().mockResolvedValue({
            from: 'account',
            to: 'permissionManager',
            data: 'modify',
          }),
        },
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: 'modify-hash',
      } as TransactionResponse);

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });
    test('it should call the modify of the permissionManager with the new permissions', async () => {
      const result = await positionService.modifyPermissions(createPositionMock({ positionId: 'position-1' }), [
        {
          id: 'permission',
          operator: 'operator',
          permissions: [DCAPermission.INCREASE, DCAPermission.REDUCE, DCAPermission.WITHDRAW],
        },
      ]);

      expect(permissionManagerInstanceMock.populateTransaction.modify).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.populateTransaction.modify).toHaveBeenCalledWith('position-1', [
        {
          operator: 'operator',
          permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW],
        },
      ]);

      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
        from: 'my account',
        to: 'permissionManager',
        data: 'modify',
      });
      expect(result).toEqual({
        hash: 'modify-hash',
      });
    });
  });

  describe('transfer', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        transferFrom: jest.fn().mockResolvedValue('transferFrom'),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });
    test('it should call the transferFrom of the permissionManager for the new user', async () => {
      const result = await positionService.transfer(
        createPositionMock({
          positionId: 'position-1',
        }),
        'toAddress'
      );

      expect(permissionManagerInstanceMock.transferFrom).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.transferFrom).toHaveBeenCalledWith('my account', 'toAddress', 'position-1');
      expect(result).toEqual('transferFrom');
    });
  });

  describe('getTokenNFT', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        tokenURI: jest.fn().mockResolvedValue(`data:application/json;base64,${btoa('{ "name": "tokenUri" }')}`),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });
    test('it should call the tokenUri of the permissionManager and parse the json result', async () => {
      const result = await positionService.getTokenNFT(
        createPositionMock({
          positionId: 'position-1',
        })
      );

      expect(permissionManagerInstanceMock.tokenURI).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.tokenURI).toHaveBeenCalledWith('position-1');
      expect(result).toEqual({ name: 'tokenUri' });
    });
  });

  describe('buildDepositParams', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
    });
    describe('when the amount of swaps is higher than the max', () => {
      test('it should throw an error', () => {
        try {
          positionService.buildDepositParams(
            'account',
            toToken({ address: 'from' }),
            toToken({ address: 'to' }),
            '10',
            ONE_DAY,
            '4294967296',
            10,
            'yieldFrom',
            'yieldTo'
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`));
        }
      });
    });

    describe('when the from has yield', () => {
      test('it should add the increase, reduce and terminate permissions', () => {
        const result = positionService.buildDepositParams(
          'account',
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          10,
          'yieldFrom'
        );

        expect(result).toEqual({
          takeFrom: 'from',
          from: 'from',
          to: 'to',
          totalAmmount: parseUnits('10', 18),
          swaps: BigNumber.from(5),
          interval: ONE_DAY,
          account: 'account',
          permissions: [
            {
              operator: 'companionAddress',
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.TERMINATE],
            },
          ],
          yieldFrom: 'yieldFrom',
          yieldTo: undefined,
        });
      });
    });

    describe('when the to has yield', () => {
      test('it should add the withdraw and terminate permissions', () => {
        const result = positionService.buildDepositParams(
          'account',
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          10,
          undefined,
          'yieldTo'
        );

        expect(result).toEqual({
          takeFrom: 'from',
          from: 'from',
          to: 'to',
          totalAmmount: parseUnits('10', 18),
          swaps: BigNumber.from(5),
          interval: ONE_DAY,
          account: 'account',
          permissions: [{ operator: 'companionAddress', permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE] }],
          yieldFrom: undefined,
          yieldTo: 'yieldTo',
        });
      });
    });

    describe('when no token has yield', () => {
      test('it should not add any permission to the position', () => {
        const result = positionService.buildDepositParams(
          'account',
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          10
        );

        expect(result).toEqual({
          takeFrom: 'from',
          from: 'from',
          to: 'to',
          totalAmmount: parseUnits('10', 18),
          swaps: BigNumber.from(5),
          interval: ONE_DAY,
          account: 'account',
          permissions: [{ operator: 'companionAddress', permissions: [] }],
          yieldFrom: undefined,
          yieldTo: undefined,
        });
      });
    });
  });

  describe('buildDepositTx', () => {
    let hubInstanceMock: jest.Mocked<HubContract>;
    beforeEach(() => {
      hubInstanceMock = {
        populateTransaction: {
          deposit: jest.fn().mockResolvedValue({
            to: 'hub',
            from: 'account',
          }),
        },
      } as unknown as jest.Mocked<HubContract>;

      sdkService.buildCreatePositionTx.mockResolvedValue({
        to: 'companion',
        data: 'data',
      });

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
    });

    describe('when the from is not the protocol token', () => {
      test('it should get the transaction from the sdk', async () => {
        const params = positionService.buildDepositParams(
          'account',
          toToken({ address: 'from', chainId: 10 }),
          toToken({ address: 'to', chainId: 10 }),
          '10',
          ONE_DAY,
          '5',
          10,
          'fromYield',
          'toYield'
        );

        const result = await positionService.buildDepositTx(
          'account',
          toToken({ address: 'from', chainId: 10 }),
          toToken({ address: 'to', chainId: 10 }),
          '10',
          ONE_DAY,
          '5',
          10,
          'fromYield',
          'toYield',
          {
            deadline: 10,
            nonce: BigNumber.from(0),
            rawSignature: 'signature',
          }
        );

        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          from: { address: params.from, variantId: params.yieldFrom },
          to: { address: params.to, variantId: params.yieldTo },
          swapInterval: params.interval.toNumber(),
          amountOfSwaps: params.swaps.toNumber(),
          owner: params.account,
          permissions: parsePermissionsForSdk(params.permissions),
          deposit: {
            permitData: {
              amount: params.totalAmmount.toString(),
              token: params.takeFrom,
              nonce: '0',
              deadline: '10',
            },
            signature: 'signature',
          },
        });
        expect(result).toEqual({
          to: 'companion',
          data: 'data',
        });
      });
    });

    describe('when the from is the protocol token', () => {
      test('it should get the transaction from the sdk', async () => {
        const params = positionService.buildDepositParams(
          'account',
          getProtocolToken(10),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          10
        );

        const result = await positionService.buildDepositTx(
          'account',
          getProtocolToken(10),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          10
        );

        const wrappedProtocolToken = getWrappedProtocolToken(10);
        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          from: { address: params.from, variantId: wrappedProtocolToken.address },
          to: { address: params.to, variantId: params.to },
          swapInterval: params.interval.toNumber(),
          amountOfSwaps: params.swaps.toNumber(),
          owner: params.account,
          permissions: params.permissions,
          deposit: { token: params.takeFrom, amount: params.totalAmmount.toString() },
        });
        expect(result).toEqual({
          to: 'companion',
          data: 'data',
        });
      });
    });
  });

  describe('approveAndDepositSafe', () => {
    beforeEach(() => {
      walletService.buildApproveSpecificTokenTx.mockResolvedValue({
        to: 'companion',
        from: 'safe',
        data: 'approve',
      });
      positionService.buildDepositTx = jest.fn().mockResolvedValue({
        to: 'companion',
        from: 'safe',
        data: 'deposit',
      });

      safeService.submitMultipleTxs.mockResolvedValue({
        safeTxHash: 'safeTxHash',
      });
      positionService.getAllowanceTarget = jest.fn().mockReturnValue('resolved-allowance-target');
    });

    test('it should call the safeService with the bundled approve and deposit transactions', async () => {
      const params = positionService.buildDepositParams(
        'account',
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        10,
        'yieldFrom',
        'yieldTo'
      );

      const result = await positionService.approveAndDepositSafe(
        'account',
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        10,
        'yieldFrom',
        'yieldTo'
      );

      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledTimes(1);
      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledWith(
        'account',
        toToken({ address: 'from' }),
        'resolved-allowance-target',
        params.totalAmmount
      );
      expect(positionService.buildDepositTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildDepositTx).toHaveBeenCalledWith(
        'account',
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        10,
        'yieldFrom',
        'yieldTo'
      );
      expect(safeService.submitMultipleTxs).toHaveBeenCalledTimes(1);
      expect(safeService.submitMultipleTxs).toHaveBeenCalledWith([
        {
          to: 'companion',
          from: 'safe',
          data: 'approve',
        },
        {
          to: 'companion',
          from: 'safe',
          data: 'deposit',
        },
      ]);
      expect(result).toEqual({
        safeTxHash: 'safeTxHash',
      });
    });
  });

  describe('deposit', () => {
    beforeEach(() => {
      positionService.buildDepositTx = jest.fn().mockResolvedValue({
        from: 'user',
        to: 'companion',
      });
      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: 'hash',
      } as TransactionResponse);
    });
    test('it should get the tx from buildDepositTx and submit it', async () => {
      const result = await positionService.deposit(
        'user',
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        10,
        'yieldFrom',
        'yieldTo'
      );

      expect(positionService.buildDepositTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildDepositTx).toHaveBeenCalledWith(
        'user',
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        10,
        'yieldFrom',
        'yieldTo',
        undefined
      );
      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
        from: 'user',
        to: 'companion',
      });
      expect(result).toEqual({
        hash: 'hash',
      });
    });
  });

  describe('withdraw', () => {
    let hubInstanceMock: jest.Mocked<HubContract>;
    beforeEach(() => {
      hubInstanceMock = {
        withdrawSwapped: jest.fn().mockResolvedValue({
          hash: 'hash',
        }),
      } as unknown as jest.Mocked<HubContract>;

      sdkService.buildWithdrawPositionTx.mockResolvedValue({
        to: 'companion',
        data: 'withdrawSwapped',
      });

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: 'hash',
      } as unknown as TransactionResponse);

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: [
          {
            operator: 'companion',
            permissions: [PERMISSIONS.WITHDRAW],
          },
        ],
        deadline: 'deadline',
        v: 'v',
        r: [1],
        s: [1],
      });
    });

    describe('when the to is not the protocol token, nor the wrapped token and useProtocolToken is sent', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.withdraw(
            createPositionMock({
              to: toToken({ address: 'to' }),
            }),
            true
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Should not call withdraw without it being protocol token'));
        }
      });
    });

    describe('when the TO doesnt have yield and is not protocol token', () => {
      test('it should call the hub instance directly', async () => {
        const result = await positionService.withdraw(
          createPositionMock({
            to: toToken({ address: 'to' }),
            positionId: 'position-1',
          }),
          false
        );

        expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 'position-1',
          withdraw: {
            convertTo: 'to',
          },
          dcaHub: 'hubAddress',
          recipient: 'my account',
          permissionPermit: undefined,
        });
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
          from: 'my account',
          to: 'companion',
          data: 'withdrawSwapped',
        });
        expect(result).toEqual({
          hash: 'hash',
        });
      });
    });

    describe('when the TO has yield', () => {
      describe('when the companion doesnt have permissions', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);
        });

        test('it should ask for a permission signature', async () => {
          const result = await positionService.withdraw(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              positionId: 'position-1',
            }),
            false
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              positionId: 'position-1',
            }),
            'companionAddress',
            PERMISSIONS.WITHDRAW
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              convertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'withdrawSwapped',
          });
          expect(result).toEqual({
            hash: 'hash',
          });
        });
      });

      describe('when the companion has withdraw permission', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
        });

        test('it should not ask for a signature', async () => {
          const result = await positionService.withdraw(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              positionId: 'position-1',
            }),
            false
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              convertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            from: 'my account',
            to: 'companion',
            data: 'withdrawSwapped',
          });

          expect(result).toEqual({
            hash: 'hash',
          });
        });
      });
    });

    describe('when the TO is the protocol token', () => {
      describe('when useProtocol token is false', () => {
        it('should call the hub instance directly', async () => {
          const result = await positionService.withdraw(
            createPositionMock({
              to: getProtocolToken(10),
              positionId: 'position-1',
            }),
            false
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              convertTo: getWrappedProtocolToken(10).address,
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'withdrawSwapped',
          });
          expect(result).toEqual({
            hash: 'hash',
          });
        });
      });

      describe('when the companion doesnt have permissions', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);
        });

        test('it should ask for a permission signature', async () => {
          const result = await positionService.withdraw(
            createPositionMock({
              to: getProtocolToken(10),
              positionId: 'position-1',
            }),
            true
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: getProtocolToken(10),
              positionId: 'position-1',
            }),
            'companionAddress',
            PERMISSIONS.WITHDRAW
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              convertTo: getProtocolToken(10).address,
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'withdrawSwapped',
          });
          expect(result).toEqual({
            hash: 'hash',
          });
        });
      });

      describe('when the companion has withdraw permission', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
        });

        test('it should not ask for a signature', async () => {
          const result = await positionService.withdraw(
            createPositionMock({
              to: getProtocolToken(10),
              positionId: 'position-1',
            }),
            true
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              convertTo: getProtocolToken(10).address,
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'withdrawSwapped',
          });
          expect(result).toEqual({
            hash: 'hash',
          });
        });
      });
    });
  });

  describe('terminate', () => {
    let hubInstanceMock: jest.Mocked<HubContract>;
    beforeEach(() => {
      hubInstanceMock = {
        terminate: jest.fn().mockResolvedValue({
          hash: 'hash',
        }),
      } as unknown as jest.Mocked<HubContract>;

      sdkService.buildTerminatePositionTx.mockResolvedValue({
        to: 'companion',
        data: 'terminate',
      });

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
      contractService.getHUBAddress.mockReturnValue('hubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: 'terminate-hash',
      } as unknown as TransactionResponse);

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: [
          {
            operator: 'companion',
            permissions: [PERMISSIONS.WITHDRAW],
          },
        ],
        deadline: 'deadline',
        v: 'v',
        r: [1],
        s: [1],
      });
    });

    describe('when the TO or FROM are not the protocol token, nor the wrapped token and useProtocolToken is sent', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: toToken({ address: 'from' }),
            }),
            true
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Should not call terminate without it being protocol token'));
        }
      });
    });

    describe('when the TO and FROM dont have yield and is not protocol token', () => {
      test('it should call the hub instance directly', async () => {
        const result = await positionService.terminate(
          createPositionMock({
            to: toToken({ address: 'to' }),
            from: toToken({ address: 'from' }),
            positionId: 'position-1',
          }),
          false
        );

        expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 'position-1',
          withdraw: {
            unswappedConvertTo: 'from',
            swappedConvertTo: 'to',
          },
          dcaHub: 'hubAddress',
          recipient: 'my account',
          permissionPermit: undefined,
        });

        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
          to: 'companion',
          from: 'my account',
          data: 'terminate',
        });
        expect(result).toEqual({
          hash: 'terminate-hash',
        });
      });
    });

    describe('when the TO or FROM has yield', () => {
      describe('when the companion doesnt have permissions', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);
        });
        test('it should ask for a permission signature', async () => {
          const result = await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
              positionId: 'position-1',
            }),
            false
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
              positionId: 'position-1',
            }),
            'companionAddress',
            PERMISSIONS.TERMINATE,
            undefined,
            undefined
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              unswappedConvertTo: 'from',
              swappedConvertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'terminate',
          });
          expect(result).toEqual({
            hash: 'terminate-hash',
          });
        });
      });

      describe('when the companion has terminate permission', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
        });
        test('it should not ask for a signature', async () => {
          const result = await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
              positionId: 'position-1',
            }),
            false
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              unswappedConvertTo: 'from',
              swappedConvertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            from: 'my account',
            data: 'terminate',
          });
          expect(result).toEqual({
            hash: 'terminate-hash',
          });
        });
      });
    });

    describe('when the TO or FROM are the protocol token', () => {
      describe('when useProtocol token is false', () => {
        it('should call the hub instance directly', async () => {
          const result = await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: getProtocolToken(10),
              positionId: 'position-1',
            }),
            false
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              unswappedConvertTo: getWrappedProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            data: 'terminate',
            from: 'my account',
          });
          expect(result).toEqual({
            hash: 'terminate-hash',
          });
        });
      });

      describe('when the companion doesnt have permissions', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);
        });
        test('it should ask for a permission signature', async () => {
          const result = await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: getProtocolToken(10),
              positionId: 'position-1',
            }),
            true
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: getProtocolToken(10),
              positionId: 'position-1',
            }),
            'companionAddress',
            PERMISSIONS.TERMINATE,
            undefined,
            undefined
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              unswappedConvertTo: getProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            data: 'terminate',
            from: 'my account',
          });
          expect(result).toEqual({
            hash: 'terminate-hash',
          });
        });
      });

      describe('when the companion has terminate permission', () => {
        beforeEach(() => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
        });
        test('it should not ask for a signature', async () => {
          const result = await positionService.terminate(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: getProtocolToken(10),
              positionId: 'position-1',
            }),
            true
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            withdraw: {
              unswappedConvertTo: getProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: 'hubAddress',
            recipient: 'my account',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: 'companion',
            data: 'terminate',
            from: 'my account',
          });
          expect(result).toEqual({
            hash: 'terminate-hash',
          });
        });
      });
    });
  });

  describe('terminateManyRaw', () => {
    let hubCompanionInstanceMock: jest.Mocked<DCAHubCompanion>;
    beforeEach(() => {
      hubCompanionInstanceMock = {
        multicall: jest.fn().mockResolvedValue({
          hash: 'hash',
        }),
        interface: {
          encodeFunctionData: jest.fn().mockReturnValue('terminateData'),
        },
      } as unknown as jest.Mocked<DCAHubCompanion>;

      contractService.getHUBCompanionInstance.mockResolvedValue(hubCompanionInstanceMock);
      contractService.getHUBAddress.mockReturnValue('hubAddress');
    });

    describe('when there are positions on different chains', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.terminateManyRaw([
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: toToken({ address: 'from' }),
              chainId: 10,
            }),
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: toToken({ address: 'from' }),
              chainId: 1,
            }),
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: toToken({ address: 'from' }),
              chainId: 137,
            }),
          ]);
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Should not call terminate many for positions on different chains'));
        }
      });
    });

    test('it should call the companion multicall with all the terminate transactions', async () => {
      const result = await positionService.terminateManyRaw([
        createPositionMock({
          positionId: 'position-1',
        }),
        createPositionMock({
          positionId: 'position-2',
        }),
        createPositionMock({
          positionId: 'position-3',
        }),
      ]);

      expect(hubCompanionInstanceMock.interface.encodeFunctionData).toHaveBeenCalledTimes(3);
      expect(hubCompanionInstanceMock.interface.encodeFunctionData).toHaveBeenCalledWith('terminate', [
        'hubAddress',
        'position-1',
        'my account',
        'my account',
      ]);
      expect(hubCompanionInstanceMock.interface.encodeFunctionData).toHaveBeenCalledWith('terminate', [
        'hubAddress',
        'position-2',
        'my account',
        'my account',
      ]);
      expect(hubCompanionInstanceMock.interface.encodeFunctionData).toHaveBeenCalledWith('terminate', [
        'hubAddress',
        'position-3',
        'my account',
        'my account',
      ]);

      expect(hubCompanionInstanceMock.multicall).toHaveBeenCalledTimes(1);
      expect(hubCompanionInstanceMock.multicall).toHaveBeenCalledWith([
        'terminateData',
        'terminateData',
        'terminateData',
      ]);
      expect(result).toEqual({
        hash: 'hash',
      });
    });
  });

  describe('givePermissionToMultiplePositions', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        hasPermissions: jest.fn().mockResolvedValue([false, false, true, true]),
        modifyMany: jest.fn().mockResolvedValue({
          hash: 'hash',
        }),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });

    describe('when there are positions on different chains', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.givePermissionToMultiplePositions(
            [
              createPositionMock({
                to: toToken({ address: 'to' }),
                from: toToken({ address: 'from' }),
                chainId: 10,
              }),
              createPositionMock({
                to: toToken({ address: 'to' }),
                from: toToken({ address: 'from' }),
                chainId: 1,
              }),
              createPositionMock({
                to: toToken({ address: 'to' }),
                from: toToken({ address: 'from' }),
                chainId: 137,
              }),
            ],
            [PERMISSIONS.INCREASE],
            'permittedAddress'
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(
            Error('Should not call give permission many for positions on different chains or versions')
          );
        }
      });
    });

    test('it should call the permission manager with the modify many transactions', async () => {
      const result = await positionService.givePermissionToMultiplePositions(
        [
          createPositionMock({
            positionId: 'position-1',
          }),
          createPositionMock({
            positionId: 'position-2',
          }),
          createPositionMock({
            positionId: 'position-3',
          }),
        ],
        [PERMISSIONS.INCREASE],
        'permittedAddress'
      );

      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledTimes(3);
      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledWith('position-1', 'permittedAddress', [
        DCAPermission.INCREASE,
        DCAPermission.REDUCE,
        DCAPermission.WITHDRAW,
        DCAPermission.TERMINATE,
      ]);
      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledWith('position-1', 'permittedAddress', [
        DCAPermission.INCREASE,
        DCAPermission.REDUCE,
        DCAPermission.WITHDRAW,
        DCAPermission.TERMINATE,
      ]);
      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledWith('position-1', 'permittedAddress', [
        DCAPermission.INCREASE,
        DCAPermission.REDUCE,
        DCAPermission.WITHDRAW,
        DCAPermission.TERMINATE,
      ]);

      expect(permissionManagerInstanceMock.modifyMany).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.modifyMany).toHaveBeenCalledWith([
        {
          tokenId: 'position-1',
          permissionSets: [
            {
              operator: 'permittedAddress',
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
            },
          ],
        },
        {
          tokenId: 'position-2',
          permissionSets: [
            {
              operator: 'permittedAddress',
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
            },
          ],
        },
        {
          tokenId: 'position-3',
          permissionSets: [
            {
              operator: 'permittedAddress',
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
            },
          ],
        },
      ]);
      expect(result).toEqual({
        hash: 'hash',
      });
    });
  });

  describe('buildModifyRateAndSwapsParams', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
    });

    describe('when the from isnt protocol or wrapped token and useWrappedProtocolToken was passed', () => {
      test('it should throw an error', () => {
        try {
          positionService.buildModifyRateAndSwapsParams(
            createPositionMock({
              positionId: 'position-1',
              from: toToken({ address: 'from' }),
            }),
            '20',
            '15',
            true
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error('Should not call modify rate and swaps without it being protocol token'));
        }
      });
    });

    describe('when the amount of swaps is higher than the max', () => {
      test('it should throw an error', () => {
        try {
          positionService.buildModifyRateAndSwapsParams(
            createPositionMock({
              positionId: 'position-1',
              from: toToken({ address: 'from' }),
            }),
            '20',
            '4294967296',
            false
          );
          expect(1).toEqual(2);
        } catch (e) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(e).toEqual(Error(`Amount of swaps cannot be higher than ${MAX_UINT_32}`));
        }
      });
    });

    describe('when its increase', () => {
      test('it should build the parameters for the modify', () => {
        const result = positionService.buildModifyRateAndSwapsParams(
          createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from' }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          }),
          '20',
          '10',
          false
        );

        expect(result).toEqual({
          id: 'position-1',
          amount: parseUnits('150', 18),
          swaps: BigNumber.from(10),
          version: PositionVersions.POSITION_VERSION_4,
          account: 'my account',
          isIncrease: true,
          companionAddress: 'companionAddress',
          tokenFrom: 'from',
        });
      });
    });
    describe('when its decrease', () => {
      test('it should build the parameters for the modify', () => {
        const result = positionService.buildModifyRateAndSwapsParams(
          createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from' }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          }),
          '5',
          '3',
          false
        );

        expect(result).toEqual({
          id: 'position-1',
          amount: parseUnits('35', 18),
          swaps: BigNumber.from(3),
          version: PositionVersions.POSITION_VERSION_4,
          account: 'my account',
          isIncrease: false,
          companionAddress: 'companionAddress',
          tokenFrom: 'from',
        });
      });
    });
  });

  describe('getModifyRateAndSwapsSignature', () => {
    beforeEach(() => {
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: [
          {
            operator: 'companion',
            permissions: [PERMISSIONS.WITHDRAW],
          },
        ],
        deadline: 'deadline',
        v: 'v',
        r: [1],
        s: [1],
      });
    });

    test('it should build the signature to add the permissions for increaase', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockReturnValue({
        companionAddress: 'companionAddress',
        isIncrease: true,
      });

      const result = await positionService.getModifyRateAndSwapsSignature(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        '20',
        '10',
        false
      );

      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        '20',
        '10',
        false
      );
      expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
      expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        'companionAddress',
        PERMISSIONS.INCREASE
      );
      expect(result).toEqual({
        permissions: [{ operator: 'companion', permissions: [PERMISSIONS.WITHDRAW] }],
        deadline: 'deadline',
        v: 'v',
        r: '0x01',
        s: '0x01',
        tokenId: 'position-1',
      });
    });

    test('it should build the signature to add the permissions for reduce', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockReturnValue({
        companionAddress: 'companionAddress',
        isIncrease: false,
      });

      const result = await positionService.getModifyRateAndSwapsSignature(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        '5',
        '3',
        false
      );

      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        '5',
        '3',
        false
      );
      expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
      expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        }),
        'companionAddress',
        PERMISSIONS.REDUCE
      );
      expect(result).toEqual({
        permissions: [{ operator: 'companion', permissions: [PERMISSIONS.WITHDRAW] }],
        deadline: 'deadline',
        v: 'v',
        r: '0x01',
        s: '0x01',
        tokenId: 'position-1',
      });
    });
  });

  describe('buildModifyRateAndSwapsTx', () => {
    let hubInstanceMock: jest.Mocked<HubContract>;
    let position: Position;

    let newRateUnderlying: string;
    let newSwaps: string;

    beforeEach(() => {
      hubInstanceMock = {
        populateTransaction: {
          increasePosition: jest.fn().mockResolvedValue({
            hash: 'increase-hash',
          }),
          reducePosition: jest.fn().mockResolvedValue({
            hash: 'reduce-hash',
          }),
        },
      } as unknown as jest.Mocked<HubContract>;

      sdkService.buildIncreasePositionTx.mockResolvedValue({
        to: 'companion',
        data: 'data',
      });

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);

      contractService.getHUBAddress.mockReturnValue('hubAddress');
    });

    describe('when its increasing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '20';
        newSwaps = '10';

        contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
        sdkService.buildIncreasePositionTx.mockResolvedValue({
          to: 'companion',
          data: 'meanapi-increase-data',
        });

        positionService.getModifyRateAndSwapsSignature = jest.fn().mockResolvedValue({
          permissions: [{ operator: 'companionAddress', permissions: [PERMISSIONS.INCREASE] }],
          deadline: 'deadline',
          v: 'v',
          r: '0x01',
          s: '0x01',
          tokenId: 'position-1',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: undefined,
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-increase-data',
          });
        });

        test('it should get the signature if the companion does not has permissions', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledTimes(1);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledWith(
            position,
            newRateUnderlying,
            newSwaps,
            false
          );
          expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: {
              permissions: [{ operator: 'companionAddress', permissions: [DCAPermission.INCREASE] }],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-increase-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 'position-1',
            from: getProtocolToken(10),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: undefined,
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-increase-data',
          });
        });

        test('it should get the signature if the companion does not has permissions', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledTimes(1);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledWith(
            position,
            newRateUnderlying,
            newSwaps,
            false
          );
          expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: {
              permissions: [{ operator: 'companionAddress', permissions: [DCAPermission.INCREASE] }],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-increase-data',
          });
        });
      });

      test('it should populate the transaction from the hub', async () => {
        position = createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        });

        params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();

        expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 'position-1',
          dcaHub: 'hubAddress',
          amountOfSwaps: params.swaps.toNumber(),
          permissionPermit: undefined,
          increase: { token: params.tokenFrom, amount: params.amount.toString() },
        });
        expect(result).toEqual({
          data: 'meanapi-increase-data',
          to: 'companion',
        });
      });
    });

    describe('when its reducing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '5';
        newSwaps = '3';

        contractService.getHUBCompanionAddress.mockReturnValue('companionAddress');
        sdkService.buildReduceToBuyPositionTx.mockResolvedValue({
          to: 'companion',
          data: 'meanapi-reduce-data',
        });
        positionService.getModifyRateAndSwapsSignature = jest.fn().mockResolvedValue({
          permissions: [{ operator: 'companionAddress', permissions: [PERMISSIONS.REDUCE] }],
          deadline: 'deadline',
          v: 'v',
          r: '0x01',
          s: '0x01',
          tokenId: 'position-1',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: undefined,
            recipient: 'my account',
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-reduce-data',
          });
        });

        test('it should get the signature if the companion does not has permissions', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledTimes(1);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledWith(
            position,
            newRateUnderlying,
            newSwaps,
            false
          );
          expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            recipient: 'my account',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: {
              permissions: [{ operator: 'companionAddress', permissions: [DCAPermission.REDUCE] }],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-reduce-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 'position-1',
            from: getProtocolToken(10),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            recipient: 'my account',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: undefined,
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-reduce-data',
          });
        });

        test('it should get the signature if the companion does not has permissions', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(false);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledTimes(1);
          expect(positionService.getModifyRateAndSwapsSignature).toHaveBeenCalledWith(
            position,
            newRateUnderlying,
            newSwaps,
            false
          );
          expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 'position-1',
            dcaHub: 'hubAddress',
            recipient: 'my account',
            amountOfSwaps: params.swaps.toNumber(),
            permissionPermit: {
              permissions: [{ operator: 'companionAddress', permissions: [DCAPermission.REDUCE] }],
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            },
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: 'companion',
            data: 'meanapi-reduce-data',
          });
        });
      });

      test('it should populate the transaction from the hub', async () => {
        position = createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from' }),
          rate: parseUnits('10', 18),
          remainingSwaps: BigNumber.from(5),
        });

        params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();

        expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 'position-1',
          dcaHub: 'hubAddress',
          recipient: 'my account',
          amountOfSwaps: params.swaps.toNumber(),
          permissionPermit: undefined,
          reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
        });

        expect(result).toEqual({
          data: 'meanapi-reduce-data',
          to: 'companion',
        });
      });
    });
  });

  describe('approveAndModifyRateAndSwapsSafe', () => {
    beforeEach(() => {
      positionService.buildModifyRateAndSwapsParams = jest
        .fn()
        .mockReturnValue({ amount: BigNumber.from(10), tokenFrom: 'tokenFrom', isIncrease: true });
      walletService.buildApproveSpecificTokenTx.mockResolvedValue({
        to: 'companion',
        from: 'account',
        data: 'approve-data',
      });
      positionService.buildModifyRateAndSwapsTx = jest.fn().mockResolvedValue({
        to: 'companion',
        from: 'account',
        data: 'modify-data',
      });
      safeService.submitMultipleTxs.mockResolvedValue({
        safeTxHash: 'safeTxHash',
      });
      walletService.getSpecificAllowance.mockResolvedValue({
        allowance: '0',
        token: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
      });
      positionService.getAllowanceTarget = jest.fn().mockReturnValue('companion');
      positionService.companionHasPermission = jest.fn().mockResolvedValue(false);
      positionService.fillAddressPermissions = jest.fn().mockResolvedValue([
        {
          operator: 'companion',
          permissions: [DCAPermission.TERMINATE],
        },
      ]);
      positionService.getModifyPermissionsTx = jest.fn().mockResolvedValue({
        from: 'account',
        to: 'permissionManager',
        data: 'modify-permission-data',
      });
    });
    test('it should call the safeService with the bundled approve and modify transactions', async () => {
      const result = await positionService.modifyRateAndSwapsSafe(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
        }),
        '10',
        '5',
        false
      );
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
        }),
        '10',
        '5',
        false
      );
      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledTimes(1);
      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledWith(
        'my account',
        toToken({ address: 'tokenFrom' }),
        'companion',
        BigNumber.from(10)
      );
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
          from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
        }),
        '10',
        '5',
        false,
        false
      );
      expect(result).toEqual({
        safeTxHash: 'safeTxHash',
      });
    });
  });

  describe('modifyRateAndSwaps', () => {
    beforeEach(() => {
      positionService.buildModifyRateAndSwapsTx = jest.fn().mockResolvedValue({
        from: 'account',
        to: 'companion',
        data: 'modify-data',
      });
      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: 'hash',
      } as unknown as TransactionResponse);
    });
    test('it should get the tx from buildModifyRateAndSwapsTx and submit it', async () => {
      const result = await positionService.modifyRateAndSwaps(
        createPositionMock({
          positionId: 'position-1',
        }),
        '10',
        '5',
        false
      );

      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 'position-1',
        }),
        '10',
        '5',
        false,
        true,
        undefined
      );

      expect(result).toEqual({
        hash: 'hash',
      });
    });
  });

  describe('setPendingTransaction', () => {
    beforeEach(() => {
      positionService.currentPositions = {
        'position-1': createPositionMock({}),
      };

      providerService.getNetwork.mockResolvedValue({ defaultProvider: true, chainId: 10 });
    });

    [
      { type: TransactionTypes.newPair },
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.wrap },
      { type: TransactionTypes.claimCampaign },
      { type: TransactionTypes.unwrap },
      { type: TransactionTypes.wrapEther },
    ].forEach((tx) => {
      test(`it should do nothing for ${tx.type} transactions`, () => {
        const previousCurrentPositions = {
          ...positionService.currentPositions,
        };

        positionService.setPendingTransaction(tx as unknown as TransactionDetails);

        expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    describe('when the transaction is for a new position', () => {
      test('it should add the new position to the currentPositions object', () => {
        const newPositionTypeData: NewPositionTypeData = {
          type: TransactionTypes.newPosition,
          typeData: {
            from: getWrappedProtocolToken(10),
            to: toToken({ address: 'newToToken' }),
            fromYield: 'fromYield',
            toYield: 'toYield',
            fromValue: '10',
            frequencyType: ONE_DAY.toString(),
            frequencyValue: '5',
            id: 'hash',
            startedAt: 1686329816,
            isCreatingPair: false,
            addressFor: HUB_ADDRESS[LATEST_VERSION][10],
            version: LATEST_VERSION,
          },
        };
        positionService.setPendingTransaction({
          chainId: 10,
          hash: 'hash',
          from: 'my account',
          ...newPositionTypeData,
        } as TransactionDetails);

        expect(positionService.currentPositions).toEqual({
          'position-1': createPositionMock({}),
          [`pending-transaction-hash-v${LATEST_VERSION}`]: {
            from: {
              ...getProtocolToken(10),
              underlyingTokens: [emptyTokenWithAddress('fromYield')],
            },
            to: {
              ...toToken({ address: 'newToToken' }),
              underlyingTokens: [emptyTokenWithAddress('toYield')],
            },
            pairId: `${getWrappedProtocolToken(10).address}-newToToken`,
            user: 'my account',
            positionId: 'pending-transaction-hash',
            chainId: 10,
            toWithdraw: BigNumber.from(0),
            swapInterval: ONE_DAY,
            swapped: BigNumber.from(0),
            rate: parseUnits('10', 18).div(BigNumber.from('5')),
            permissions: [],
            remainingLiquidity: parseUnits('10', 18),
            remainingSwaps: BigNumber.from('5'),
            totalSwaps: BigNumber.from('5'),
            totalExecutedSwaps: BigNumber.from(0),
            id: 'pending-transaction-hash',
            startedAt: 1686329816,
            pendingTransaction: 'hash',
            status: 'ACTIVE',
            version: LATEST_VERSION,
            nextSwapAvailableAt: 1686329816,
            isStale: false,
            toWithdrawYield: BigNumber.from(0),
            remainingLiquidityYield: BigNumber.from(0),
            swappedYield: BigNumber.from(0),
          } satisfies Position,
        });
      });
    });

    [
      {
        hash: 'hash',
        type: TransactionTypes.eulerClaimPermitMany,
        typeData: {
          id: 'hash',
          positionIds: ['position-many-1', 'position-many-2'],
          permissions: [],
          permittedAddress: 'permittedAddress',
        },
      },
      {
        hash: 'hash',
        type: TransactionTypes.eulerClaimTerminateMany,
        typeData: {
          id: 'hash',
          positionIds: ['position-many-1', 'position-many-2'],
          permissions: [],
          permittedAddress: 'permittedAddress',
        },
      },
    ].forEach((tx) => {
      test(`it should update all the positions for the ${tx.type} transaction`, () => {
        positionService.currentPositions = {
          ...positionService.currentPositions,
          'position-many-1': {
            ...createPositionMock({ id: 'position-many-1' }),
          },
          'position-many-2': {
            ...createPositionMock({ id: 'position-many-2' }),
          },
        };
        const previousCurrentPositions = {
          ...positionService.currentPositions,
        };
        positionService.setPendingTransaction(tx as unknown as TransactionDetails);

        expect(positionService.currentPositions).toEqual({
          ...previousCurrentPositions,
          'position-many-1': {
            ...previousCurrentPositions['position-many-1'],
            pendingTransaction: 'hash',
          },
          'position-many-2': {
            ...previousCurrentPositions['position-many-2'],
            pendingTransaction: 'hash',
          },
        });
      });
    });

    test('it should add the position from the transaction if it doesnt exist', () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      positionService.setPendingTransaction({
        hash: 'hash',
        typeData: { id: 'position-2' },
        position: createPositionMock({ id: 'position-2' }),
      } as unknown as TransactionDetails);

      expect(positionService.currentPositions).toEqual({
        ...previousCurrentPositions,
        'position-2': createPositionMock({ id: 'position-2', pendingTransaction: 'hash' }),
      });
    });

    test('it should set the position as pending', () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      positionService.setPendingTransaction({
        hash: 'hash',
        typeData: { id: 'position-1' },
      } as unknown as TransactionDetails);

      expect(positionService.currentPositions).toEqual({
        ...previousCurrentPositions,
        'position-1': {
          ...previousCurrentPositions['position-1'],
          pendingTransaction: 'hash',
        },
      });
    });
  });

  describe('handleTransactionRejection', () => {
    beforeEach(() => {
      positionService.currentPositions = {
        'unrelated-position': createPositionMock({ id: 'unrelated position' }),
        'position-1': createPositionMock({}),
      };
    });

    [
      { type: TransactionTypes.newPair },
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.wrap },
      { type: TransactionTypes.claimCampaign },
      { type: TransactionTypes.unwrap },
      { type: TransactionTypes.wrapEther },
    ].forEach((tx) => {
      beforeEach(() => positionService.setPendingTransaction(tx as TransactionDetails));
      test(`it should do nothing for ${tx.type} transactions`, () => {
        const previousCurrentPositions = {
          ...positionService.currentPositions,
        };

        positionService.handleTransactionRejection(tx as TransactionDetails);

        expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    describe('when the transaction is for a new position', () => {
      const newPositionTypeData: NewPositionTypeData = {
        type: TransactionTypes.newPosition,
        typeData: {
          from: getWrappedProtocolToken(10),
          to: toToken({ address: 'newToToken' }),
          fromYield: 'fromYield',
          toYield: 'toYield',
          fromValue: '10',
          frequencyType: ONE_DAY.toString(),
          frequencyValue: '5',
          id: 'hash',
          startedAt: 1686329816,
          isCreatingPair: false,
          addressFor: HUB_ADDRESS[LATEST_VERSION][10],
          version: LATEST_VERSION,
        },
      };

      const tx = {
        chainId: 10,
        hash: 'hash',
        ...newPositionTypeData,
      };

      let previousCurrentPositions: typeof positionService.currentPositions;

      beforeEach(() => {
        previousCurrentPositions = {
          ...positionService.currentPositions,
        };
        return positionService.setPendingTransaction(tx as TransactionDetails);
      });

      test('it should delete the pending position', () => {
        positionService.handleTransactionRejection(tx as TransactionDetails);

        expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    [
      {
        hash: 'hash',
        type: TransactionTypes.eulerClaimPermitMany,
        typeData: {
          id: 'hash',
          positionIds: ['position-many-1', 'position-many-2'],
          permissions: [],
          permittedAddress: 'permittedAddress',
        },
      },
      {
        hash: 'hash',
        type: TransactionTypes.eulerClaimTerminateMany,
        typeData: {
          id: 'hash',
          positionIds: ['position-many-1', 'position-many-2'],
          permissions: [],
          permittedAddress: 'permittedAddress',
        },
      },
    ].forEach((tx) => {
      test(`it should update all the positions for the ${tx.type} transaction`, () => {
        positionService.currentPositions = {
          ...positionService.currentPositions,
          'position-many-1': {
            ...createPositionMock({ id: 'position-many-1' }),
          },
          'position-many-2': {
            ...createPositionMock({ id: 'position-many-2' }),
          },
        };

        const previousCurrentPositions = {
          ...positionService.currentPositions,
        };

        positionService.setPendingTransaction(tx as unknown as TransactionDetails);

        positionService.handleTransactionRejection(tx as unknown as TransactionDetails);

        return expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    test('it should remove the pending status of the position', () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      positionService.setPendingTransaction({
        hash: 'hash',
        typeData: { id: 'position-1' },
      } as unknown as TransactionDetails);

      positionService.handleTransactionRejection({
        hash: 'hash',
        typeData: { id: 'position-1' },
      } as unknown as TransactionDetails);

      return expect(positionService.currentPositions).toEqual(previousCurrentPositions);
    });
  });

  describe('handleTransaction', () => {
    describe('Transactions that should be skipped', () => {
      [
        { type: TransactionTypes.newPair },
        { type: TransactionTypes.approveToken },
        { type: TransactionTypes.approveTokenExact },
        { type: TransactionTypes.swap },
        { type: TransactionTypes.wrap },
        { type: TransactionTypes.claimCampaign },
        { type: TransactionTypes.unwrap },
        { type: TransactionTypes.wrapEther },
      ].forEach((tx) => {
        beforeEach(() => {
          positionService.currentPositions = {
            'unrelated-position': createPositionMock({ id: 'unrelated position' }),
          };

          return positionService.setPendingTransaction(tx as TransactionDetails);
        });

        test(`it should do nothing for ${tx.type} transactions`, () => {
          const previousCurrentPositions = positionService.currentPositions;

          positionService.handleTransaction(tx as TransactionDetails);

          return expect(positionService.currentPositions).toEqual(previousCurrentPositions);
        });
      });
    });

    describe('Transactions that should be handled', () => {
      [
        {
          expectedPositionChanges: {
            [`10-create-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `10-create-position-v${LATEST_VERSION}`,
              positionId: 'create-position',
              remainingLiquidity: parseUnits('20', 18),
              remainingSwaps: BigNumber.from(10),
              swapped: BigNumber.from(0),
              toWithdraw: BigNumber.from(0),
              totalExecutedSwaps: BigNumber.from(0),
              totalSwaps: BigNumber.from(10),
              nextSwapAvailableAt: 1686329816,
            }),
          },
          basePositions: {},
          transaction: {
            from: 'my account',
            type: TransactionTypes.newPosition,
            chainId: 10,
            typeData: createPositionTypeDataMock({
              id: 'create-position',
              fromYield: undefined,
              toYield: undefined,
            }),
          },
        },
        {
          expectedPositionChanges: {
            [`withdraw-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-position-v${LATEST_VERSION}`,
              swapped: BigNumber.from(20),
              toWithdraw: BigNumber.from(0),
            }),
          },
          basePositions: {
            [`withdraw-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-position-v${LATEST_VERSION}`,
              swapped: BigNumber.from(20),
              toWithdraw: BigNumber.from(10),
            }),
          },
          transaction: {
            type: TransactionTypes.withdrawPosition,
            typeData: {
              id: `withdraw-position-v${LATEST_VERSION}`,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              rate: parseUnits('20', 18),
              totalSwaps: BigNumber.from(25),
              remainingSwaps: BigNumber.from(15),
              remainingLiquidity: parseUnits('300', 18),
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              rate: parseUnits('10', 18),
              totalSwaps: BigNumber.from(20),
              remainingSwaps: BigNumber.from(10),
              remainingLiquidity: parseUnits('100', 18),
            }),
          },
          transaction: {
            type: TransactionTypes.modifyRateAndSwapsPosition,
            typeData: {
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              newSwaps: '15',
              newRate: '20',
              decimals: 18,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              rate: parseUnits('4', 18),
              totalSwaps: BigNumber.from(15),
              remainingSwaps: BigNumber.from(5),
              remainingLiquidity: parseUnits('20', 18),
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              rate: parseUnits('10', 18),
              totalSwaps: BigNumber.from(20),
              remainingSwaps: BigNumber.from(10),
              remainingLiquidity: parseUnits('100', 18),
            }),
          },
          transaction: {
            type: TransactionTypes.modifyRateAndSwapsPosition,
            typeData: {
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              newSwaps: '5',
              newRate: '4',
              decimals: 18,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`withdraw-funds-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-funds-position-v${LATEST_VERSION}`,
              rate: BigNumber.from(0),
              totalSwaps: BigNumber.from(10),
              remainingLiquidity: BigNumber.from(0),
              remainingSwaps: BigNumber.from(0),
            }),
          },
          basePositions: {
            [`withdraw-funds-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-funds-position-v${LATEST_VERSION}`,
              rate: parseUnits('10', 18),
              totalSwaps: BigNumber.from(20),
              remainingSwaps: BigNumber.from(10),
              remainingLiquidity: parseUnits('100', 18),
            }),
          },
          transaction: {
            type: TransactionTypes.withdrawFunds,
            typeData: {
              id: `withdraw-funds-position-v${LATEST_VERSION}`,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`transfer-position-v${LATEST_VERSION}`]: undefined,
          },
          basePositions: {
            [`transfer-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `transfer-position-v${LATEST_VERSION}`,
            }),
          },
          transaction: {
            type: TransactionTypes.transferPosition,
            typeData: {
              id: `transfer-position-v${LATEST_VERSION}`,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`terminate-position-v${LATEST_VERSION}`]: undefined,
          },
          basePositions: {
            [`terminate-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `terminate-position-v${LATEST_VERSION}`,
            }),
          },
          expectedPastPositionChanges: {
            [`terminate-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `terminate-position-v${LATEST_VERSION}`,
              toWithdraw: BigNumber.from(0),
              remainingLiquidity: BigNumber.from(0),
              remainingSwaps: BigNumber.from(0),
            }),
          },
          transaction: {
            type: TransactionTypes.terminatePosition,
            typeData: {
              id: `terminate-position-v${LATEST_VERSION}`,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`modify-permissions-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-permissions-position-v${LATEST_VERSION}`,
              permissions: [
                {
                  id: 'operator-id',
                  operator: 'new operator',
                  permissions: [DCAPermission.INCREASE],
                },
              ],
            }),
          },
          basePositions: {
            [`modify-permissions-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-permissions-position-v${LATEST_VERSION}`,
              permissions: [
                {
                  id: 'operator-id',
                  operator: 'new operator',
                  permissions: [DCAPermission.INCREASE, DCAPermission.REDUCE],
                },
              ],
            }),
          },
          transaction: {
            type: TransactionTypes.modifyPermissions,
            typeData: {
              id: `modify-permissions-position-v${LATEST_VERSION}`,
              permissions: [
                {
                  id: 'operator-id',
                  operator: 'new operator',
                  permissions: [DCAPermission.INCREASE],
                },
              ],
            },
          },
        },
      ].forEach((testItem) => {
        beforeEach(() => {
          positionService.currentPositions = {
            ...positionService.currentPositions,
            'unrelated-position': createPositionMock({ id: 'unrelated position' }),
            ...testItem.basePositions,
          };

          return positionService.setPendingTransaction(testItem.transaction as TransactionDetails);
        });

        test(`it should do update the position as expecteed for ${testItem.transaction.type} transactions`, () => {
          const previousCurrentPositions = positionService.currentPositions;
          const previousPastPositions = positionService.pastPositions;

          positionService.handleTransaction(testItem.transaction as TransactionDetails);

          if (testItem.expectedPastPositionChanges) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(positionService.pastPositions).toEqual({
              ...previousPastPositions,
              ...testItem.expectedPastPositionChanges,
            });
          }
          return expect(positionService.currentPositions).toEqual({
            ...previousCurrentPositions,
            ...testItem.expectedPositionChanges,
          });
        });
      });
    });
  });
});
/* eslint-enable @typescript-eslint/unbound-method */
