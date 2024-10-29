/* eslint-disable @typescript-eslint/unbound-method */
import {
  DetailedSdkEarnPosition,
  EarnClaimDelayedWithdrawTypeData,
  EarnCreateTypeData,
  EarnIncreaseTypeData,
  EarnPositionActionType,
  EarnWithdrawTypeData,
  FeeType,
  SavedSdkEarnPosition,
  SavedSdkStrategy,
  SdkBaseStrategy,
  SdkEarnPositionId,
  SdkStrategyToken,
  SdkStrategyTokenWithWithdrawTypes,
  StrategyFarm,
  StrategyGuardian,
  StrategyYieldType,
  TokenType,
  TransactionDetails,
  TransactionTypes,
  WalletStatus,
  WalletType,
  WithdrawType,
} from '@types';
import { createMockInstance } from '@common/utils/tests';
import isUndefined from 'lodash/isUndefined';
import { Address } from 'viem';
import SdkService from './sdkService';
import AccountService from './accountService';
import { EarnService } from './earnService';
import ProviderService from './providerService';
import ContractService from './contractService';
import { toToken } from '@common/utils/currency';

jest.mock('./sdkService');
jest.mock('./accountService');
jest.mock('./providerService');

const MockedSdkService = jest.mocked(SdkService, { shallow: false });
const MockedAccountService = jest.mocked(AccountService, { shallow: false });
const MockedProviderService = jest.mocked(ProviderService, { shallow: false });
const MockedContractService = jest.mocked(ContractService, { shallow: false });

const now = 1724101777;
const nowInMillis = 1724101777000;

// Thank you stack overflow <3
const testif = (condition: boolean) => (condition ? test : test.skip);

const createSdkTokenWithWithdrawTypesMock = ({
  address,
  decimals,
  symbol,
  name,
  price,
  withdrawTypes,
}: Partial<SdkStrategyTokenWithWithdrawTypes>): SdkStrategyTokenWithWithdrawTypes & { address: Address } => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  address: (!isUndefined(address) ? address : '0xtoken') as Address,
  decimals: !isUndefined(decimals) ? decimals : 18,
  symbol: !isUndefined(symbol) ? symbol : 'TKN',
  name: !isUndefined(name) ? name : 'Token',
  price: !isUndefined(price) ? price : 1,
  withdrawTypes: !isUndefined(withdrawTypes) ? withdrawTypes : [],
});

const createSdkTokenMock = ({
  address,
  decimals,
  symbol,
  name,
  price,
}: Partial<SdkStrategyToken>): SdkStrategyToken => ({
  address: (!isUndefined(address) ? address : '0xtoken') as Address,
  decimals: !isUndefined(decimals) ? decimals : 18,
  symbol: !isUndefined(symbol) ? symbol : 'TKN',
  name: !isUndefined(name) ? name : 'Token',
  price: !isUndefined(price) ? price : 1,
});

const createStrategyFarmMock = ({
  id,
  name,
  asset,
  rewards,
  tvl,
  type,
  apy,
  chainId,
}: Partial<StrategyFarm>): StrategyFarm => ({
  id: !isUndefined(id) ? id : ('0xvault' as StrategyFarm['id']),
  name: !isUndefined(name) ? name : '0xvault',
  chainId: !isUndefined(chainId) ? chainId : 10,
  asset: !isUndefined(asset) ? asset : createSdkTokenWithWithdrawTypesMock({}),
  rewards: !isUndefined(rewards)
    ? rewards
    : {
        tokens: [createSdkTokenWithWithdrawTypesMock({})],
        apy: 0.03,
      },
  tvl: !isUndefined(tvl) ? tvl : 100000,
  type: !isUndefined(type) ? type : StrategyYieldType.STAKING,
  apy: !isUndefined(apy) ? apy : 0.8,
});

const createStrategyGuardianMock = ({
  id,
  name,
  description,
  logo,
  fees,
}: Partial<StrategyGuardian>): StrategyGuardian => ({
  id: !isUndefined(id) ? id : 'guardian-0',
  name: !isUndefined(name) ? name : 'Guardian',
  description: !isUndefined(description) ? description : 'Nice guardian',
  logo: !isUndefined(logo) ? logo : '',
  fees: !isUndefined(fees)
    ? fees
    : [
        {
          type: FeeType.DEPOSIT,
          percentage: 0.2,
        },
        {
          type: FeeType.WITHDRAW,
          percentage: 0.3,
        },
        {
          type: FeeType.PERFORMANCE,
          percentage: 0.02,
        },
      ],
});

const createStrategyMock = ({
  id,
  farm,
  guardian,
  lastUpdatedAt,
  userPositions,
}: Partial<SavedSdkStrategy> = {}): SavedSdkStrategy => ({
  depositTokens: [{ ...(farm?.asset || createStrategyFarmMock({}).asset), type: TokenType.ASSET }],
  id: !isUndefined(id) ? id : ('0xvault' as SavedSdkStrategy['id']),
  farm: !isUndefined(farm) ? createStrategyFarmMock(farm) : createStrategyFarmMock({}),
  guardian: !isUndefined(guardian) ? createStrategyGuardianMock(guardian) : createStrategyGuardianMock({}),
  lastUpdatedAt: !isUndefined(lastUpdatedAt) ? lastUpdatedAt : now,
  userPositions: !isUndefined(userPositions) ? userPositions : [],
});

const createEarnPositionMock = ({
  lastUpdatedAt,
  createdAt,
  pendingTransaction,
  id,
  owner,
  permissions,
  strategy,
  balances,
  historicalBalances,
  history,
  detailed,
  delayed,
}: Partial<
  SavedSdkEarnPosition & { history: DetailedSdkEarnPosition['history']; detailed?: boolean }
> = {}): SavedSdkEarnPosition => ({
  lastUpdatedAt: !isUndefined(lastUpdatedAt) ? lastUpdatedAt : now,
  createdAt: !isUndefined(createdAt) ? createdAt : now - 10,
  pendingTransaction: !isUndefined(pendingTransaction) ? pendingTransaction : undefined,
  id: !isUndefined(id) ? id : '10-0xvault-99',
  owner: !isUndefined(owner) ? owner : '0xwallet-1',
  permissions: !isUndefined(permissions) ? permissions : {},
  strategy: !isUndefined(strategy) ? strategy : ('0xvault' as SdkBaseStrategy['id']),
  balances: !isUndefined(balances)
    ? balances
    : [
        {
          token: createSdkTokenMock({}),
          amount: {
            amount: 1000000000000000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          profit: {
            amount: 500000000000000000n,
            amountInUnits: '0.5',
            amountInUSD: '0.5',
          },
        },
      ],
  historicalBalances: !isUndefined(historicalBalances)
    ? historicalBalances
    : [
        {
          timestamp: now - 60 * 60 * 24,
          balances: [
            {
              amount: {
                amount: 1000000000000000000n,
                amountInUnits: '1',
                amountInUSD: '1',
              },
              profit: {
                amount: 500000000000000000n,
                amountInUnits: '0.5',
                amountInUSD: '0.5',
              },
              token: createSdkTokenMock({}),
            },
          ],
        },
      ],
  detailed: (!isUndefined(detailed) ? detailed : true) as true,
  history: !isUndefined(history)
    ? history
    : [
        {
          action: EarnPositionActionType.CREATED,
          owner: '0xwallet-1',
          permissions: {},
          deposited: {
            amount: 1000000000000000000n,
            amountInUnits: '1',
            amountInUSD: '1',
          },
          assetPrice: 1,
          tx: {
            hash: '0xhash',
            timestamp: now - 10,
          },
        },
      ],
  delayed: !isUndefined(delayed) ? delayed : undefined,
});

describe('Earn Service', () => {
  let sdkService: jest.MockedObject<SdkService>;
  let accountService: jest.MockedObject<AccountService>;
  let providerService: jest.MockedObject<ProviderService>;
  let contractService: jest.MockedObject<ContractService>;
  let earnService: EarnService;

  afterAll(() => {
    jest.useRealTimers();
  });
  jest.useFakeTimers();
  jest.setSystemTime(nowInMillis);

  beforeEach(() => {
    sdkService = createMockInstance(MockedSdkService);
    accountService = createMockInstance(MockedAccountService);
    providerService = createMockInstance(MockedProviderService);
    contractService = createMockInstance(MockedContractService);

    contractService.getEarnVaultAddress = jest.fn().mockReturnValue('0xvault');
    earnService = new EarnService(sdkService, accountService, providerService, contractService);

    earnService.allStrategies = [createStrategyMock({})];
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('setPendingTransaction', () => {
    beforeEach(() => {
      earnService.userStrategies = [createEarnPositionMock({ id: '10-0xvault-0' })];
    });

    describe('when the transaction is for a new position', () => {
      test('it should add the new position to the currentPositions object', () => {
        const newPositionTypeData: EarnCreateTypeData = {
          type: TransactionTypes.earnCreate,
          typeData: {
            asset: {
              ...createSdkTokenWithWithdrawTypesMock({}),
              price: 1,
              chainId: 10,
              chainAddresses: [],
              type: TokenType.ERC20_TOKEN,
              underlyingTokens: [],
            },
            assetAmount: '1000000000000000000',
            strategyId: '0xvault' as SavedSdkStrategy['id'],
          },
        };

        earnService.setPendingTransaction({
          chainId: 10,
          hash: '0xhash',
          from: '0xwallet-1',
          ...newPositionTypeData,
        } as TransactionDetails);

        expect(earnService.userStrategies).toEqual([
          createEarnPositionMock({ id: '10-0xvault-0', detailed: true }),
          createEarnPositionMock({
            id: '10-0xvault-0xhash' as SdkEarnPositionId,
            pendingTransaction: '0xhash',
            balances: [
              {
                token: createSdkTokenMock({}),
                // It's less since we deduct the deposit fee
                amount: {
                  amount: 999800000000000000n,
                  amountInUnits: '0.9998',
                  amountInUSD: '1.00',
                },
                profit: {
                  amount: 0n,
                  amountInUnits: '0',
                  amountInUSD: '0',
                },
              },
            ],
            createdAt: now,
            history: [
              {
                action: EarnPositionActionType.CREATED,
                owner: '0xwallet-1',
                permissions: {},
                deposited: {
                  amount: 1000000000000000000n,
                  amountInUnits: '1',
                  amountInUSD: '1',
                },
                assetPrice: 1,
                tx: {
                  hash: '0xhash',
                  timestamp: now,
                },
              },
            ],
            historicalBalances: [
              {
                timestamp: now,
                balances: [
                  {
                    amount: {
                      amount: 999800000000000000n,
                      amountInUnits: '0.9998',
                      amountInUSD: '1.00',
                    },
                    profit: {
                      amount: 0n,
                      amountInUnits: '0',
                      amountInUSD: '0',
                    },
                    token: createSdkTokenMock({}),
                  },
                ],
              },
            ],
            detailed: true,
          }),
        ]);
      });
    });

    test('it should set the position as pending', () => {
      earnService.setPendingTransaction({
        hash: '0xhash',
        type: TransactionTypes.earnIncrease,
        typeData: { positionId: '10-0xvault-0' },
      } as unknown as TransactionDetails);

      expect(earnService.userStrategies).toEqual([
        createEarnPositionMock({ id: '10-0xvault-0', pendingTransaction: '0xhash' }),
      ]);
    });
  });

  describe('handleTransactionRejection', () => {
    beforeEach(() => {
      earnService.userStrategies = [
        createEarnPositionMock({ id: '10-0xvault-0' }),
        createEarnPositionMock({ id: '1-0xunrelated-0' }),
      ];
    });

    describe('when the transaction is for a new position', () => {
      const newPositionTypeData: EarnCreateTypeData = {
        type: TransactionTypes.earnCreate,
        typeData: {
          asset: {
            ...createSdkTokenWithWithdrawTypesMock({}),
            price: 1,
            chainId: 10,
            chainAddresses: [],
            type: TokenType.ERC20_TOKEN,
            underlyingTokens: [],
          },
          assetAmount: '1000000000000000000',
          strategyId: '0xvault' as SavedSdkStrategy['id'],
        },
      };

      const tx = {
        chainId: 10,
        hash: '0xhash',
        ...newPositionTypeData,
      };

      beforeEach(() => {
        return earnService.setPendingTransaction(tx as TransactionDetails);
      });

      test('it should delete the pending position', () => {
        earnService.handleTransactionRejection(tx as TransactionDetails);

        expect(earnService.userStrategies).toEqual([
          createEarnPositionMock({ id: '10-0xvault-0' }),
          createEarnPositionMock({ id: '1-0xunrelated-0' }),
        ]);
      });
    });

    test('it should remove the pending status of the position', () => {
      earnService.setPendingTransaction({
        hash: '0xhash',
        type: TransactionTypes.earnIncrease,
        typeData: { positionId: '10-0xvault-0' },
      } as unknown as TransactionDetails);

      earnService.handleTransactionRejection({
        hash: '0xhash',
        type: TransactionTypes.earnIncrease,
        typeData: { positionId: '10-0xvault-0' },
      } as unknown as TransactionDetails);

      expect(earnService.userStrategies).toEqual([
        createEarnPositionMock({ id: '1-0xunrelated-0' }),
        { ...createEarnPositionMock({ id: '10-0xvault-0' }), pendingTransaction: '' },
      ]);
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
        },
        {
          address: '0xwallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          isAuth: true,
        },
      ]);
    });

    describe('Transactions that should be handled', () => {
      [
        {
          expectedPositionChanges: {
            '10-0xvault-20': createEarnPositionMock({
              id: '10-0xvault-20',
              balances: [
                {
                  token: createSdkTokenMock({}),
                  // It's less since we deduct the deposit fee
                  amount: {
                    amount: 999800000000000000n,
                    amountInUnits: '0.9998',
                    amountInUSD: '1.00',
                  },
                  profit: {
                    amount: 0n,
                    amountInUnits: '0',
                    amountInUSD: '0',
                  },
                },
              ],
              createdAt: now,
              detailed: true,
              history: [
                {
                  action: EarnPositionActionType.CREATED,
                  owner: '0xwallet-1',
                  permissions: {},
                  deposited: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                  assetPrice: 1,
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              historicalBalances: [
                {
                  timestamp: now,
                  balances: [
                    {
                      amount: {
                        amount: 999800000000000000n,
                        amountInUnits: '0.9998',
                        amountInUSD: '1.00',
                      },
                      profit: {
                        amount: 0n,
                        amountInUnits: '0',
                        amountInUSD: '0',
                      },
                      token: createSdkTokenMock({}),
                    },
                  ],
                },
              ],
            }),
            '10-0xvault-0xhash': undefined,
          },
          basePositions: {},
          expectedStrategiesChanges: {
            '0xvault': createStrategyMock({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              id: '0xvault',
              userPositions: ['10-0xvault-20'],
            }),
          },
          baseStrategies: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            '0xvault': createStrategyMock({ id: '0xvault' }),
          },
          transaction: {
            from: '0xwallet-1',
            hash: '0xhash',
            type: TransactionTypes.earnCreate,
            chainId: 10,
            typeData: {
              asset: {
                ...createSdkTokenWithWithdrawTypesMock({}),
                price: 1,
                chainId: 10,
                chainAddresses: [],
                type: TokenType.ERC20_TOKEN,
                underlyingTokens: [],
              },
              assetAmount: '1000000000000000000',
              positionId: 20n,
              strategyId: '0xvault' as SavedSdkStrategy['id'],
            } satisfies EarnCreateTypeData['typeData'],
          },
        },
        {
          expectedPositionChanges: {
            '10-0xvault-10': createEarnPositionMock({
              id: '10-0xvault-10',
              balances: [
                {
                  token: createSdkTokenMock({}),
                  amount: {
                    amount: 1999800000000000000n,
                    amountInUnits: '1.9998',
                    amountInUSD: '2',
                  },
                  profit: createEarnPositionMock({}).balances[0].profit,
                },
              ],
              detailed: true,
              history: [
                ...(createEarnPositionMock({ detailed: true }).history || []),
                {
                  action: EarnPositionActionType.INCREASED,
                  deposited: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                  assetPrice: 1,
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              lastUpdatedAt: now,
              pendingTransaction: '',
              historicalBalances: [
                ...createEarnPositionMock({}).historicalBalances,
                {
                  timestamp: now,
                  balances: [
                    {
                      amount: {
                        amount: 1999800000000000000n,
                        amountInUnits: '1.9998',
                        amountInUSD: '2',
                      },
                      profit: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      token: createSdkTokenMock({}),
                    },
                  ],
                },
              ],
            }),
          },
          basePositions: {
            '10-0xvault-10': createEarnPositionMock({
              id: '10-0xvault-10',
              detailed: true,
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnIncrease,
            typeData: {
              asset: {
                ...createSdkTokenWithWithdrawTypesMock({}),
                price: 1,
                chainId: 10,
                chainAddresses: [],
                type: TokenType.ERC20_TOKEN,
                underlyingTokens: [],
              },
              assetAmount: '1000000000000000000',
              positionId: '10-0xvault-10',
              strategyId: '0xvault' as SavedSdkStrategy['id'],
            } satisfies EarnIncreaseTypeData['typeData'],
          },
        },
        {
          expectedPositionChanges: {
            '10-0xvault-30': createEarnPositionMock({
              id: '10-0xvault-30',
              balances: [
                {
                  token: createSdkTokenMock({}),
                  amount: {
                    amount: 500000000000000000n,
                    amountInUnits: '0.5',
                    amountInUSD: '0.5',
                  },
                  profit: {
                    amount: 500000000000000000n,
                    amountInUnits: '0.5',
                    amountInUSD: '0.5',
                  },
                },
              ],
              detailed: true,
              history: [
                ...(createEarnPositionMock({ detailed: true }).history || []),
                {
                  action: EarnPositionActionType.WITHDREW,
                  recipient: '0xwallet-1',
                  withdrawn: [
                    {
                      amount: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      token: toToken({ ...createSdkTokenWithWithdrawTypesMock({}), chainId: 10 }),
                      withdrawType: WithdrawType.IMMEDIATE,
                    },
                  ],
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              lastUpdatedAt: now,
              pendingTransaction: '',
              historicalBalances: [
                ...createEarnPositionMock({}).historicalBalances,
                {
                  timestamp: now,
                  balances: [
                    {
                      amount: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      profit: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      token: createSdkTokenMock({}),
                    },
                  ],
                },
              ],
            }),
          },
          basePositions: {
            '10-0xvault-30': createEarnPositionMock({
              id: '10-0xvault-30',
              detailed: true,
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnWithdraw,
            typeData: {
              withdrawn: [
                {
                  token: toToken({ ...createSdkTokenWithWithdrawTypesMock({}), chainId: 10 }),
                  amount: '500000000000000000',
                  withdrawType: WithdrawType.IMMEDIATE,
                },
              ],
              positionId: '10-0xvault-30',
              strategyId: '0xvault' as `${number}-${Lowercase<string>}-${number}`,
            } satisfies EarnWithdrawTypeData['typeData'],
          },
        },
        {
          expectedPositionChanges: {
            '10-0xvault-40': createEarnPositionMock({
              id: '10-0xvault-40',
              balances: [
                {
                  token: createSdkTokenMock({}),
                  amount: {
                    amount: 0n,
                    amountInUnits: '0',
                    amountInUSD: '0',
                  },
                  profit: {
                    amount: 500000000000000000n,
                    amountInUnits: '0.5',
                    amountInUSD: '0.5',
                  },
                },
              ],
              detailed: true,
              history: [
                ...(createEarnPositionMock({ detailed: true }).history || []),
                {
                  action: EarnPositionActionType.WITHDREW,
                  recipient: '0xwallet-1',
                  withdrawn: [
                    {
                      amount: {
                        amount: 1000000000000000000n,
                        amountInUnits: '1',
                        amountInUSD: '1',
                      },
                      token: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
                      withdrawType: WithdrawType.DELAYED,
                    },
                  ],
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              lastUpdatedAt: now,
              pendingTransaction: '',
              historicalBalances: [
                ...createEarnPositionMock({}).historicalBalances,
                {
                  timestamp: now,
                  balances: [
                    {
                      amount: {
                        amount: 0n,
                        amountInUnits: '0',
                        amountInUSD: '0',
                      },
                      profit: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      token: createSdkTokenMock({}),
                    },
                  ],
                },
              ],
              delayed: [
                {
                  token: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
                  ready: {
                    amount: 0n,
                    amountInUnits: '0',
                  },
                  pending: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                },
              ],
            }),
          },
          basePositions: {
            '10-0xvault-40': createEarnPositionMock({
              id: '10-0xvault-40',
              detailed: true,
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnWithdraw,
            typeData: {
              withdrawn: [
                {
                  token: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
                  amount: '1000000000000000000',
                  withdrawType: WithdrawType.DELAYED,
                },
              ],
              positionId: '10-0xvault-40',
              strategyId: '0xvault' as `${number}-${Lowercase<string>}-${number}`,
            } satisfies EarnWithdrawTypeData['typeData'],
          },
        },
        {
          expectedPositionChanges: {
            '10-0xvault-50': createEarnPositionMock({
              id: '10-0xvault-50',
              balances: [
                {
                  token: createSdkTokenMock({}),
                  amount: {
                    amount: 0n,
                    amountInUnits: '0',
                    amountInUSD: '0',
                  },
                  profit: {
                    amount: 500000000000000000n,
                    amountInUnits: '0.5',
                    amountInUSD: '0.5',
                  },
                },
              ],
              detailed: true,
              history: [
                ...(createEarnPositionMock({ detailed: true }).history || []),
                {
                  action: EarnPositionActionType.WITHDREW,
                  recipient: '0xwallet-1',
                  withdrawn: [
                    {
                      amount: {
                        amount: 1000000000000000000n,
                        amountInUnits: '1',
                        amountInUSD: '1',
                      },
                      token: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
                      withdrawType: WithdrawType.DELAYED,
                    },
                  ],
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              lastUpdatedAt: now,
              pendingTransaction: '',
              historicalBalances: [
                ...createEarnPositionMock({}).historicalBalances,
                {
                  timestamp: now,
                  balances: [
                    {
                      amount: {
                        amount: 0n,
                        amountInUnits: '0',
                        amountInUSD: '0',
                      },
                      profit: {
                        amount: 500000000000000000n,
                        amountInUnits: '0.5',
                        amountInUSD: '0.5',
                      },
                      token: createSdkTokenMock({}),
                    },
                  ],
                },
              ],
              delayed: [
                {
                  token: createSdkTokenMock({}),
                  ready: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                  },
                  pending: {
                    amount: 2000000000000000000n,
                    amountInUnits: '2',
                    amountInUSD: '2',
                  },
                },
              ],
            }),
          },
          basePositions: {
            '10-0xvault-50': createEarnPositionMock({
              id: '10-0xvault-50',
              detailed: true,
              delayed: [
                {
                  token: createSdkTokenMock({}),
                  ready: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                  },
                  pending: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                },
              ],
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnWithdraw,
            typeData: {
              withdrawn: [
                {
                  token: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
                  amount: '1000000000000000000',
                  withdrawType: WithdrawType.DELAYED,
                },
              ],
              positionId: '10-0xvault-50',
              strategyId: '0xvault' as `${number}-${Lowercase<string>}-${number}`,
            } satisfies EarnWithdrawTypeData['typeData'],
          },
        },
        {
          expectedPositionChanges: {
            '10-0xvault-60': createEarnPositionMock({
              id: '10-0xvault-60',
              detailed: true,
              history: [
                ...(createEarnPositionMock({ detailed: true }).history || []),
                {
                  action: EarnPositionActionType.DELAYED_WITHDRAWAL_CLAIMED,
                  recipient: '0xwallet-1',
                  token: createSdkTokenMock({}),
                  withdrawn: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                  tx: {
                    hash: '0xhash',
                    timestamp: now,
                  },
                },
              ],
              lastUpdatedAt: now,
              pendingTransaction: '',
              delayed: [
                {
                  token: createSdkTokenMock({}),
                  ready: {
                    amount: 0n,
                    amountInUnits: '0',
                  },
                  pending: {
                    amount: 2000000000000000000n,
                    amountInUnits: '2',
                    amountInUSD: '2',
                  },
                },
              ],
            }),
          },
          basePositions: {
            '10-0xvault-60': createEarnPositionMock({
              id: '10-0xvault-60',
              detailed: true,
              delayed: [
                {
                  token: createSdkTokenMock({}),
                  ready: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                  pending: {
                    amount: 2000000000000000000n,
                    amountInUnits: '2',
                    amountInUSD: '2',
                  },
                },
              ],
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnClaimDelayedWithdraw,
            typeData: {
              claim: toToken({ ...createSdkTokenMock({}), chainId: 10 }),
              withdrawn: '1000000000000000000',
              positionId: '10-0xvault-60',
              strategyId: '0xvault' as `${number}-${Lowercase<string>}-${number}`,
            } satisfies EarnClaimDelayedWithdrawTypeData['typeData'],
          },
        },
      ].forEach((testItem) => {
        describe(`for transaction type ${testItem.transaction.type} with id ${testItem.transaction.typeData.positionId}`, () => {
          beforeEach(() => {
            earnService.userStrategies = [
              createEarnPositionMock({ id: '1-0xunrelated-0' }),
              ...(Object.values(testItem.basePositions) as SavedSdkEarnPosition[]),
            ];
            return earnService.setPendingTransaction(testItem.transaction as unknown as TransactionDetails);
          });

          test(`it should do update the position as expecteed`, () => {
            const previousUserStrategies = [...earnService.userStrategies];

            earnService.handleTransaction(testItem.transaction as unknown as TransactionDetails);

            const expectedPositions = Object.entries(testItem.expectedPositionChanges);

            expectedPositions.forEach(([positionId, expectedPosition]) => {
              const found = earnService.userStrategies.find((position) => position.id === positionId);

              expect(found).toEqual(expectedPosition);
            });

            // Others should remain unchanged
            const unchangedPositions = previousUserStrategies.filter(
              (position) => !expectedPositions.some(([positionId]) => position.id === positionId)
            );
            unchangedPositions.forEach((position) => {
              const found = earnService.userStrategies.find((pos) => pos.id === position.id);

              expect(found).toEqual(position);
            });
          });

          testif(!!testItem.expectedStrategiesChanges)(`it should update the strategies as expecteed`, () => {
            if (!testItem.expectedStrategiesChanges) {
              throw new Error('This should not be being tested');
            }

            const previousStrategies = [...earnService.allStrategies];

            earnService.handleTransaction(testItem.transaction as unknown as TransactionDetails);

            const expectedStrategies = Object.entries(testItem.expectedStrategiesChanges);

            expectedStrategies.forEach(([strategyId, expectedStrategy]) => {
              const found = earnService.allStrategies.find((strategy) => strategy.id === strategyId);

              // eslint-disable-next-line jest/no-standalone-expect
              expect(found).toEqual(expectedStrategy);
            });

            // Others should remain unchanged
            const unchangedStrategies = previousStrategies.filter(
              (strategy) => !expectedStrategies.some(([strategyId]) => strategy.id === strategyId)
            );
            unchangedStrategies.forEach((strategy) => {
              const found = earnService.allStrategies.find((strat) => strat.id === strategy.id);

              // eslint-disable-next-line jest/no-standalone-expect
              expect(found).toEqual(strategy);
            });
          });
        });
      });
    });
  });
});
/* eslint-enable @typescript-eslint/unbound-method */
