import {
  HubContract,
  NewPositionTypeData,
  PermissionData,
  Position,
  PositionVersions,
  PositionsGraphqlResponse,
  Token,
  TransactionDetails,
  TransactionTypes,
} from '@types';
import { createMockInstance } from '@common/utils/tests';
import isUndefined from 'lodash/isUndefined';
// import gqlFetchAll from '@common/utils/gqlFetchAll';
import {
  HUB_ADDRESS,
  LATEST_VERSION,
  MAX_UINT_32,
  NETWORKS_FOR_MENU,
  ONE_DAY,
  PERMISSIONS,
  POSITIONS_VERSIONS,
  SIGN_VERSION,
} from '@constants';
import { emptyTokenWithAddress, toToken } from '@common/utils/currency';
import { BigNumber, VoidSigner, ethers } from 'ethers';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { parseUnits } from '@ethersproject/units';
import gqlFetchAll, { GraphqlResults } from '@common/utils/gqlFetchAll';
import GET_POSITIONS from '@graphql/getPositions.graphql';
import { DCAPermissionsManager } from '@mean-finance/dca-v2-core/dist';
import { fromRpcSig } from 'ethereumjs-util';
import PERMISSION_MANAGER_ABI from '@abis/PermissionsManager.json';
import { TransactionResponse } from '@ethersproject/providers';
import { DCAHubCompanion } from '@mean-finance/dca-v2-periphery/dist';

import ProviderService from './providerService';
import WalletService from './walletService';
import ContractService from './contractService';
import MeanApiService from './meanApiService';
import SafeService from './safeService';
import PairService from './pairService';
import GraphqlService from './graphql';
import PositionService from './positionService';

jest.mock('./providerService');
jest.mock('./walletService');
jest.mock('./contractService');
jest.mock('./meanApiService');
jest.mock('./safeService');
jest.mock('./pairService');
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
const MockedGqlFetchAll = jest.mocked(gqlFetchAll, { shallow: true });
const MockedFromRpcSig = jest.mocked(fromRpcSig, { shallow: true });

const createGqlMock = () =>
  POSITIONS_VERSIONS.reduce<Record<PositionVersions, Record<number, GraphqlService>>>(
    (acc, version) => ({
      ...acc,
      [version]: NETWORKS_FOR_MENU.reduce(
        (networkAcc, network) => ({
          ...networkAcc,
          [network]: {
            getClient: () => `gqlclient-${version}-${network}`,
          },
        }),
        {}
      ),
    }),
    {
      [PositionVersions.POSITION_VERSION_1]: {},
      [PositionVersions.POSITION_VERSION_2]: {},
      [PositionVersions.POSITION_VERSION_3]: {},
      [PositionVersions.POSITION_VERSION_4]: {},
    }
  );

function createPositionMock({
  from,
  to,
  user,
  swapInterval,
  swapped,
  remainingLiquidity,
  remainingSwaps,
  totalDeposited,
  withdrawn,
  totalSwaps,
  rate,
  toWithdraw,
  totalExecutedSwaps,
  depositedRateUnderlying,
  totalSwappedUnderlyingAccum,
  toWithdrawUnderlyingAccum,
  id,
  positionId,
  status,
  startedAt,
  pendingTransaction,
  version,
  chainId,
  pairLastSwappedAt,
  pairNextSwapAvailableAt,
  toWithdrawUnderlying,
  remainingLiquidityUnderlying,
  permissions,
}: {
  from?: Token;
  to?: Token;
  user?: string;
  swapInterval?: BigNumber;
  swapped?: BigNumber;
  remainingLiquidity?: BigNumber;
  remainingSwaps?: BigNumber;
  totalDeposited?: BigNumber;
  withdrawn?: BigNumber;
  totalSwaps?: BigNumber;
  rate?: BigNumber;
  toWithdraw?: BigNumber;
  totalExecutedSwaps?: BigNumber;
  depositedRateUnderlying?: Nullable<BigNumber>;
  totalSwappedUnderlyingAccum?: Nullable<BigNumber>;
  toWithdrawUnderlyingAccum?: Nullable<BigNumber>;
  id?: string;
  positionId?: string;
  status?: string;
  startedAt?: number;
  pendingTransaction?: string;
  version?: PositionVersions;
  chainId?: number;
  pairLastSwappedAt?: number;
  pairNextSwapAvailableAt?: string;
  toWithdrawUnderlying?: Nullable<BigNumber>;
  remainingLiquidityUnderlying?: Nullable<BigNumber>;
  permissions?: PermissionData[];
}): Position {
  return {
    from: (!isUndefined(from) && from) || toToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toToken({ address: 'to' }),
    user: (!isUndefined(user) && user) || 'my account',
    swapInterval: (!isUndefined(swapInterval) && swapInterval) || ONE_DAY,
    swapped: (!isUndefined(swapped) && swapped) || parseUnits('10', 18),
    remainingLiquidity: (!isUndefined(remainingLiquidity) && remainingLiquidity) || parseUnits('10', 18),
    remainingSwaps: (!isUndefined(remainingSwaps) && remainingSwaps) || parseUnits('5', 18),
    totalDeposited: (!isUndefined(totalDeposited) && totalDeposited) || parseUnits('20', 18),
    withdrawn: (!isUndefined(withdrawn) && withdrawn) || parseUnits('5', 18),
    totalSwaps: (!isUndefined(totalSwaps) && totalSwaps) || parseUnits('10', 18),
    rate: (!isUndefined(rate) && rate) || parseUnits('2', 18),
    toWithdraw: (!isUndefined(toWithdraw) && toWithdraw) || parseUnits('5', 18),
    totalExecutedSwaps: (!isUndefined(totalExecutedSwaps) && totalExecutedSwaps) || BigNumber.from(5),
    depositedRateUnderlying: (!isUndefined(depositedRateUnderlying) && depositedRateUnderlying) || null,
    totalSwappedUnderlyingAccum: (!isUndefined(totalSwappedUnderlyingAccum) && totalSwappedUnderlyingAccum) || null,
    toWithdrawUnderlyingAccum: (!isUndefined(toWithdrawUnderlyingAccum) && toWithdrawUnderlyingAccum) || null,
    id: (!isUndefined(id) && id) || 'position-1',
    positionId: (!isUndefined(positionId) && positionId) || '1',
    status: (!isUndefined(status) && status) || 'ACTIVE',
    startedAt: (!isUndefined(startedAt) && startedAt) || 1686329816,
    pendingTransaction: (!isUndefined(pendingTransaction) && pendingTransaction) || '',
    version: (!isUndefined(version) && version) || PositionVersions.POSITION_VERSION_4,
    chainId: (!isUndefined(chainId) && chainId) || 10,
    pairLastSwappedAt: (!isUndefined(pairLastSwappedAt) && pairLastSwappedAt) || 1686329816,
    pairNextSwapAvailableAt: (!isUndefined(pairNextSwapAvailableAt) && pairNextSwapAvailableAt) || '1686427016',
    toWithdrawUnderlying: (!isUndefined(toWithdrawUnderlying) && toWithdrawUnderlying) || null,
    remainingLiquidityUnderlying: (!isUndefined(remainingLiquidityUnderlying) && remainingLiquidityUnderlying) || null,
    permissions: (!isUndefined(permissions) && permissions) || [],
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

function createGqlPositionMock({
  id,
  from,
  to,
  user,
  pair,
  status,
  totalExecutedSwaps,
  swapInterval,
  remainingSwaps,
  swapped,
  withdrawn,
  remainingLiquidity,
  toWithdraw,
  depositedRateUnderlying,
  totalSwappedUnderlyingAccum,
  toWithdrawUnderlyingAccum,
  rate,
  totalDeposited,
  totalSwaps,
  totalSwapped,
  totalWithdrawn,
  createdAtTimestamp,
  permissions,
}: {
  id?: string;
  from?: Token;
  to?: Token;
  user?: string;
  pair?: {
    id: string;
    activePositionsPerInterval: number[];
    swaps: {
      id: string;
      executedAtTimestamp: string;
    }[];
  };
  status?: string;
  totalExecutedSwaps?: BigNumber;
  swapInterval?: {
    id: string;
    interval: BigNumber;
    description: BigNumber;
  };
  remainingSwaps?: BigNumber;
  swapped?: BigNumber;
  withdrawn?: BigNumber;
  remainingLiquidity?: BigNumber;
  toWithdraw?: BigNumber;
  depositedRateUnderlying?: Nullable<BigNumber>;
  totalSwappedUnderlyingAccum?: Nullable<BigNumber>;
  toWithdrawUnderlyingAccum?: Nullable<BigNumber>;
  rate?: BigNumber;
  totalDeposited?: BigNumber;
  totalSwaps?: BigNumber;
  totalSwapped?: BigNumber;
  totalWithdrawn?: BigNumber;
  createdAtTimestamp?: number;
  permissions?: PermissionData[];
}) {
  return {
    from: (!isUndefined(from) && from) || toToken({ address: 'from' }),
    to: (!isUndefined(to) && to) || toToken({ address: 'to' }),
    user: (!isUndefined(user) && user) || 'my account',
    swapInterval: (!isUndefined(swapInterval) && swapInterval) || {
      id: 'interval',
      interval: ONE_DAY,
      description: ONE_DAY,
    },
    totalSwapped: (!isUndefined(totalSwapped) && totalSwapped) || parseUnits('15', 18),
    swapped: (!isUndefined(swapped) && swapped) || parseUnits('10', 18),
    remainingLiquidity: (!isUndefined(remainingLiquidity) && remainingLiquidity) || parseUnits('10', 18),
    remainingSwaps: (!isUndefined(remainingSwaps) && remainingSwaps) || parseUnits('5', 18),
    totalDeposited: (!isUndefined(totalDeposited) && totalDeposited) || parseUnits('20', 18),
    totalWithdrawn: (!isUndefined(totalWithdrawn) && totalWithdrawn) || parseUnits('7', 18),
    withdrawn: (!isUndefined(withdrawn) && withdrawn) || parseUnits('5', 18),
    totalSwaps: (!isUndefined(totalSwaps) && totalSwaps) || parseUnits('10', 18),
    rate: (!isUndefined(rate) && rate) || parseUnits('2', 18),
    toWithdraw: (!isUndefined(toWithdraw) && toWithdraw) || parseUnits('5', 18),
    totalExecutedSwaps: (!isUndefined(totalExecutedSwaps) && totalExecutedSwaps) || BigNumber.from(5),
    depositedRateUnderlying: (!isUndefined(depositedRateUnderlying) && depositedRateUnderlying) || null,
    totalSwappedUnderlyingAccum: (!isUndefined(totalSwappedUnderlyingAccum) && totalSwappedUnderlyingAccum) || null,
    toWithdrawUnderlyingAccum: (!isUndefined(toWithdrawUnderlyingAccum) && toWithdrawUnderlyingAccum) || null,
    id: (!isUndefined(id) && id) || 'position-1',
    status: (!isUndefined(status) && status) || 'ACTIVE',
    createdAtTimestamp: (!isUndefined(createdAtTimestamp) && createdAtTimestamp) || 1686329816,
    permissions: (!isUndefined(permissions) && permissions) || [],
    pair: (!isUndefined(pair) && pair) || {
      id: 'pair',
      activePositionsPerInterval: [1, 2, 3, 4, 5, 6, 7, 8],
      swaps: [
        {
          id: 'swap-1',
          executedAtTimestamp: 10,
        },
      ],
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
  let positionService: PositionService;

  beforeEach(() => {
    providerService = createMockInstance(MockedProviderService);
    walletService = createMockInstance(MockedWalletService);
    contractService = createMockInstance(MockedContractService);
    meanApiService = createMockInstance(MockedMeanApiService);
    safeService = createMockInstance(MockedSafeService);
    pairService = createMockInstance(MockedPairService);

    walletService.getAccount.mockReturnValue('my account');
    providerService.getNetwork.mockResolvedValue({ chainId: 10, defaultProvider: true });
    positionService = new PositionService(
      walletService,
      pairService,
      contractService,
      meanApiService,
      safeService,
      createGqlMock(),
      providerService
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
      MockedGqlFetchAll.mockImplementation((client) => {
        if ((client as unknown as string) !== `gqlclient-${PositionVersions.POSITION_VERSION_4}-10`) {
          return Promise.resolve({
            error: undefined,
            data: {
              positions: [],
            },
            loading: false,
          } as GraphqlResults<PositionsGraphqlResponse>);
        }

        return Promise.resolve({
          error: undefined,
          data: {
            positions: [
              createGqlPositionMock({
                id: 'position-1',
                from: toToken({
                  address: 'fromYield',
                  underlyingTokens: [emptyTokenWithAddress('from')],
                }),
                to: toToken({
                  address: 'toYield',
                  underlyingTokens: [emptyTokenWithAddress('to')],
                }),
                toWithdraw: BigNumber.from(10),
                rate: BigNumber.from(20),
                remainingSwaps: BigNumber.from(5),
                toWithdrawUnderlyingAccum: BigNumber.from(11),
                totalSwappedUnderlyingAccum: BigNumber.from(12),
                depositedRateUnderlying: BigNumber.from(21),
              }),
              createGqlPositionMock({
                id: 'position-2',
                from: toToken({
                  address: 'fromYield',
                  underlyingTokens: [emptyTokenWithAddress('from')],
                }),
                to: toToken({
                  address: 'toYield',
                  underlyingTokens: [emptyTokenWithAddress('to')],
                }),
                toWithdraw: BigNumber.from(15),
                rate: BigNumber.from(25),
                remainingSwaps: BigNumber.from(5),
                toWithdrawUnderlyingAccum: BigNumber.from(16),
                totalSwappedUnderlyingAccum: BigNumber.from(12),
                depositedRateUnderlying: BigNumber.from(26),
              }),
              createGqlPositionMock({
                id: 'position-3',
                from: toToken({
                  address: 'anotherFromYield',
                  underlyingTokens: [emptyTokenWithAddress('anotherFrom')],
                }),
                to: toToken({
                  address: 'anotherToYield',
                  underlyingTokens: [emptyTokenWithAddress('anotherTo')],
                }),
                toWithdraw: BigNumber.from(20),
                rate: BigNumber.from(30),
                remainingSwaps: BigNumber.from(5),
                toWithdrawUnderlyingAccum: BigNumber.from(21),
                totalSwappedUnderlyingAccum: BigNumber.from(12),
                depositedRateUnderlying: BigNumber.from(31),
              }),
            ],
          },
          loading: false,
        } as GraphqlResults<PositionsGraphqlResponse>);
      });

      meanApiService.getUnderlyingTokens.mockResolvedValue({
        '10-fromYield-100': {
          underlying: BigNumber.from(110).toString(),
          underlyingAmount: BigNumber.from(110).toString(),
        },
        '10-toYield-10': {
          underlying: BigNumber.from(20).toString(),
          underlyingAmount: BigNumber.from(20).toString(),
        },
        '10-fromYield-125': {
          underlying: BigNumber.from(135).toString(),
          underlyingAmount: BigNumber.from(135).toString(),
        },
        '10-toYield-15': {
          underlying: BigNumber.from(25).toString(),
          underlyingAmount: BigNumber.from(25).toString(),
        },
        '10-anotherFromYield-150': {
          underlying: BigNumber.from(160).toString(),
          underlyingAmount: BigNumber.from(160).toString(),
        },
        '10-anotherToYield-20': {
          underlying: BigNumber.from(30).toString(),
          underlyingAmount: BigNumber.from(30).toString(),
        },
      });
    });
    test('it should do nothing if the account is not connected', async () => {
      walletService.getAccount.mockReturnValueOnce('');

      await positionService.fetchCurrentPositions();

      expect(positionService.currentPositions).toEqual({});
      expect(positionService.hasFetchedCurrentPositions).toEqual(true);
    });
    test('it should fetch positions from all chains and all versions', async () => {
      await positionService.fetchCurrentPositions();

      POSITIONS_VERSIONS.forEach((version) =>
        NETWORKS_FOR_MENU.forEach((network) => {
          expect(MockedGqlFetchAll).toHaveBeenCalledWith(
            `gqlclient-${version}-${network}`,
            GET_POSITIONS,
            {
              address: 'my account',
              status: ['ACTIVE', 'COMPLETED'],
            },
            'positions',
            'network-only'
          );
        })
      );
    });

    test('it fetch the underlying balances of each of the tokens that are wrapped', async () => {
      await positionService.fetchCurrentPositions();

      expect(meanApiService.getUnderlyingTokens).toHaveBeenCalledTimes(1);
      expect(meanApiService.getUnderlyingTokens).toHaveBeenCalledWith([
        {
          token: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          amount: BigNumber.from(100),
        },
        {
          token: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          amount: BigNumber.from(10),
        },
        {
          token: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          amount: BigNumber.from(125),
        },
        {
          token: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          amount: BigNumber.from(15),
        },
        {
          token: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherFromYield',
                underlyingTokens: [emptyTokenWithAddress('anotherFrom')],
              }),
            ],
          }),
          amount: BigNumber.from(150),
        },
        {
          token: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherToYield',
                underlyingTokens: [emptyTokenWithAddress('anotherTo')],
              }),
            ],
          }),
          amount: BigNumber.from(20),
        },
      ]);
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchCurrentPositions();

      expect(positionService.currentPositions).toEqual({
        [`position-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          positionId: 'position-1',
          id: `position-1-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(10),
          rate: BigNumber.from(20),
          remainingSwaps: BigNumber.from(5),
          withdrawn: parseUnits('7', 18),
          toWithdrawUnderlyingAccum: BigNumber.from(11),
          totalSwappedUnderlyingAccum: BigNumber.from(12),
          depositedRateUnderlying: BigNumber.from(21),
          remainingLiquidityUnderlying: BigNumber.from(110),
          toWithdrawUnderlying: BigNumber.from(20),
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
        [`position-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          positionId: 'position-2',
          id: `position-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(15),
          rate: BigNumber.from(25),
          remainingSwaps: BigNumber.from(5),
          withdrawn: parseUnits('7', 18),
          toWithdrawUnderlyingAccum: BigNumber.from(16),
          totalSwappedUnderlyingAccum: BigNumber.from(12),
          depositedRateUnderlying: BigNumber.from(26),
          remainingLiquidityUnderlying: BigNumber.from(135),
          toWithdrawUnderlying: BigNumber.from(25),
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
        [`position-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherFromYield',
                underlyingTokens: [emptyTokenWithAddress('anotherFrom')],
              }),
            ],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherToYield',
                underlyingTokens: [emptyTokenWithAddress('anotherTo')],
              }),
            ],
          }),
          positionId: 'position-3',
          id: `position-3-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(20),
          rate: BigNumber.from(30),
          withdrawn: parseUnits('7', 18),
          remainingSwaps: BigNumber.from(5),
          toWithdrawUnderlyingAccum: BigNumber.from(21),
          totalSwappedUnderlyingAccum: BigNumber.from(12),
          depositedRateUnderlying: BigNumber.from(31),
          remainingLiquidityUnderlying: BigNumber.from(160),
          toWithdrawUnderlying: BigNumber.from(30),
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
      });
    });
  });

  describe('fetchPastPositions', () => {
    beforeEach(() => {
      MockedGqlFetchAll.mockImplementation((client) => {
        if ((client as unknown as string) !== `gqlclient-${PositionVersions.POSITION_VERSION_4}-10`) {
          return Promise.resolve({
            error: undefined,
            data: {
              positions: [],
            },
            loading: false,
          } as GraphqlResults<PositionsGraphqlResponse>);
        }

        return Promise.resolve({
          error: undefined,
          data: {
            positions: [
              createGqlPositionMock({
                id: 'position-1',
                from: toToken({
                  address: 'fromYield',
                  underlyingTokens: [emptyTokenWithAddress('from')],
                }),
                to: toToken({
                  address: 'toYield',
                  underlyingTokens: [emptyTokenWithAddress('to')],
                }),
                toWithdraw: BigNumber.from(0),
                rate: BigNumber.from(20),
                remainingSwaps: BigNumber.from(0),
                toWithdrawUnderlyingAccum: BigNumber.from(0),
                totalSwappedUnderlyingAccum: null,
                depositedRateUnderlying: null,
              }),
              createGqlPositionMock({
                id: 'position-2',
                from: toToken({
                  address: 'fromYield',
                  underlyingTokens: [emptyTokenWithAddress('from')],
                }),
                to: toToken({
                  address: 'toYield',
                  underlyingTokens: [emptyTokenWithAddress('to')],
                }),
                toWithdraw: BigNumber.from(0),
                rate: BigNumber.from(25),
                remainingSwaps: BigNumber.from(0),
                toWithdrawUnderlyingAccum: BigNumber.from(0),
                totalSwappedUnderlyingAccum: null,
                depositedRateUnderlying: null,
              }),
              createGqlPositionMock({
                id: 'position-3',
                from: toToken({
                  address: 'anotherFromYield',
                  underlyingTokens: [emptyTokenWithAddress('anotherFrom')],
                }),
                to: toToken({
                  address: 'anotherToYield',
                  underlyingTokens: [emptyTokenWithAddress('anotherTo')],
                }),
                toWithdraw: BigNumber.from(0),
                rate: BigNumber.from(30),
                remainingSwaps: BigNumber.from(0),
                toWithdrawUnderlyingAccum: BigNumber.from(0),
                totalSwappedUnderlyingAccum: null,
                depositedRateUnderlying: null,
              }),
            ],
          },
          loading: false,
        } as GraphqlResults<PositionsGraphqlResponse>);
      });
    });
    test('it should do nothing if the account is not connected', async () => {
      walletService.getAccount.mockReturnValueOnce('');

      await positionService.fetchPastPositions();

      expect(positionService.pastPositions).toEqual({});
      expect(positionService.hasFetchedPastPositions).toEqual(true);
    });
    test('it should fetch positions from all chains and all versions', async () => {
      await positionService.fetchPastPositions();

      POSITIONS_VERSIONS.forEach((version) =>
        NETWORKS_FOR_MENU.forEach((network) => {
          expect(MockedGqlFetchAll).toHaveBeenCalledWith(
            `gqlclient-${version}-${network}`,
            GET_POSITIONS,
            {
              address: 'my account',
              status: ['TERMINATED'],
            },
            'positions',
            'network-only'
          );
        })
      );
    });

    test('it should set the current positions of the current users', async () => {
      await positionService.fetchPastPositions();

      expect(positionService.pastPositions).toEqual({
        [`position-1-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          positionId: 'position-1',
          id: `position-1-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(0),
          rate: BigNumber.from(20),
          remainingSwaps: BigNumber.from(0),
          withdrawn: parseUnits('7', 18),
          toWithdrawUnderlyingAccum: BigNumber.from(0),
          totalSwappedUnderlyingAccum: null,
          depositedRateUnderlying: null,
          remainingLiquidityUnderlying: null,
          toWithdrawUnderlying: null,
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
        [`position-2-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'from',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'fromYield',
                underlyingTokens: [emptyTokenWithAddress('from')],
              }),
            ],
          }),
          to: toToken({
            address: 'to',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'toYield',
                underlyingTokens: [emptyTokenWithAddress('to')],
              }),
            ],
          }),
          positionId: 'position-2',
          id: `position-2-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(0),
          rate: BigNumber.from(25),
          remainingSwaps: BigNumber.from(0),
          withdrawn: parseUnits('7', 18),
          toWithdrawUnderlyingAccum: BigNumber.from(0),
          totalSwappedUnderlyingAccum: null,
          depositedRateUnderlying: null,
          remainingLiquidityUnderlying: null,
          toWithdrawUnderlying: null,
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
        [`position-3-v${PositionVersions.POSITION_VERSION_4}`]: createPositionMock({
          from: toToken({
            address: 'anotherFrom',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherFromYield',
                underlyingTokens: [emptyTokenWithAddress('anotherFrom')],
              }),
            ],
          }),
          to: toToken({
            address: 'anotherTo',
            chainId: 10,
            underlyingTokens: [
              toToken({
                address: 'anotherToYield',
                underlyingTokens: [emptyTokenWithAddress('anotherTo')],
              }),
            ],
          }),
          positionId: 'position-3',
          id: `position-3-v${PositionVersions.POSITION_VERSION_4}`,
          toWithdraw: BigNumber.from(0),
          rate: BigNumber.from(30),
          withdrawn: parseUnits('7', 18),
          remainingSwaps: BigNumber.from(0),
          toWithdrawUnderlyingAccum: BigNumber.from(0),
          totalSwappedUnderlyingAccum: null,
          depositedRateUnderlying: null,
          remainingLiquidityUnderlying: null,
          toWithdrawUnderlying: null,
          pairLastSwappedAt: 10,
          pairNextSwapAvailableAt: '1686329816',
          swapped: parseUnits('15', 18),
        }),
      });
    });
  });

  describe('getSignatureForPermission', () => {
    let mockedPermissionManagerInstance: jest.Mocked<DCAPermissionsManager>;
    let mockedSigner: jest.Mocked<VoidSigner>;
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
      } as unknown as jest.Mocked<VoidSigner>;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      MockedEthers.Contract.mockImplementation(() => mockedPermissionManagerInstance);
      providerService.getSigner.mockReturnValue(mockedSigner);
      MockedFromRpcSig.mockReturnValue({
        v: 'v',
        r: 'r',
        s: 's',
      } as never);
      contractService.getPermissionManagerAddress.mockResolvedValue('permissionManagerAddress');
    });
    describe('when an address is passed', () => {
      test('it should use the specific permission manager address for the signature', async () => {
        await positionService.getSignatureForPermission(
          createPositionMock({}),
          'contractAddress',
          PERMISSIONS.INCREASE,
          'providedPermissionManagerAddress'
        );

        expect(MockedEthers.Contract).toHaveBeenCalledTimes(1);
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
      contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');
    });
    test('it should use the latest companion to call the permission manager to get the permission', async () => {
      const result = await positionService.companionHasPermission(
        createPositionMock({ version: PositionVersions.POSITION_VERSION_3 }),
        PERMISSIONS.INCREASE
      );

      expect(contractService.getPermissionManagerInstance).toHaveBeenCalledWith(PositionVersions.POSITION_VERSION_3);
      expect(contractService.getHUBCompanionAddress).toHaveBeenCalledWith(LATEST_VERSION);

      expect(result).toEqual(false);
    });
  });

  describe('modifyPermissions', () => {
    let permissionManagerInstanceMock: jest.Mocked<DCAPermissionsManager>;
    beforeEach(() => {
      permissionManagerInstanceMock = {
        modify: jest.fn().mockResolvedValue('modify'),
      } as unknown as jest.Mocked<DCAPermissionsManager>;

      contractService.getPermissionManagerInstance.mockResolvedValue(permissionManagerInstanceMock);
    });
    test('it should call the modify of the permissionManager with the new permissions', async () => {
      const result = await positionService.modifyPermissions(createPositionMock({ positionId: 'position-1' }), [
        {
          id: 'permission',
          operator: 'operator',
          permissions: ['INCREASE', 'REDUCE', 'WITHDRAW'],
        },
      ]);

      expect(permissionManagerInstanceMock.modify).toHaveBeenCalledTimes(1);
      expect(permissionManagerInstanceMock.modify).toHaveBeenCalledWith('position-1', [
        {
          operator: 'operator',
          permissions: [PERMISSIONS.INCREASE, PERMISSIONS.REDUCE, PERMISSIONS.WITHDRAW],
        },
      ]);

      expect(result).toEqual('modify');
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
      contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');
    });
    describe('when the amount of swaps is higher than the max', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.buildDepositParams(
            toToken({ address: 'from' }),
            toToken({ address: 'to' }),
            '10',
            ONE_DAY,
            '4294967296',
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
      test('it should add the increase, reduce and terminate permissions', async () => {
        const result = await positionService.buildDepositParams(
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          'yieldFrom'
        );

        expect(result).toEqual({
          takeFrom: 'from',
          from: 'from',
          to: 'to',
          totalAmmount: parseUnits('10', 18),
          swaps: BigNumber.from(5),
          interval: ONE_DAY,
          account: 'my account',
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
      test('it should add the withdraw and terminate permissions', async () => {
        const result = await positionService.buildDepositParams(
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
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
          account: 'my account',
          permissions: [{ operator: 'companionAddress', permissions: [PERMISSIONS.WITHDRAW, PERMISSIONS.TERMINATE] }],
          yieldFrom: undefined,
          yieldTo: 'yieldTo',
        });
      });
    });

    describe('when no token has yield', () => {
      test('it should not add any permission to the position', async () => {
        const result = await positionService.buildDepositParams(
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5'
        );

        expect(result).toEqual({
          takeFrom: 'from',
          from: 'from',
          to: 'to',
          totalAmmount: parseUnits('10', 18),
          swaps: BigNumber.from(5),
          interval: ONE_DAY,
          account: 'my account',
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

      meanApiService.getDepositTx.mockResolvedValue({
        to: 'companion',
        from: 'account',
      });

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
    });

    describe('when the from has yield', () => {
      test('it should get the transaction from the mean api', async () => {
        const params = await positionService.buildDepositParams(
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          'fromYield',
          'toYield'
        );

        const result = await positionService.buildDepositTx(
          toToken({ address: 'from' }),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5',
          'fromYield',
          'toYield'
        );

        expect(meanApiService.getDepositTx).toHaveBeenCalledTimes(1);
        expect(meanApiService.getDepositTx).toHaveBeenCalledWith(
          params.takeFrom,
          params.from,
          params.to,
          params.totalAmmount,
          params.swaps,
          params.interval,
          params.account,
          params.permissions,
          params.yieldFrom,
          params.yieldTo
        );
        expect(result).toEqual({
          to: 'companion',
          from: 'account',
        });
      });
    });

    describe('when the from is the protocol token', () => {
      test('it should get the transaction from the mean api', async () => {
        const params = await positionService.buildDepositParams(
          getProtocolToken(10),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5'
        );

        const result = await positionService.buildDepositTx(
          getProtocolToken(10),
          toToken({ address: 'to' }),
          '10',
          ONE_DAY,
          '5'
        );

        expect(meanApiService.getDepositTx).toHaveBeenCalledTimes(1);
        expect(meanApiService.getDepositTx).toHaveBeenCalledWith(
          params.takeFrom,
          params.from,
          params.to,
          params.totalAmmount,
          params.swaps,
          params.interval,
          params.account,
          params.permissions,
          params.yieldFrom,
          params.yieldTo
        );
        expect(result).toEqual({
          to: 'companion',
          from: 'account',
        });
      });
    });

    test('it should populate the transaction from the hub when the to is protocol', async () => {
      const params = await positionService.buildDepositParams(
        toToken({ address: 'from' }),
        getProtocolToken(10),
        '10',
        ONE_DAY,
        '5'
      );

      const result = await positionService.buildDepositTx(
        toToken({ address: 'from' }),
        getProtocolToken(10),
        '10',
        ONE_DAY,
        '5'
      );

      expect(meanApiService.getDepositTx).not.toHaveBeenCalled();
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledTimes(1);
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledWith(
        'from',
        getWrappedProtocolToken(10).address,
        params.totalAmmount,
        params.swaps,
        params.interval,
        params.account,
        params.permissions
      );
      expect(result).toEqual({
        to: 'hub',
        from: 'account',
      });
    });

    test('it should populate the transaction from the hub when the to has yield', async () => {
      const params = await positionService.buildDepositParams(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        undefined,
        'toYield'
      );

      const result = await positionService.buildDepositTx(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        undefined,
        'toYield'
      );

      expect(meanApiService.getDepositTx).not.toHaveBeenCalled();
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledTimes(1);
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledWith(
        'from',
        'toYield',
        params.totalAmmount,
        params.swaps,
        params.interval,
        params.account,
        params.permissions
      );
      expect(result).toEqual({
        to: 'hub',
        from: 'account',
      });
    });

    test('it should populate the transaction from the hub when the to is a random token', async () => {
      const params = await positionService.buildDepositParams(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5'
      );

      const result = await positionService.buildDepositTx(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5'
      );

      expect(meanApiService.getDepositTx).not.toHaveBeenCalled();
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledTimes(1);
      expect(hubInstanceMock.populateTransaction.deposit).toHaveBeenCalledWith(
        'from',
        'to',
        params.totalAmmount,
        params.swaps,
        params.interval,
        params.account,
        params.permissions
      );
      expect(result).toEqual({
        to: 'hub',
        from: 'account',
      });
    });
  });

  describe('approveAndDepositSafe', () => {
    beforeEach(() => {
      walletService.buildApproveTx.mockResolvedValue({
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
    });

    test('it should call the safeService with the bundled approve and deposit transactions', async () => {
      const params = await positionService.buildDepositParams(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        'yieldFrom',
        'yieldTo'
      );

      const result = await positionService.approveAndDepositSafe(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        'yieldFrom',
        'yieldTo'
      );

      expect(walletService.buildApproveTx).toHaveBeenCalledTimes(1);
      expect(walletService.buildApproveTx).toHaveBeenCalledWith(
        toToken({ address: 'from' }),
        true,
        PositionVersions.POSITION_VERSION_4,
        params.totalAmmount
      );
      expect(positionService.buildDepositTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildDepositTx).toHaveBeenCalledWith(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
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
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        'yieldFrom',
        'yieldTo'
      );

      expect(positionService.buildDepositTx).toHaveBeenCalledTimes(1);
      expect(positionService.buildDepositTx).toHaveBeenCalledWith(
        toToken({ address: 'from' }),
        toToken({ address: 'to' }),
        '10',
        ONE_DAY,
        '5',
        'yieldFrom',
        'yieldTo'
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

      meanApiService.withdrawSwappedUsingOtherToken.mockResolvedValue({
        to: 'companion',
        from: 'account',
        data: 'withdrawSwapped',
        hash: 'withdraw-hash',
      } as unknown as TransactionResponse);

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
      contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: 'permissions',
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

        expect(hubInstanceMock.withdrawSwapped).toHaveBeenCalledTimes(1);
        expect(hubInstanceMock.withdrawSwapped).toHaveBeenCalledWith('position-1', 'my account');
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

          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledTimes(1);
          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledWith(
            'position-1',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            'to',
            {
              permissions: 'permissions',
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            }
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'withdrawSwapped',
            hash: 'withdraw-hash',
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

          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledTimes(1);
          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledWith(
            'position-1',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            'to'
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'withdrawSwapped',
            hash: 'withdraw-hash',
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

          expect(hubInstanceMock.withdrawSwapped).toHaveBeenCalledTimes(1);
          expect(hubInstanceMock.withdrawSwapped).toHaveBeenCalledWith('position-1', 'my account');
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

          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledTimes(1);
          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledWith(
            'position-1',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            PROTOCOL_TOKEN_ADDRESS,
            {
              permissions: 'permissions',
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            }
          );
          return expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'withdrawSwapped',
            hash: 'withdraw-hash',
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

          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledTimes(1);
          expect(meanApiService.withdrawSwappedUsingOtherToken).toHaveBeenCalledWith(
            'position-1',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            PROTOCOL_TOKEN_ADDRESS
          );
          return expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'withdrawSwapped',
            hash: 'withdraw-hash',
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

      meanApiService.terminateUsingOtherTokens.mockResolvedValue({
        to: 'companion',
        from: 'account',
        data: 'terminate',
        hash: 'terminate-hash',
      } as unknown as TransactionResponse);

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);
      contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');

      positionService.companionHasPermission = jest.fn().mockResolvedValue(true);
      positionService.getSignatureForPermission = jest.fn().mockResolvedValue({
        permissions: 'permissions',
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

        expect(hubInstanceMock.terminate).toHaveBeenCalledTimes(1);
        expect(hubInstanceMock.terminate).toHaveBeenCalledWith('position-1', 'my account', 'my account');
        expect(result).toEqual({
          hash: 'hash',
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

          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledTimes(1);
          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledWith(
            'position-1',
            'my account',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            'from',
            'to',
            {
              permissions: 'permissions',
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            }
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'terminate',
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

          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledTimes(1);
          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledWith(
            'position-1',
            'my account',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            'from',
            'to'
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'terminate',
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

          expect(hubInstanceMock.terminate).toHaveBeenCalledTimes(1);
          expect(hubInstanceMock.terminate).toHaveBeenCalledWith('position-1', 'my account', 'my account');
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

          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledTimes(1);
          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledWith(
            'position-1',
            'my account',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            getProtocolToken(10).address,
            'to',
            {
              permissions: 'permissions',
              deadline: 'deadline',
              v: 'v',
              r: '0x01',
              s: '0x01',
              tokenId: 'position-1',
            }
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'terminate',
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

          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledTimes(1);
          expect(meanApiService.terminateUsingOtherTokens).toHaveBeenCalledWith(
            'position-1',
            'my account',
            'my account',
            PositionVersions.POSITION_VERSION_4,
            getProtocolToken(10).address,
            'to'
          );
          expect(result).toEqual({
            to: 'companion',
            from: 'account',
            data: 'terminate',
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
      contractService.getHUBAddress.mockResolvedValue('hubAddress');
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
        PERMISSIONS.INCREASE,
        PERMISSIONS.REDUCE,
        PERMISSIONS.WITHDRAW,
        PERMISSIONS.TERMINATE,
      ]);
      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledWith('position-1', 'permittedAddress', [
        PERMISSIONS.INCREASE,
        PERMISSIONS.REDUCE,
        PERMISSIONS.WITHDRAW,
        PERMISSIONS.TERMINATE,
      ]);
      expect(permissionManagerInstanceMock.hasPermissions).toHaveBeenCalledWith('position-1', 'permittedAddress', [
        PERMISSIONS.INCREASE,
        PERMISSIONS.REDUCE,
        PERMISSIONS.WITHDRAW,
        PERMISSIONS.TERMINATE,
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
      contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');
    });

    describe('when the from isnt protocol or wrapped token and useWrappedProtocolToken was passed', () => {
      test('it should throw an error', async () => {
        try {
          await positionService.buildModifyRateAndSwapsParams(
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
      test('it should throw an error', async () => {
        try {
          await positionService.buildModifyRateAndSwapsParams(
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
      test('it should build the parameters for the modify', async () => {
        const result = await positionService.buildModifyRateAndSwapsParams(
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
      test('it should build the parameters for the modify', async () => {
        const result = await positionService.buildModifyRateAndSwapsParams(
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
        permissions: 'permissions',
        deadline: 'deadline',
        v: 'v',
        r: [1],
        s: [1],
      });
    });

    test('it should build the signature to add the permissions for increaase', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockResolvedValue({
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
        permissions: 'permissions',
        deadline: 'deadline',
        v: 'v',
        r: '0x01',
        s: '0x01',
        tokenId: 'position-1',
      });
    });

    test('it should build the signature to add the permissions for reduce', async () => {
      positionService.buildModifyRateAndSwapsParams = jest.fn().mockResolvedValue({
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
        permissions: 'permissions',
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

      meanApiService.getDepositTx.mockResolvedValue({
        to: 'companion',
        from: 'account',
      });

      contractService.getHubInstance.mockResolvedValue(hubInstanceMock);

      positionService.getModifyRateAndSwapsSignature = jest.fn().mockResolvedValue('permissionSignature');
    });

    describe('when its increasing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '20';
        newSwaps = '10';

        contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');
        meanApiService.getIncreasePositionUsingOtherTokenTx.mockResolvedValue({
          from: 'account',
          to: 'companion',
          data: 'meanapi-increase-data',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(async () => {
          position = createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.version,
            params.tokenFrom,
            undefined
          );

          expect(result).toEqual({
            from: 'account',
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
          expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.version,
            params.tokenFrom,
            'permissionSignature'
          );

          expect(result).toEqual({
            from: 'account',
            to: 'companion',
            data: 'meanapi-increase-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(async () => {
          position = createPositionMock({
            positionId: 'position-1',
            from: getProtocolToken(10),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.INCREASE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.version,
            params.tokenFrom,
            undefined
          );

          expect(result).toEqual({
            from: 'account',
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
          expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.version,
            params.tokenFrom,
            'permissionSignature'
          );

          expect(result).toEqual({
            from: 'account',
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

        params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
        expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();

        expect(hubInstanceMock.populateTransaction.increasePosition).toHaveBeenCalledTimes(1);
        expect(hubInstanceMock.populateTransaction.increasePosition).toHaveBeenCalledWith(
          params.id,
          params.amount,
          params.swaps
        );
        expect(result).toEqual({
          hash: 'increase-hash',
        });
      });
    });

    describe('when its reducing the position', () => {
      let params: Awaited<ReturnType<PositionService['buildModifyRateAndSwapsParams']>>;
      beforeEach(() => {
        newRateUnderlying = '5';
        newSwaps = '3';

        contractService.getHUBCompanionAddress.mockResolvedValue('companionAddress');
        meanApiService.getReducePositionUsingOtherTokenTx.mockResolvedValue({
          from: 'account',
          to: 'companion',
          data: 'meanapi-reduce-data',
        });
      });

      describe('when the from has yield', () => {
        beforeEach(async () => {
          position = createPositionMock({
            positionId: 'position-1',
            from: toToken({ address: 'from', underlyingTokens: [toToken({ address: 'fromYield' })] }),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.account,
            params.version,
            params.tokenFrom,
            undefined
          );

          expect(result).toEqual({
            from: 'account',
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
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.account,
            params.version,
            params.tokenFrom,
            'permissionSignature'
          );

          expect(result).toEqual({
            from: 'account',
            to: 'companion',
            data: 'meanapi-reduce-data',
          });
        });
      });

      describe('when the from is the protocol token', () => {
        beforeEach(async () => {
          position = createPositionMock({
            positionId: 'position-1',
            from: getProtocolToken(10),
            rate: parseUnits('10', 18),
            remainingSwaps: BigNumber.from(5),
          });

          params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

          return params;
        });

        test('it should get the transaction from the mean api', async () => {
          positionService.companionHasPermission = jest.fn().mockResolvedValue(true);

          const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

          expect(positionService.companionHasPermission).toHaveBeenCalledTimes(1);
          expect(positionService.companionHasPermission).toHaveBeenCalledWith(position, PERMISSIONS.REDUCE);
          expect(positionService.getModifyRateAndSwapsSignature).not.toHaveBeenCalled();
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.account,
            params.version,
            params.tokenFrom,
            undefined
          );

          expect(result).toEqual({
            from: 'account',
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
          expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledTimes(1);
          expect(meanApiService.getReducePositionUsingOtherTokenTx).toHaveBeenCalledWith(
            params.id,
            params.amount,
            params.swaps,
            params.account,
            params.version,
            params.tokenFrom,
            'permissionSignature'
          );

          expect(result).toEqual({
            from: 'account',
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

        params = await positionService.buildModifyRateAndSwapsParams(position, newRateUnderlying, newSwaps, false);

        const result = await positionService.buildModifyRateAndSwapsTx(position, newRateUnderlying, newSwaps, false);

        expect(meanApiService.getIncreasePositionUsingOtherTokenTx).not.toHaveBeenCalled();
        expect(meanApiService.getReducePositionUsingOtherTokenTx).not.toHaveBeenCalled();

        expect(hubInstanceMock.populateTransaction.reducePosition).toHaveBeenCalledTimes(1);
        expect(hubInstanceMock.populateTransaction.reducePosition).toHaveBeenCalledWith(
          params.id,
          params.amount,
          params.swaps,
          params.account
        );
        expect(result).toEqual({
          hash: 'reduce-hash',
        });
      });
    });
  });

  describe('approveAndModifyRateAndSwapsSafe', () => {
    beforeEach(() => {
      positionService.buildModifyRateAndSwapsParams = jest
        .fn()
        .mockResolvedValue({ amount: BigNumber.from(10), tokenFrom: 'tokenFrom' });
      walletService.buildApproveTx.mockResolvedValue({
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
    });
    test('it should call the safeService with the bundled approve and modify transactions', async () => {
      const result = await positionService.approveAndModifyRateAndSwapsSafe(
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
      expect(walletService.buildApproveTx).toHaveBeenCalledTimes(1);
      expect(walletService.buildApproveTx).toHaveBeenCalledWith(
        toToken({ address: 'tokenFrom' }),
        true,
        PositionVersions.POSITION_VERSION_4,
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
        false
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
      test(`it should do nothing for ${tx.type} transactions`, async () => {
        const previousCurrentPositions = {
          ...positionService.currentPositions,
        };

        await positionService.setPendingTransaction(tx as unknown as TransactionDetails);

        expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    describe('when the transaction is for a new position', () => {
      test('it should add the new position to the currentPositions object', async () => {
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
        await positionService.setPendingTransaction({
          chainId: 10,
          hash: 'hash',
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
            user: 'my account',
            positionId: 'pending-transaction-hash',
            chainId: 10,
            toWithdraw: BigNumber.from(0),
            swapInterval: ONE_DAY,
            swapped: BigNumber.from(0),
            rate: parseUnits('10', 18).div(BigNumber.from('5')),
            depositedRateUnderlying: parseUnits('10', 18).div(BigNumber.from('5')),
            permissions: [],
            toWithdrawUnderlying: null,
            remainingLiquidityUnderlying: null,
            totalSwappedUnderlyingAccum: BigNumber.from(0),
            toWithdrawUnderlyingAccum: BigNumber.from(0),
            remainingLiquidity: parseUnits('10', 18),
            remainingSwaps: BigNumber.from('5'),
            totalSwaps: BigNumber.from('5'),
            withdrawn: BigNumber.from(0),
            totalExecutedSwaps: BigNumber.from(0),
            id: 'pending-transaction-hash',
            startedAt: 1686329816,
            totalDeposited: parseUnits('10', 18),
            pendingTransaction: 'hash',
            status: 'ACTIVE',
            version: LATEST_VERSION,
            pairLastSwappedAt: 1686329816,
            pairNextSwapAvailableAt: '1686329816',
          },
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
      test(`it should update all the positions for the ${tx.type} transaction`, async () => {
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
        await positionService.setPendingTransaction(tx as unknown as TransactionDetails);

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

    test('it should add the position from the transaction if it doesnt exist', async () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      await positionService.setPendingTransaction({
        hash: 'hash',
        typeData: { id: 'position-2' },
        position: createPositionMock({ id: 'position-2' }),
      } as unknown as TransactionDetails);

      expect(positionService.currentPositions).toEqual({
        ...previousCurrentPositions,
        'position-2': createPositionMock({ id: 'position-2', pendingTransaction: 'hash' }),
      });
    });

    test('it should set the position as pending', async () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      await positionService.setPendingTransaction({
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
      test(`it should update all the positions for the ${tx.type} transaction`, async () => {
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

        await positionService.setPendingTransaction(tx as unknown as TransactionDetails);

        positionService.handleTransactionRejection(tx as unknown as TransactionDetails);

        return expect(positionService.currentPositions).toEqual(previousCurrentPositions);
      });
    });

    test('it should remove the pending status of the position', async () => {
      const previousCurrentPositions = {
        ...positionService.currentPositions,
      };

      await positionService.setPendingTransaction({
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
            [`create-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `create-position-v${LATEST_VERSION}`,
              positionId: 'create-position',
              pairNextSwapAvailableAt: '1686329816',
              remainingLiquidity: parseUnits('20', 18),
              remainingSwaps: BigNumber.from(10),
              swapped: BigNumber.from(0),
              toWithdraw: BigNumber.from(0),
              totalExecutedSwaps: BigNumber.from(0),
              totalSwaps: BigNumber.from(10),
              withdrawn: BigNumber.from(0),
            }),
          },
          basePositions: {},
          transaction: {
            type: TransactionTypes.newPosition,
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
              withdrawn: BigNumber.from(20),
              swapped: BigNumber.from(20),
              toWithdraw: BigNumber.from(0),
              toWithdrawUnderlying: BigNumber.from(0),
              toWithdrawUnderlyingAccum: BigNumber.from(0),
            }),
          },
          basePositions: {
            [`withdraw-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `withdraw-position-v${LATEST_VERSION}`,
              withdrawn: BigNumber.from(10),
              swapped: BigNumber.from(20),
              toWithdraw: BigNumber.from(10),
              toWithdrawUnderlying: BigNumber.from(10),
              toWithdrawUnderlyingAccum: BigNumber.from(10),
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
              depositedRateUnderlying: parseUnits('20', 18),
              remainingLiquidityUnderlying: parseUnits('300', 18),
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-increase-position-v${LATEST_VERSION}`,
              rate: parseUnits('10', 18),
              totalSwaps: BigNumber.from(20),
              remainingSwaps: BigNumber.from(10),
              remainingLiquidity: parseUnits('100', 18),
              depositedRateUnderlying: parseUnits('11', 18),
              remainingLiquidityUnderlying: parseUnits('110', 18),
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
              depositedRateUnderlying: parseUnits('4', 18),
              remainingLiquidityUnderlying: parseUnits('20', 18),
            }),
          },
          basePositions: {
            [`modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-rate-and-swaps-reduce-position-v${LATEST_VERSION}`,
              rate: parseUnits('10', 18),
              totalSwaps: BigNumber.from(20),
              remainingSwaps: BigNumber.from(10),
              remainingLiquidity: parseUnits('100', 18),
              depositedRateUnderlying: parseUnits('11', 18),
              remainingLiquidityUnderlying: parseUnits('110', 18),
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
              depositedRateUnderlying: BigNumber.from(0),
              rate: BigNumber.from(0),
              totalSwaps: BigNumber.from(10),
              remainingLiquidity: BigNumber.from(0),
              remainingLiquidityUnderlying: BigNumber.from(0),
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
              depositedRateUnderlying: parseUnits('11', 18),
              remainingLiquidityUnderlying: parseUnits('110', 18),
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
              remainingLiquidityUnderlying: BigNumber.from(0),
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
            }),
          },
          basePositions: {
            [`modify-permissions-position-v${LATEST_VERSION}`]: createPositionMock({
              id: `modify-permissions-position-v${LATEST_VERSION}`,
            }),
          },
          transaction: {
            type: TransactionTypes.modifyPermissions,
            typeData: {
              id: `modify-permissions-position-v${LATEST_VERSION}`,
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
