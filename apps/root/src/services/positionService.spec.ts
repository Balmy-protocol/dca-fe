/* eslint-disable @typescript-eslint/unbound-method */
import {
  AmountsOfToken,
  NFTData,
  NetworkStruct,
  NewPositionTypeData,
  PermissionData,
  Position,
  PositionStatus,
  PositionVersions,
  Token,
  TokenType,
  TransactionDetails,
  TransactionTypes,
  WalletStatus,
  WalletType,
  YieldName,
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
import { parseSignatureValues } from '@common/utils/signatures';
import {
  Address,
  GetContractReturnType,
  WalletClient,
  maxUint256,
  parseUnits,
  getContract,
  PublicClient,
  encodeFunctionData,
} from 'viem';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager';

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
  AmountsOfToken as SdkAmountsOfToken,
} from '@balmy/sdk';
import AccountService from './accountService';
import { parsePermissionsForSdk } from '@common/utils/sdk';
import { AxiosResponse } from 'axios';

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
jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  getContract: jest.fn(),
  encodeFunctionData: jest.fn(),
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@common/utils/signatures', () => ({
  ...jest.requireActual('@common/utils/signatures'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  parseSignatureValues: jest.fn(),
}));

const mockedParseSignatureValues = jest.mocked(parseSignatureValues, { shallow: true });
const mockedEncondeFunctionData = jest.mocked(encodeFunctionData, { shallow: true });
const mockedGetContract = jest.mocked(getContract, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
const MockedWalletService = jest.mocked(WalletService, { shallow: true });
const MockedContractService = jest.mocked(ContractService, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedSafeService = jest.mocked(SafeService, { shallow: true });
const MockedPairService = jest.mocked(PairService, { shallow: true });
const MockedPermit2Service = jest.mocked(Permit2Service, { shallow: true });
const MockedSdkService = jest.mocked(SdkService, { shallow: false });
const MockedAccountService = jest.mocked(AccountService, { shallow: false });

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
  pairId,
  yields,
}: {
  from?: Token;
  to?: Token;
  pairId?: string;
  user?: Address;
  swapInterval?: bigint;
  swapped?: AmountsOfToken;
  remainingLiquidity?: AmountsOfToken;
  remainingSwaps?: bigint;
  totalSwaps?: bigint;
  rate?: AmountsOfToken;
  toWithdraw?: AmountsOfToken;
  totalExecutedSwaps?: bigint;
  id?: string;
  positionId?: bigint;
  status?: PositionStatus;
  startedAt?: number;
  pendingTransaction?: string;
  version?: PositionVersions;
  chainId?: number;
  permissions?: PermissionData[];
  isStale?: boolean;
  toWithdrawYield?: AmountsOfToken;
  remainingLiquidityYield?: AmountsOfToken;
  swappedYield?: AmountsOfToken;
  nextSwapAvailableAt?: number;
  yields?: Position['yields'];
}): Position {
  const fromToUse = (!isUndefined(from) && from) || toToken({ address: 'from' });
  const toToUse = (!isUndefined(to) && to) || toToken({ address: 'to' });
  const underlyingFrom = fromToUse.underlyingTokens[0];
  const underlyingTo = toToUse.underlyingTokens[0];

  return {
    from: fromToUse,
    to: toToUse,
    pairId: pairId || `${(underlyingFrom || fromToUse).address}-${(underlyingTo || toToUse).address}`,
    user: !isUndefined(user) ? user : '0xmyaccount',
    swapInterval: !isUndefined(swapInterval) ? swapInterval : ONE_DAY,
    swapped: !isUndefined(swapped) ? swapped : { amount: parseUnits('10', 18), amountInUnits: '10' },
    remainingLiquidity: !isUndefined(remainingLiquidity)
      ? remainingLiquidity
      : { amount: parseUnits('10', 18), amountInUnits: '10', amountInUSD: '0' },
    remainingSwaps: !isUndefined(remainingSwaps) ? remainingSwaps : parseUnits('5', 18),
    totalSwaps: !isUndefined(totalSwaps) ? totalSwaps : parseUnits('10', 18),
    rate: !isUndefined(rate) ? rate : { amount: parseUnits('2', 18), amountInUnits: '2', amountInUSD: '0' },
    toWithdraw: !isUndefined(toWithdraw) ? toWithdraw : { amount: parseUnits('5', 18), amountInUnits: '5' },
    totalExecutedSwaps: !isUndefined(totalExecutedSwaps) ? totalExecutedSwaps : BigInt(5),
    id: !isUndefined(id) ? id : '10-1-v4',
    positionId: !isUndefined(positionId) ? positionId : 1n,
    status: !isUndefined(status) ? status : 'ACTIVE',
    startedAt: !isUndefined(startedAt) ? startedAt : 1686329816,
    pendingTransaction: !isUndefined(pendingTransaction) ? pendingTransaction : '',
    version: !isUndefined(version) ? version : PositionVersions.POSITION_VERSION_4,
    chainId: !isUndefined(chainId) ? chainId : 10,
    permissions: !isUndefined(permissions) ? permissions : [],
    isStale: !isUndefined(isStale) ? isStale : false,
    toWithdrawYield,
    remainingLiquidityYield,
    swappedYield,
    nextSwapAvailableAt: !isUndefined(nextSwapAvailableAt) ? nextSwapAvailableAt : 10,
    yields: yields || {
      from: undefined,
      to: undefined,
    },
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
  id?: bigint;
  startedAt?: number;
  isCreatingPair?: boolean;
  addressFor?: Address;
  version?: PositionVersions;
}): NewPositionTypeData['typeData'] {
  return {
    from: (!isUndefined(from) && from) || toToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toToken({ address: 'to' }),
    id: ((!isUndefined(id) && id) || 1n).toString(),
    fromYield: fromYield || (!isUndefined(fromYield) && 'fromYield') || undefined,
    toYield: toYield || (!isUndefined(toYield) && 'toYield') || undefined,
    fromValue: (!isUndefined(fromValue) && fromValue) || '20',
    frequencyType: (!isUndefined(frequencyType) && frequencyType) || ONE_DAY.toString(),
    frequencyValue: (!isUndefined(frequencyValue) && frequencyValue) || '10',
    isCreatingPair: (!isUndefined(isCreatingPair) && isCreatingPair) || false,
    addressFor: (!isUndefined(addressFor) && addressFor) || HUB_ADDRESS[LATEST_VERSION][10],
    startedAt: (!isUndefined(startedAt) && startedAt) || 1686329816,
    version: (!isUndefined(version) && version) || PositionVersions.POSITION_VERSION_4,
    yields: {},
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
  totalExecutedSwaps?: bigint;
  swapInterval?: number;
  remainingSwaps?: number;
  swapped?: SdkAmountsOfToken;
  remainingLiquidity?: SdkAmountsOfToken;
  toWithdraw?: SdkAmountsOfToken;
  rate?: SdkAmountsOfToken;
  totalSwaps?: number;
  createdAt?: number;
  permissions?: Record<string, DCAPermission[]>;
  toWithdrawYield?: SdkAmountsOfToken;
  remainingLiquidityYield?: SdkAmountsOfToken;
  swappedYield?: SdkAmountsOfToken;
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
    nextSwapAvailableAt: !isUndefined(nextSwapAvailableAt) ? nextSwapAvailableAt : 10,
    history: (!isUndefined(history) && history) || [],
    from: (!isUndefined(from) && from) || toDcaPositionToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toDcaPositionToken({ address: 'to' }),
    owner: (!isUndefined(owner) && owner) || '0xmyaccount',
    swapInterval: !isUndefined(swapInterval) ? swapInterval : Number(ONE_DAY),
    funds: {
      swapped: !isUndefined(swapped) ? swapped : { amount: parseUnits('10', 18), amountInUnits: '10' },
      remaining: !isUndefined(remainingLiquidity)
        ? remainingLiquidity
        : { amount: parseUnits('10', 18), amountInUnits: '10' },
      toWithdraw: !isUndefined(toWithdraw) ? toWithdraw : { amount: parseUnits('5', 18), amountInUnits: '5' },
    },
    generatedByYield:
      ((!isUndefined(toWithdrawYield) || !isUndefined(remainingLiquidityYield) || !isUndefined(swappedYield)) && {
        swapped: !isUndefined(swappedYield) ? swappedYield : { amount: parseUnits('10', 18), amountInUnits: '10' },
        remaining: !isUndefined(remainingLiquidityYield)
          ? remainingLiquidityYield
          : { amount: parseUnits('10', 18), amountInUnits: '10' },
        toWithdraw: !isUndefined(toWithdrawYield)
          ? toWithdrawYield
          : { amount: parseUnits('10', 18), amountInUnits: '10' },
      }) ||
      undefined,
    remainingSwaps: !isUndefined(remainingSwaps) ? remainingSwaps : 5,
    totalSwaps: !isUndefined(totalSwaps) ? totalSwaps : 10,
    rate: !isUndefined(rate) ? rate : { amount: parseUnits('2', 18), amountInUnits: '2' },
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

    providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
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
          address: '0xwallet-1',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
        },
        {
          address: '0xwallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
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
            rate: { amount: 20n, amountInUnits: '20' },
            remainingSwaps: 5,
            toWithdraw: { amount: 13n, amountInUnits: '13' },
            toWithdrawYield: { amount: 2n, amountInUnits: '2' },
            swappedYield: { amount: 4n, amountInUnits: '4' },
            swapped: { amount: 15n, amountInUnits: '15' },
            remainingLiquidity: { amount: 110n, amountInUnits: '110' },
            remainingLiquidityYield: { amount: 10n, amountInUnits: '10' },
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
            rate: { amount: 25n, amountInUnits: '25' },
            remainingSwaps: 5,
            toWithdraw: { amount: 16n, amountInUnits: '16' },
            toWithdrawYield: { amount: 1n, amountInUnits: '1' },
            swappedYield: { amount: 4n, amountInUnits: '4' },
            swapped: { amount: 20n, amountInUnits: '20' },
            remainingLiquidity: { amount: 130n, amountInUnits: '130' },
            remainingLiquidityYield: { amount: 5n, amountInUnits: '5' },
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
            rate: { amount: 30n, amountInUnits: '30' },
            remainingSwaps: 5,
            toWithdraw: { amount: 21n, amountInUnits: '21' },
            toWithdrawYield: { amount: 1n, amountInUnits: '1' },
            swappedYield: { amount: 5n, amountInUnits: '5' },
            swapped: { amount: 30n, amountInUnits: '30' },
            remainingLiquidity: { amount: 160n, amountInUnits: '160' },
            remainingLiquidityYield: { amount: 10n, amountInUnits: '10' },
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
            rate: { amount: 30n, amountInUnits: '30' },
            remainingSwaps: 5,
            toWithdraw: { amount: 21n, amountInUnits: '21' },
            toWithdrawYield: { amount: 1n, amountInUnits: '1' },
            swappedYield: { amount: 5n, amountInUnits: '5' },
            swapped: { amount: 30n, amountInUnits: '30' },
            remainingLiquidity: { amount: 160n, amountInUnits: '160' },
            remainingLiquidityYield: { amount: 10n, amountInUnits: '10' },
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
      expect(sdkService.getUsersDcaPositions).toHaveBeenCalledWith(['0xwallet-1', '0xwallet-2']);
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchCurrentPositions();

      expect(positionService.currentPositions).toEqual({
        [`10-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [],
          }),
          positionId: 1n,
          id: `10-1-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: { amount: 13n, amountInUnits: '13' },
          toWithdrawYield: { amount: 2n, amountInUnits: '2' },
          swapped: { amount: 15n, amountInUnits: '15' },
          swappedYield: { amount: 4n, amountInUnits: '4' },
          remainingLiquidity: { amount: 110n, amountInUnits: '110' },
          remainingLiquidityYield: { amount: 10n, amountInUnits: '10' },
          rate: { amount: 20n, amountInUnits: '20' },
          remainingSwaps: 5n,
          totalSwaps: 10n,
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'fromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'toYield',
            },
          },
          pairId: 'fromyield-toyield',
        }),
        [`10-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [],
          }),
          positionId: 2n,
          id: `10-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: { amount: 16n, amountInUnits: '16' },
          toWithdrawYield: { amount: 1n, amountInUnits: '1' },
          swapped: { amount: 20n, amountInUnits: '20' },
          swappedYield: { amount: 4n, amountInUnits: '4' },
          remainingLiquidity: { amount: 130n, amountInUnits: '130' },
          remainingLiquidityYield: { amount: 5n, amountInUnits: '5' },
          rate: { amount: 25n, amountInUnits: '25' },
          remainingSwaps: 5n,
          totalSwaps: 10n,
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'fromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'toYield',
            },
          },
          pairId: 'fromyield-toyield',
        }),
        [`10-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [],
          }),
          positionId: 3n,
          id: `10-3-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: { amount: 21n, amountInUnits: '21' },
          toWithdrawYield: { amount: 1n, amountInUnits: '1' },
          swapped: { amount: 30n, amountInUnits: '30' },
          swappedYield: { amount: 5n, amountInUnits: '5' },
          remainingLiquidity: { amount: 160n, amountInUnits: '160' },
          remainingLiquidityYield: { amount: 10n, amountInUnits: '10' },
          rate: { amount: 30n, amountInUnits: '30' },
          remainingSwaps: 5n,
          totalSwaps: 10n,
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'anotherFromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'anotherToYield',
            },
          },
          pairId: 'anotherfromyield-anothertoyield',
        }),
      });
    });
  });

  describe('fetchPastPositions', () => {
    beforeEach(() => {
      accountService.getWallets.mockReturnValue([
        {
          address: '0xwallet-1',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
        },
        {
          address: '0xwallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
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
            rate: { amount: 20n, amountInUnits: '20' },
            remainingSwaps: 0,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swappedYield: { amount: 4n, amountInUnits: '4' },
            swapped: { amount: 15n, amountInUnits: '15' },
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
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
            rate: { amount: 25n, amountInUnits: '25' },
            remainingSwaps: 0,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swappedYield: { amount: 4n, amountInUnits: '4' },
            swapped: { amount: 20n, amountInUnits: '20' },
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
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
            rate: { amount: 30n, amountInUnits: '30' },
            remainingSwaps: 0,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swappedYield: { amount: 5n, amountInUnits: '5' },
            swapped: { amount: 30n, amountInUnits: '30' },
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
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
            rate: { amount: 30n, amountInUnits: '30' },
            remainingSwaps: 0,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swappedYield: { amount: 5n, amountInUnits: '5' },
            swapped: { amount: 30n, amountInUnits: '30' },
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
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

      expect(sdkService.getUsersDcaPositions).toHaveBeenCalledWith(['0xwallet-1', '0xwallet-2']);
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchPastPositions();

      expect(positionService.pastPositions).toEqual({
        [`10-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [],
          }),
          positionId: 1n,
          status: 'TERMINATED',
          toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          id: `10-1-v${PositionVersions.POSITION_VERSION_4}`,
          rate: { amount: 20n, amountInUnits: '20' },
          remainingSwaps: 0n,
          swapped: { amount: 15n, amountInUnits: '15' },
          swappedYield: { amount: 4n, amountInUnits: '4' },
          totalSwaps: 5n,
          pairId: 'fromyield-toyield',
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'fromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'toYield',
            },
          },
        }),
        [`10-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [],
          }),
          positionId: 2n,
          status: 'TERMINATED',
          id: `10-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          rate: { amount: 25n, amountInUnits: '25' },
          remainingSwaps: 0n,
          pairId: 'fromyield-toyield',
          swapped: { amount: 20n, amountInUnits: '20' },
          swappedYield: { amount: 4n, amountInUnits: '4' },
          totalSwaps: 5n,
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'fromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'toYield',
            },
          },
        }),
        [`10-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [],
          }),
          pairId: 'anotherfromyield-anothertoyield',
          positionId: 3n,
          status: 'TERMINATED',
          toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
          id: `10-3-v${PositionVersions.POSITION_VERSION_4}`,
          rate: { amount: 30n, amountInUnits: '30' },
          remainingSwaps: 0n,
          swapped: { amount: 30n, amountInUnits: '30' },
          swappedYield: { amount: 5n, amountInUnits: '5' },
          totalSwaps: 5n,
          yields: {
            from: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'anotherFromYield',
            },
            to: {
              apy: 0,
              // @ts-expect-error do not care
              name: 'aave',
              token: {
                // @ts-expect-error do not care
                address: '',
                chainId: 1,
                decimals: 18,
                name: '',
                symbol: '',
                type: TokenType.BASE,
                underlyingTokens: [],
                chainAddresses: [],
              },
              tokenAddress: 'anotherToYield',
            },
          },
        }),
      });
    });
  });

  describe('getSignatureForPermission', () => {
    let mockedPermissionManagerInstance: jest.Mocked<
      //@ts-expect-error viem shit
      GetContractReturnType<typeof PERMISSION_MANAGER_ABI, object, object, `0x${string}`>
    >;
    let mockedSigner: jest.Mocked<WalletClient>;
    beforeEach(() => {
      mockedPermissionManagerInstance = {
        read: {
          nonces: jest.fn().mockResolvedValue(10),
          hasPermission: jest.fn().mockImplementation(([, , permission]) => {
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
        },
        //@ts-expect-error viem shit
      } as unknown as jest.Mocked<GetContractReturnType<typeof PERMISSION_MANAGER_ABI, object, object, `0x${string}`>>;

      mockedSigner = {
        signTypedData: jest.fn().mockResolvedValue('signed data'),
      } as unknown as jest.Mocked<WalletClient>;
      //@ts-expect-error viem shit
      mockedGetContract.mockReturnValue(mockedPermissionManagerInstance);
      providerService.getSigner.mockResolvedValue(mockedSigner as unknown as ReturnType<ProviderService['getSigner']>);
      providerService.getProvider.mockReturnValue('provider' as unknown as PublicClient);
      mockedParseSignatureValues.mockReturnValue({
        r: '0x3',
        s: '0x4',
        v: 1n,
        rawSignature: 'signed data' as `0x${string}`,
        yParity: 1,
      });
      contractService.getPermissionManagerAddress.mockReturnValue('0xpermissionManagerAddress');
    });
    describe('when an address is passed', () => {
      test('it should use the specific permission manager address for the signature', async () => {
        await positionService.getSignatureForPermission(
          createPositionMock({}),
          '0xcontractAddress',
          PERMISSIONS.INCREASE,
          '0xprovidedPermissionManagerAddress'
        );

        expect(getContract).toHaveBeenCalledTimes(2);
        expect(getContract).toHaveBeenCalledWith({
          abi: PERMISSION_MANAGER_ABI,
          address: '0xprovidedPermissionManagerAddress',
          client: {
            public: 'provider',
            wallet: mockedSigner,
          },
        });
      });
    });

    describe('when the erc712 name is passed', () => {
      test('it should use the specific name address for the signature', async () => {
        await positionService.getSignatureForPermission(
          createPositionMock({}),
          '0xcontractAddress',
          PERMISSIONS.INCREASE,
          undefined,
          'erc712Name'
        );

        // eslint-disable-next-line no-underscore-dangle
        expect(mockedSigner.signTypedData).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line no-underscore-dangle
        expect(mockedSigner.signTypedData).toHaveBeenCalledWith({
          domain: {
            name: 'erc712Name',
            version: SIGN_VERSION[PositionVersions.POSITION_VERSION_4],
            chainId: 10,
            verifyingContract: '0xpermissionManagerAddress',
          },
          types: {
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
          message: {
            tokenId: 1n,
            permissions: [
              {
                operator: '0xcontractAddress',
                permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
              },
            ],
            nonce: 10,
            deadline: maxUint256 - 1n,
          },
          primaryType: 'PermissionPermit',
          account: '0xmyaccount',
        });
      });
    });

    test('it should build a signature by extending the position permissions', async () => {
      const result = await positionService.getSignatureForPermission(
        createPositionMock({}),
        '0xcontractAddress',
        PERMISSIONS.INCREASE
      );

      // eslint-disable-next-line no-underscore-dangle
      expect(mockedSigner.signTypedData).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line no-underscore-dangle
      expect(mockedSigner.signTypedData).toHaveBeenCalledWith({
        domain: {
          name: 'Mean Finance - DCA Position',
          version: SIGN_VERSION[PositionVersions.POSITION_VERSION_4],
          chainId: 10,
          verifyingContract: '0xpermissionManagerAddress',
        },
        types: {
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
        message: {
          tokenId: 1n,
          permissions: [
            {
              operator: '0xcontractAddress',
              permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
            },
          ],
          nonce: 10,
          deadline: maxUint256 - 1n,
        },
        primaryType: 'PermissionPermit',
        account: '0xmyaccount',
      });

      expect(mockedParseSignatureValues).toHaveBeenCalledTimes(1);
      expect(mockedParseSignatureValues).toHaveBeenCalledWith('signed data');

      expect(result).toEqual({
        permissions: [
          {
            operator: '0xcontractAddress',
            permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE, PERMISSIONS.INCREASE],
          },
        ],
        deadline: maxUint256 - 1n,
        v: 1n,
        r: '0x3',
        s: '0x4',
        yParity: 1,
      });
    });
  });

  describe('companionHasPermission', () => {
    let permissionManagerInstanceMock: jest.Mocked<
      ReturnType<NonNullable<ContractService['getPermissionManagerInstance']>>
    >;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        read: {
          hasPermission: jest.fn().mockResolvedValue(false),
        },
      } as unknown as jest.Mocked<ReturnType<ContractService['getPermissionManagerInstance']>>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      providerService.getSigner.mockResolvedValue('signer' as unknown as ReturnType<ProviderService['getSigner']>);
    });
    test('it should use the latest companion to call the permission manager to get the permission', async () => {
      const result = await positionService.companionHasPermission(
        createPositionMock({ version: PositionVersions.POSITION_VERSION_3 }),
        PERMISSIONS.INCREASE
      );

      expect(contractService.getPermissionManagerInstance).toHaveBeenCalledWith({
        chainId: 10,
        version: PositionVersions.POSITION_VERSION_3,
        readOnly: true,
      });
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(10, LATEST_VERSION);

      expect(result).toEqual(false);
    });
  });

  describe('modifyPermissions', () => {
    let permissionManagerInstanceMock: jest.Mocked<
      Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>
    >;
    let mockedSigner: jest.Mocked<WalletClient>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        address: '0xpermissionManager',
      } as unknown as jest.Mocked<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>;

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: '0xmodify-hash',
        from: '0xaccount',
        chainId: 10,
      });

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);

      mockedSigner = {
        prepareTransactionRequest: jest.fn().mockResolvedValue({
          to: '0xpermissionManager',
          data: '0xmodify',
        }),
      } as unknown as jest.Mocked<WalletClient>;
      providerService.getSigner.mockResolvedValue(mockedSigner as unknown as ReturnType<ProviderService['getSigner']>);
      mockedEncondeFunctionData.mockReturnValue('0xmodifydata');
    });
    test('it should call the modify of the permissionManager with the new permissions', async () => {
      const result = await positionService.modifyPermissions(createPositionMock({ positionId: 1n }), [
        {
          id: 'permission',
          operator: '0xoperator',
          permissions: [DCAPermission.INCREASE, DCAPermission.REDUCE, DCAPermission.WITHDRAW],
        },
      ]);

      expect(mockedEncondeFunctionData).toHaveBeenCalledTimes(1);
      expect(mockedEncondeFunctionData).toHaveBeenCalledWith({
        ...permissionManagerInstanceMock,
        functionName: 'modify',
        args: [
          1n,
          [
            {
              operator: '0xoperator',
              permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW],
            },
          ],
        ],
      });

      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
      expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
        from: '0xmyaccount',
        to: '0xpermissionManager',
        data: '0xmodify',
        chainId: 10,
      });
      expect(result).toEqual({
        hash: '0xmodify-hash',
        from: '0xaccount',
        chainId: 10,
      });
    });
  });

  describe('transfer', () => {
    let permissionManagerInstanceMock: jest.Mocked<
      Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>
    >;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        address: '0xpermissionManager',
        write: {
          transferFrom: jest.fn().mockResolvedValue('transferFrom'),
        },
      } as unknown as jest.Mocked<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
      mockedEncondeFunctionData.mockReturnValue('0xtransferdata');
      providerService.sendTransaction.mockResolvedValue({
        hash: '0xtransferFrom-hash',
        from: '0xmyaccount',
        chainId: 10,
      });
    });
    test('it should call the transferFrom of the permissionManager for the new user', async () => {
      const result = await positionService.transfer(
        createPositionMock({
          positionId: 1n,
        }),
        '0xtoAddress'
      );

      expect(mockedEncondeFunctionData).toHaveBeenCalledTimes(1);
      expect(mockedEncondeFunctionData).toHaveBeenCalledWith({
        ...permissionManagerInstanceMock,
        functionName: 'transferFrom',
        args: ['0xmyaccount', '0xtoAddress', 1n],
      });

      expect(providerService.sendTransaction).toHaveBeenCalledTimes(1);
      expect(providerService.sendTransaction).toHaveBeenCalledWith({
        to: '0xpermissionManager',
        data: '0xtransferdata',
        from: '0xmyaccount',
        chainId: 10,
      });

      expect(result).toEqual({
        hash: '0xtransferFrom-hash',
        from: '0xmyaccount',
        chainId: 10,
      });
    });
  });

  describe('getTokenNFT', () => {
    let permissionManagerInstanceMock: jest.Mocked<
      NonNullable<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>
    >;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        read: {
          tokenURI: jest.fn().mockResolvedValue('url'),
        },
      } as unknown as jest.Mocked<NonNullable<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>>;

      meanApiService.getNFTData.mockResolvedValue({
        data: { name: 'tokenUri', image: 'image', description: 'description' },
      } as AxiosResponse<NFTData>);
      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });
    test('it should call the tokenUri of the permissionManager and parse the json result', async () => {
      const result = await positionService.getTokenNFT(
        createPositionMock({
          positionId: 1n,
        })
      );

      expect(permissionManagerInstanceMock.read.tokenURI).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.read.tokenURI).toHaveBeenCalledWith([1n]);
      expect(result).toEqual({ name: 'tokenUri', image: 'image', description: 'description' });
    });
  });

  describe('buildDepositParams', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
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
          swaps: 5n,
          interval: ONE_DAY,
          account: 'account',
          permissions: [
            {
              operator: '0xcompanionAddress',
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
          swaps: 5n,
          interval: ONE_DAY,
          account: 'account',
          permissions: [{ operator: '0xcompanionAddress', permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE] }],
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
          swaps: 5n,
          interval: ONE_DAY,
          account: 'account',
          permissions: [{ operator: '0xcompanionAddress', permissions: [] }],
          yieldFrom: undefined,
          yieldTo: undefined,
        });
      });
    });
  });

  describe('buildDepositTx', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      sdkService.buildCreatePositionTx.mockResolvedValue({
        to: '0xcompanion',
        data: '0xdata',
      } as unknown as Awaited<ReturnType<SdkService['buildCreatePositionTx']>>);
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
            nonce: 0n,
            rawSignature: 'signature',
          }
        );

        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildCreatePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          from: { address: params.from, variantId: params.yieldFrom },
          to: { address: params.to, variantId: params.yieldTo },
          swapInterval: Number(params.interval),
          amountOfSwaps: Number(params.swaps),
          owner: params.account,
          permissions: parsePermissionsForSdk(params.permissions),
          deposit: {
            permitData: {
              amount: params.totalAmmount,
              token: params.takeFrom,
              nonce: 0n,
              deadline: 10n,
            },
            signature: 'signature',
          },
        });
        expect(result).toEqual({
          to: '0xcompanion',
          data: '0xdata',
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
          swapInterval: Number(params.interval),
          amountOfSwaps: Number(params.swaps),
          owner: params.account,
          permissions: parsePermissionsForSdk(params.permissions),
          deposit: { token: params.takeFrom, amount: params.totalAmmount },
        });
        expect(result).toEqual({
          to: '0xcompanion',
          data: '0xdata',
        });
      });
    });
  });

  describe('approveAndDepositSafe', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      walletService.buildApproveSpecificTokenTx.mockResolvedValue({
        to: '0xcompanion',
        from: '0xsafe',
        data: '0xapprove',
      } as unknown as Awaited<ReturnType<WalletService['buildApproveSpecificTokenTx']>>);
      positionService.buildDepositTx = jest.fn().mockResolvedValue({
        to: '0xcompanion',
        from: '0xsafe',
        data: '0xdeposit',
      });

      safeService.submitMultipleTxs.mockResolvedValue({
        safeTxHash: '0xsafeTxHash',
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
        '0xaccount',
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
        '0xaccount',
        toToken({ address: 'from' }),
        'resolved-allowance-target',
        params.totalAmmount
      );
      expect(positionService.buildDepositTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildDepositTx).toHaveBeenCalledWith(
        '0xaccount',
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
          to: '0xcompanion',
          from: '0xsafe',
          data: '0xapprove',
        },
        {
          to: '0xcompanion',
          from: '0xsafe',
          data: '0xdeposit',
        },
      ]);
      expect(result).toEqual({
        safeTxHash: '0xsafeTxHash',
      });
    });
  });

  describe('deposit', () => {
    beforeEach(() => {
      positionService.buildDepositTx = jest.fn().mockResolvedValue({
        from: '0xuser',
        to: '0xcompanion',
      });
      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: '0xhash',
        from: '0xuser',
        chainId: 10,
      });
    });
    test('it should get the tx from buildDepositTx and submit it', async () => {
      const result = await positionService.deposit(
        '0xuser',
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
        '0xuser',
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
        from: '0xuser',
        to: '0xcompanion',
        chainId: 10,
      });
      expect(result).toEqual({
        hash: '0xhash',
        from: '0xuser',
        chainId: 10,
      });
    });
  });

  describe('withdraw', () => {
    beforeEach(() => {
      sdkService.buildWithdrawPositionTx.mockResolvedValue({
        to: '0xcompanion',
        data: '0xwithdrawSwapped',
      } as unknown as Awaited<ReturnType<SdkService['buildWithdrawPositionTx']>>);

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: '0xhash',
        from: '0xmyaccount',
        chainId: 10,
      });

      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: [
          {
            operator: 'companion',
            permissions: [PERMISSIONS.WITHDRAW],
          },
        ],
        deadline: 10n,
        v: 27,
        r: '0x1',
        s: '0x1',
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
            positionId: 1n,
          }),
          false
        );

        expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 1n,
          withdraw: {
            convertTo: 'to',
          },
          dcaHub: '0xhubAddress',
          recipient: '0xmyaccount',
          permissionPermit: undefined,
        });
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
          from: '0xmyaccount',
          to: '0xcompanion',
          chainId: 10,
          data: '0xwithdrawSwapped',
        });
        expect(result).toEqual({
          hash: '0xhash',
          from: '0xmyaccount',
          chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              positionId: 1n,
            }),
            '0xcompanionAddress',
            PERMISSIONS.WITHDRAW
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              convertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: '1',
            },
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xwithdrawSwapped',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xhash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              convertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            from: '0xmyaccount',
            to: '0xcompanion',
            data: '0xwithdrawSwapped',
            chainId: 10,
          });

          expect(result).toEqual({
            hash: '0xhash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              convertTo: getWrappedProtocolToken(10).address,
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xwithdrawSwapped',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xhash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            true
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: getProtocolToken(10),
              positionId: 1n,
            }),
            '0xcompanionAddress',
            PERMISSIONS.WITHDRAW
          );

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              convertTo: getProtocolToken(10).address,
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: '1',
            },
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xwithdrawSwapped',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xhash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            true
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildWithdrawPositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              convertTo: getProtocolToken(10).address,
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xwithdrawSwapped',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xhash',
            from: '0xmyaccount',
            chainId: 10,
          });
        });
      });
    });
  });

  describe('terminate', () => {
    beforeEach(() => {
      sdkService.buildTerminatePositionTx.mockResolvedValue({
        to: '0xcompanion',
        data: '0xterminate',
      } as unknown as Awaited<ReturnType<SdkService['buildTerminatePositionTx']>>);

      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');

      providerService.sendTransactionWithGasLimit.mockResolvedValue({
        hash: '0xterminate-hash',
        from: '0xmyaccount',
        chainId: 10,
      });

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: [
          {
            operator: 'companion',
            permissions: [PERMISSIONS.WITHDRAW],
          },
        ],
        deadline: 10n,
        v: 27,
        r: '0x1',
        s: '0x1',
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
            positionId: 1n,
          }),
          false
        );

        expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 1n,
          withdraw: {
            unswappedConvertTo: 'from',
            swappedConvertTo: 'to',
          },
          dcaHub: '0xhubAddress',
          recipient: '0xmyaccount',
          permissionPermit: undefined,
        });

        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
        expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
          to: '0xcompanion',
          from: '0xmyaccount',
          data: '0xterminate',
          chainId: 10,
        });
        expect(result).toEqual({
          hash: '0xterminate-hash',
          from: '0xmyaccount',
          chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to', underlyingTokens: [toToken({ address: 'toYield' })] }),
              from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
              positionId: 1n,
            }),
            '0xcompanionAddress',
            PERMISSIONS.TERMINATE,
            undefined,
            undefined
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              unswappedConvertTo: 'from',
              swappedConvertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: '10',
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: '1',
            },
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xterminate',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xterminate-hash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              unswappedConvertTo: 'from',
              swappedConvertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            from: '0xmyaccount',
            data: '0xterminate',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xterminate-hash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            false
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              unswappedConvertTo: getWrappedProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            data: '0xterminate',
            from: '0xmyaccount',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xterminate-hash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            true
          );

          expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
          expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
            createPositionMock({
              to: toToken({ address: 'to' }),
              from: getProtocolToken(10),
              positionId: 1n,
            }),
            '0xcompanionAddress',
            PERMISSIONS.TERMINATE,
            undefined,
            undefined
          );

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              unswappedConvertTo: getProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: {
              permissions: [
                {
                  operator: 'companion',
                  permissions: ['WITHDRAW'],
                },
              ],
              deadline: '10',
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: '1',
            },
          });

          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            data: '0xterminate',
            from: '0xmyaccount',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xterminate-hash',
            from: '0xmyaccount',
            chainId: 10,
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
              positionId: 1n,
            }),
            true
          );

          expect(positionService.getSignatureForPermission).not.toHaveBeenCalled();

          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledTimes(1);
          expect(sdkService.buildTerminatePositionTx).toHaveBeenCalledWith({
            chainId: 10,
            positionId: 1n,
            withdraw: {
              unswappedConvertTo: getProtocolToken(10).address,
              swappedConvertTo: 'to',
            },
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            permissionPermit: undefined,
          });
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledTimes(1);
          expect(providerService.sendTransactionWithGasLimit).toHaveBeenCalledWith({
            to: '0xcompanion',
            data: '0xterminate',
            from: '0xmyaccount',
            chainId: 10,
          });
          expect(result).toEqual({
            hash: '0xterminate-hash',
            from: '0xmyaccount',
            chainId: 10,
          });
        });
      });
    });
  });

  describe('terminateManyRaw', () => {
    let hubCompanionInstanceMock: jest.Mocked<Awaited<ReturnType<ContractService['getHUBCompanionInstance']>>>;
    beforeEach(() => {
      hubCompanionInstanceMock = {
        write: {
          multicall: jest.fn().mockResolvedValue('0xhash'),
        },
      } as unknown as jest.Mocked<Awaited<ReturnType<ContractService['getHUBCompanionInstance']>>>;

      contractService.getHUBCompanionInstance.mockResolvedValue(hubCompanionInstanceMock);
      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
      mockedEncondeFunctionData.mockReturnValue('0xterminatedata');
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
          positionId: 1n,
        }),
        createPositionMock({
          positionId: 2n,
        }),
        createPositionMock({
          positionId: 3n,
        }),
      ]);

      expect(mockedEncondeFunctionData).toHaveBeenCalledTimes(3);
      expect(mockedEncondeFunctionData).toHaveBeenCalledWith({
        ...hubCompanionInstanceMock,
        functionName: 'terminate',
        args: ['0xhubAddress', 1n, '0xmyaccount', '0xmyaccount'],
      });
      expect(mockedEncondeFunctionData).toHaveBeenCalledWith({
        ...hubCompanionInstanceMock,
        functionName: 'terminate',
        args: ['0xhubAddress', 2n, '0xmyaccount', '0xmyaccount'],
      });
      expect(mockedEncondeFunctionData).toHaveBeenCalledWith({
        ...hubCompanionInstanceMock,
        functionName: 'terminate',
        args: ['0xhubAddress', 3n, '0xmyaccount', '0xmyaccount'],
      });

      // @ts-expect-error viem shit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(hubCompanionInstanceMock.write.multicall).toHaveBeenCalledTimes(1);
      // @ts-expect-error viem shit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(hubCompanionInstanceMock.write.multicall).toHaveBeenCalledWith(
        [['0xterminatedata', '0xterminatedata', '0xterminatedata']],
        { account: '0xmyaccount', chain: null }
      );
      expect(result).toEqual({
        hash: '0xhash',
        from: '0xmyaccount',
        chainId: 10,
      });
    });
  });

  describe('givePermissionToMultiplePositions', () => {
    let permissionManagerInstanceMock: jest.Mocked<
      NonNullable<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>
    >;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        read: {
          hasPermissions: jest.fn().mockResolvedValue([false, false, true, true]),
        },
        write: {
          modifyMany: jest.fn().mockResolvedValue('0xhash'),
        },
      } as unknown as jest.Mocked<NonNullable<Awaited<ReturnType<ContractService['getPermissionManagerInstance']>>>>;

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
            '0xpermittedAddress'
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
            positionId: 1n,
          }),
          createPositionMock({
            positionId: 2n,
          }),
          createPositionMock({
            positionId: 3n,
          }),
        ],
        [PERMISSIONS.INCREASE],
        '0xpermittedAddress'
      );

      expect(permissionManagerInstanceMock.read.hasPermissions).toHaveBeenCalledTimes(3);
      expect(permissionManagerInstanceMock.read.hasPermissions).toHaveBeenCalledWith([
        1n,
        '0xpermittedAddress',
        [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
      ]);
      expect(permissionManagerInstanceMock.read.hasPermissions).toHaveBeenCalledWith([
        2n,
        '0xpermittedAddress',
        [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
      ]);
      expect(permissionManagerInstanceMock.read.hasPermissions).toHaveBeenCalledWith([
        3n,
        '0xpermittedAddress',
        [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
      ]);

      // @ts-expect-error viem shit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(permissionManagerInstanceMock.write.modifyMany).toHaveBeenCalledTimes(1);
      // @ts-expect-error viem shit
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(permissionManagerInstanceMock.write.modifyMany).toHaveBeenCalledWith(
        [
          [
            {
              tokenId: 1n,
              permissionSets: [
                {
                  operator: '0xpermittedAddress',
                  permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
                },
              ],
            },
            {
              tokenId: 2n,
              permissionSets: [
                {
                  operator: '0xpermittedAddress',
                  permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
                },
              ],
            },
            {
              tokenId: 3n,
              permissionSets: [
                {
                  operator: '0xpermittedAddress',
                  permissions: [PERMISSIONS.INCREASE, PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE],
                },
              ],
            },
          ],
        ],
        { account: '0xmyaccount', chain: null }
      );
      expect(result).toEqual({
        hash: '0xhash',
        from: '0xmyaccount',
      });
    });
  });

  describe('buildModifyRateAndSwapsParams', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
    });

    describe('when the from isnt protocol or wrapped token and useWrappedProtocolToken was passed', () => {
      test('it should throw an error', () => {
        try {
          positionService.buildModifyRateAndSwapsParams(
            createPositionMock({
              positionId: 1n,
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
              positionId: 1n,
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
            positionId: 1n,
            from: toToken({ address: 'from' }),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
          }),
          '20',
          '10',
          false
        );

        expect(result).toEqual({
          id: 1n,
          amount: parseUnits('150', 18),
          swaps: 10n,
          version: PositionVersions.POSITION_VERSION_4,
          account: '0xmyaccount',
          isIncrease: true,
          companionAddress: '0xcompanionAddress',
          tokenFrom: 'from',
        });
      });
    });
    describe('when its decrease', () => {
      test('it should build the parameters for the modify', () => {
        const result = positionService.buildModifyRateAndSwapsParams(
          createPositionMock({
            positionId: 1n,
            from: toToken({ address: 'from' }),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
          }),
          '5',
          '3',
          false
        );

        expect(result).toEqual({
          id: 1n,
          amount: parseUnits('35', 18),
          swaps: 3n,
          version: PositionVersions.POSITION_VERSION_4,
          account: '0xmyaccount',
          isIncrease: false,
          companionAddress: '0xcompanionAddress',
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
        deadline: 10n,
        v: 27,
        r: '0x1',
        s: '0x1',
      });
    });

    test('it should build the signature to add the permissions for increaase', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockReturnValue({
        companionAddress: '0xcompanionAddress',
        isIncrease: true,
      });

      const result = await positionService.getModifyRateAndSwapsSignature(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '20',
        '10',
        false
      );

      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '20',
        '10',
        false
      );
      expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
      expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '0xcompanionAddress',
        PERMISSIONS.INCREASE
      );
      expect(result).toEqual({
        permissions: [{ operator: 'companion', permissions: [PERMISSIONS.WITHDRAW] }],
        deadline: '10',
        v: 27,
        r: '0x1',
        s: '0x1',
        tokenId: 1n,
      });
    });

    test('it should build the signature to add the permissions for reduce', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockReturnValue({
        companionAddress: '0xcompanionAddress',
        isIncrease: false,
      });

      const result = await positionService.getModifyRateAndSwapsSignature(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '5',
        '3',
        false
      );

      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '5',
        '3',
        false
      );
      expect(positionService.getSignatureForPermission).toHaveBeenCalledTimes(1);
      expect(positionService.getSignatureForPermission).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        }),
        '0xcompanionAddress',
        PERMISSIONS.REDUCE
      );
      expect(result).toEqual({
        permissions: [{ operator: 'companion', permissions: [PERMISSIONS.WITHDRAW] }],
        deadline: '10',
        v: 27,
        r: '0x1',
        s: '0x1',
        tokenId: 1n,
      });
    });
  });

  describe('buildModifyRateAndSwapsTx', () => {
    let position: Position;

    let newRateUnderlying: string;
    let newSwaps: string;

    beforeEach(() => {
      sdkService.buildIncreasePositionTx.mockResolvedValue({
        to: '0xcompanion',
        data: '0xdata',
      } as unknown as Awaited<ReturnType<SdkService['buildIncreasePositionTx']>>);

      contractService.getHUBAddress.mockReturnValue('0xhubAddress');
    });

    describe('when its increasing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '20';
        newSwaps = '10';

        contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
        sdkService.buildIncreasePositionTx.mockResolvedValue({
          to: '0xcompanion',
          data: '0xmeanapi-increase-data',
        } as unknown as Awaited<ReturnType<SdkService['buildIncreasePositionTx']>>);

        positionService.getModifyRateAndSwapsSignature = jest.fn().mockResolvedValue({
          permissions: [{ operator: '0xcompanionAddress', permissions: [PERMISSIONS.INCREASE] }],
          deadline: 10n,
          v: 27,
          r: '0x1',
          s: '0x1',
          tokenId: 'position-1',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 1n,
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: undefined,
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-increase-data',
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: {
              permissions: [{ operator: '0xcompanionAddress', permissions: [DCAPermission.INCREASE] }],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: 'position-1',
            },
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-increase-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 1n,
            from: getProtocolToken(10),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: undefined,
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-increase-data',
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: {
              permissions: [{ operator: '0xcompanionAddress', permissions: [DCAPermission.INCREASE] }],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: 'position-1',
            },
            increase: { token: params.tokenFrom, amount: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-increase-data',
          });
        });
      });

      test('it should populate the transaction from the hub', async () => {
        position = createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        });

        params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(sdkService.buildReduceToBuyPositionTx).not.toHaveBeenCalled();

        expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildIncreasePositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 1n,
          dcaHub: '0xhubAddress',
          amountOfSwaps: Number(params.swaps),
          permissionPermit: undefined,
          increase: { token: params.tokenFrom, amount: params.amount.toString() },
        });
        expect(result).toEqual({
          data: '0xmeanapi-increase-data',
          to: '0xcompanion',
        });
      });
    });

    describe('when its reducing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '5';
        newSwaps = '3';

        contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
        sdkService.buildReduceToBuyPositionTx.mockResolvedValue({
          to: '0xcompanion',
          data: '0xmeanapi-reduce-data',
        } as unknown as Awaited<ReturnType<SdkService['buildReducePositionTx']>>);
        positionService.getModifyRateAndSwapsSignature = jest.fn().mockResolvedValue({
          permissions: [{ operator: '0xcompanionAddress', permissions: [PERMISSIONS.REDUCE] }],
          deadline: 10n,
          v: 27,
          r: '0x1',
          s: '0x1',
          tokenId: 'position-1',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 1n,
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: undefined,
            recipient: '0xmyaccount',
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-reduce-data',
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: {
              permissions: [{ operator: '0xcompanionAddress', permissions: [DCAPermission.REDUCE] }],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: 'position-1',
            },
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-reduce-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(() => {
          position = createPositionMock({
            positionId: 1n,
            from: getProtocolToken(10),
            rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
            remainingSwaps: 5n,
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: undefined,
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-reduce-data',
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
            positionId: 1n,
            dcaHub: '0xhubAddress',
            recipient: '0xmyaccount',
            amountOfSwaps: Number(params.swaps),
            permissionPermit: {
              permissions: [{ operator: '0xcompanionAddress', permissions: [DCAPermission.REDUCE] }],
              deadline: 10n,
              v: 27,
              r: '0x1',
              s: '0x1',
              tokenId: 'position-1',
            },
            reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
          });

          expect(result).toEqual({
            to: '0xcompanion',
            data: '0xmeanapi-reduce-data',
          });
        });
      });

      test('it should populate the transaction from the hub', async () => {
        position = createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from' }),
          rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
          remainingSwaps: 5n,
        });

        params = positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(sdkService.buildIncreasePositionTx).not.toHaveBeenCalled();

        expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledTimes(1);
        expect(sdkService.buildReduceToBuyPositionTx).toHaveBeenCalledWith({
          chainId: 10,
          positionId: 1n,
          dcaHub: '0xhubAddress',
          recipient: '0xmyaccount',
          amountOfSwaps: Number(params.swaps),
          permissionPermit: undefined,
          reduce: { convertTo: params.tokenFrom, amountToBuy: params.amount.toString() },
        });

        expect(result).toEqual({
          data: '0xmeanapi-reduce-data',
          to: '0xcompanion',
        });
      });
    });
  });

  describe('approveAndModifyRateAndSwapsSafe', () => {
    beforeEach(() => {
      contractService.getHUBCompanionAddress.mockReturnValue('0xcompanionAddress');
      positionService.buildModifyRateAndSwapsParams = jest
        .fn()
        .mockReturnValue({ amount: 10n, tokenFrom: 'tokenfrom', isIncrease: true });
      walletService.buildApproveSpecificTokenTx.mockResolvedValue({
        to: '0xcompanion',
        from: '0xaccount',
        data: '0xapprove-data',
      } as unknown as Awaited<ReturnType<WalletService['buildApproveSpecificTokenTx']>>);
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
          positionId: 1n,
          from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
        }),
        '10',
        '5',
        false
      );
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsParams).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
          from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
        }),
        '10',
        '5',
        false
      );
      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledTimes(1);
      expect(walletService.buildApproveSpecificTokenTx).toHaveBeenCalledWith(
        '0xmyaccount',
        toToken({ address: 'tokenfrom' }),
        'companion',
        10n
      );
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
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
        hash: '0xhash',
        from: '0xaccount',
        chainId: 10,
      });
    });
    test('it should get the tx from buildModifyRateAndSwapsTx and submit it', async () => {
      const result = await positionService.modifyRateAndSwaps(
        createPositionMock({
          positionId: 1n,
        }),
        '10',
        '5',
        false
      );

      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildModifyRateAndSwapsTx).toHaveBeenCalledWith(
        createPositionMock({
          positionId: 1n,
        }),
        '10',
        '5',
        false,
        true,
        undefined
      );

      expect(result).toEqual({
        hash: '0xhash',
        from: '0xaccount',
        chainId: 10,
      });
    });
  });

  describe('setPendingTransaction', () => {
    beforeEach(() => {
      positionService.currentPositions = {
        'position-1': createPositionMock({}),
      };

      providerService.getNetwork.mockResolvedValue({ chainId: 10 } as NetworkStruct);
    });

    [
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.claimCampaign },
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
            to: toToken({ address: 'newtotoken' }),
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
            yields: {
              from: {
                apy: 0.03,
                name: YieldName.aave,
                token: emptyTokenWithAddress('AAVE'),
                tokenAddress: '0xFromAave',
              },
              to: {
                apy: 0.09,
                name: YieldName.aave,
                token: emptyTokenWithAddress('AAVE'),
                tokenAddress: '0xToAave',
              },
            },
          },
        };
        positionService.setPendingTransaction({
          chainId: 10,
          hash: 'hash',
          from: '0xmyaccount',
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
              ...toToken({ address: 'newtotoken' }),
              underlyingTokens: [emptyTokenWithAddress('toYield')],
            },
            pairId: `${getWrappedProtocolToken(10).address}-newtotoken`,
            user: '0xmyaccount',
            // @ts-expect-error we expect this
            positionId: 'pending-transaction-hash',
            chainId: 10,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swapInterval: ONE_DAY,
            swapped: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            rate: { amount: parseUnits('10', 18) / 5n, amountInUnits: '2', amountInUSD: '0' },
            permissions: [],
            remainingLiquidity: { amount: parseUnits('10', 18), amountInUnits: '10', amountInUSD: '0' },
            remainingSwaps: 5n,
            totalSwaps: 5n,
            totalExecutedSwaps: 0n,
            id: 'pending-transaction-hash',
            startedAt: 1686329816,
            pendingTransaction: 'hash',
            status: 'ACTIVE',
            version: LATEST_VERSION,
            nextSwapAvailableAt: 1686329816,
            isStale: false,
            toWithdrawYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            swappedYield: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            yields: {
              from: {
                apy: 0.03,
                name: YieldName.aave,
                token: emptyTokenWithAddress('AAVE'),
                tokenAddress: '0xFromAave',
              },
              to: {
                apy: 0.09,
                name: YieldName.aave,
                token: emptyTokenWithAddress('AAVE'),
                tokenAddress: '0xToAave',
              },
            },
          } satisfies Position,
        });
      });
    });

    test('it should add the position from the transaction if it doesnt exist', () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      positionService.setPendingTransaction({
        hash: 'hash',
        type: TransactionTypes.withdrawFunds,
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
        type: TransactionTypes.withdrawFunds,
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
      { type: TransactionTypes.approveToken },
      { type: TransactionTypes.approveTokenExact },
      { type: TransactionTypes.swap },
      { type: TransactionTypes.claimCampaign },
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
          to: toToken({ address: 'newtotoken' }),
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
          yields: {},
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
    beforeEach(() => {
      accountService.getWallets.mockReturnValue([
        {
          address: '0xwallet-1',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
        },
        {
          address: '0xwallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
          isOwner: true,
        },
      ]);
    });

    describe('Transactions that should be skipped', () => {
      [
        { type: TransactionTypes.approveToken },
        { type: TransactionTypes.approveTokenExact },
        { type: TransactionTypes.swap },
        { type: TransactionTypes.claimCampaign },
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
            [`10-4-v${LATEST_VERSION}`]: createPositionMock({
              id: `10-4-v${LATEST_VERSION}`,
              positionId: 4n,
              remainingLiquidity: { amount: parseUnits('20', 18), amountInUnits: '20', amountInUSD: '0' },
              remainingSwaps: 10n,
              swapped: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              totalExecutedSwaps: 0n,
              totalSwaps: 10n,
              nextSwapAvailableAt: 1686329816,
            }),
            ['pending-transaction-undefined-v4']: undefined,
          },
          basePositions: {},
          transaction: {
            from: '0xmyaccount',
            type: TransactionTypes.newPosition,
            chainId: 10,
            typeData: createPositionTypeDataMock({
              id: 4n,
              fromYield: undefined,
              toYield: undefined,
            }),
          },
        },
        {
          expectedPositionChanges: {
            [`withdraw-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-position-v${LATEST_VERSION}`,
              swapped: { amount: 20n, amountInUnits: '20' },
              toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            }),
          },
          basePositions: {
            [`withdraw-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-position-v${LATEST_VERSION}`,
              swapped: { amount: 20n, amountInUnits: '20' },
              toWithdraw: { amount: 10n, amountInUnits: '10' },
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
              rate: { amount: parseUnits('20', 18), amountInUnits: '20', amountInUSD: '0' },
              totalSwaps: 25n,
              remainingSwaps: 15n,
              remainingLiquidity: { amount: parseUnits('300', 18), amountInUnits: '300', amountInUSD: '0' },
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
              totalSwaps: 20n,
              remainingSwaps: 10n,
              remainingLiquidity: { amount: parseUnits('100', 18), amountInUnits: '100' },
            }),
          },
          transaction: {
            type: TransactionTypes.modifyRateAndSwapsPosition,
            typeData: {
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              newSwaps: '15',
              newRate: parseUnits('20', 18),
              decimals: 18,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              rate: { amount: parseUnits('4', 18), amountInUnits: '4', amountInUSD: '0' },
              totalSwaps: 15n,
              remainingSwaps: 5n,
              remainingLiquidity: { amount: parseUnits('20', 18), amountInUnits: '20', amountInUSD: '0' },
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
              totalSwaps: 20n,
              remainingSwaps: 10n,
              remainingLiquidity: { amount: parseUnits('100', 18), amountInUnits: '100', amountInUSD: '0' },
            }),
          },
          transaction: {
            type: TransactionTypes.modifyRateAndSwapsPosition,
            typeData: {
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              newSwaps: '5',
              newRate: parseUnits('4', 18),
              decimals: 18,
            },
          },
        },
        {
          expectedPositionChanges: {
            [`withdraw-funds-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-funds-position-v${LATEST_VERSION}`,
              rate: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              totalSwaps: 10n,
              remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              remainingSwaps: 0n,
            }),
          },
          basePositions: {
            [`withdraw-funds-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-funds-position-v${LATEST_VERSION}`,
              rate: { amount: parseUnits('10', 18), amountInUnits: '10' },
              totalSwaps: 20n,
              remainingSwaps: 10n,
              remainingLiquidity: { amount: parseUnits('100', 18), amountInUnits: '100' },
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
              user: '0xwallet-1',
            }),
          },
          transaction: {
            type: TransactionTypes.transferPosition,
            typeData: {
              id: `transfer-position-v${LATEST_VERSION}`,
              toAddress: '0xUnknown',
            },
          },
        },
        {
          expectedPositionChanges: {
            [`transfer-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `transfer-position-v${LATEST_VERSION}`,
              user: '0xwallet-2',
              permissions: [],
            }),
          },
          basePositions: {
            [`transfer-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `transfer-position-v${LATEST_VERSION}`,
              user: '0xwallet-1',
              permissions: [
                {
                  id: 'operator-id',
                  operator: 'new operator',
                  permissions: [DCAPermission.INCREASE],
                },
              ],
            }),
          },
          transaction: {
            type: TransactionTypes.transferPosition,
            typeData: {
              id: `transfer-position-v${LATEST_VERSION}`,
              toAddress: '0xwallet-2',
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
              toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
              remainingSwaps: 0n,
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
