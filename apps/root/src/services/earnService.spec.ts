/* eslint-disable @typescript-eslint/unbound-method */
import {
  DetailedSdkEarnPosition,
  EarnDepositTypeData,
  EarnIncreaseTypeData,
  EarnPositionActionType,
  FeeType,
  SavedSdkEarnPosition,
  SavedSdkStrategy,
  SdkEarnPositionId,
  SdkStrategyToken,
  StrategyFarm,
  StrategyGuardian,
  StrategyRiskLevel,
  StrategyYieldType,
  TokenType,
  TransactionDetails,
  TransactionTypes,
  WalletStatus,
  WalletType,
} from '@types';
import { createMockInstance } from '@common/utils/tests';
import isUndefined from 'lodash/isUndefined';
import { WalletClient } from 'viem';
import SdkService from './sdkService';
import AccountService from './accountService';
import { EarnService } from './earnService';

jest.mock('./sdkService');
jest.mock('./accountService');

const MockedSdkService = jest.mocked(SdkService, { shallow: false });
const MockedAccountService = jest.mocked(AccountService, { shallow: false });

const now = 1724101777;
const nowInMillis = 1724101777000;

const createSdkTokenMock = ({
  address,
  decimals,
  symbol,
  name,
  price,
}: Partial<SdkStrategyToken>): SdkStrategyToken => ({
  address: !isUndefined(address) ? address : '0xtoken',
  decimals: !isUndefined(decimals) ? decimals : 18,
  symbol: !isUndefined(symbol) ? symbol : 'TKN',
  name: !isUndefined(name) ? name : 'Token',
  price: !isUndefined(price) ? price : 1,
});

const createStrategyFarmMock = ({
  id,
  name,
  chainId,
  asset,
  rewards,
  tvl,
  type,
  apy,
}: Partial<StrategyFarm>): StrategyFarm => ({
  id: !isUndefined(id) ? id : '0xvault',
  name: !isUndefined(name) ? name : '0xvault',
  chainId: !isUndefined(chainId) ? chainId : 10,
  asset: !isUndefined(asset) ? asset : createSdkTokenMock({}),
  rewards: !isUndefined(rewards)
    ? rewards
    : {
        tokens: [createSdkTokenMock({})],
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
          type: FeeType.deposit,
          percentage: 0.2,
        },
        {
          type: FeeType.withdraw,
          percentage: 0.3,
        },
        {
          type: FeeType.performance,
          percentage: 0.02,
        },
      ],
});

const createStrategyMock = ({
  id,
  farm,
  guardian,
  riskLevel,
  lastUpdatedAt,
  userPositions,
}: Partial<SavedSdkStrategy> = {}): SavedSdkStrategy => ({
  id: !isUndefined(id) ? id : '0xvault',
  farm: !isUndefined(farm) ? createStrategyFarmMock(farm) : createStrategyFarmMock({}),
  guardian: !isUndefined(guardian) ? createStrategyGuardianMock(guardian) : createStrategyGuardianMock({}),
  riskLevel: !isUndefined(riskLevel) ? riskLevel : StrategyRiskLevel.LOW,
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
}: Partial<SavedSdkEarnPosition & { history: DetailedSdkEarnPosition['history'] }> = {}): SavedSdkEarnPosition => ({
  lastUpdatedAt: !isUndefined(lastUpdatedAt) ? lastUpdatedAt : now,
  createdAt: !isUndefined(createdAt) ? createdAt : now - 10,
  pendingTransaction: !isUndefined(pendingTransaction) ? pendingTransaction : undefined,
  id: !isUndefined(id) ? id : '10-0xvault-99',
  owner: !isUndefined(owner) ? owner : '0xwallet-1',
  permissions: !isUndefined(permissions) ? permissions : {},
  strategy: !isUndefined(strategy) ? strategy : '0xvault',
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
          timestamp: now - 10,
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
          timestamp: now - 10,
          tx: {
            hash: '0xhash',
            timestamp: now - 10,
          },
        },
      ],
});

describe('Earn Service', () => {
  let sdkService: jest.MockedObject<SdkService>;
  let accountService: jest.MockedObject<AccountService>;
  let earnService: EarnService;

  afterAll(() => {
    jest.useRealTimers();
  });
  jest.useFakeTimers();
  jest.setSystemTime(nowInMillis);

  beforeEach(() => {
    sdkService = createMockInstance(MockedSdkService);
    accountService = createMockInstance(MockedAccountService);

    earnService = new EarnService(sdkService, accountService);

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
        const newPositionTypeData: EarnDepositTypeData = {
          type: TransactionTypes.earnDeposit,
          typeData: {
            asset: {
              ...createSdkTokenMock({}),
              price: 1,
              chainId: 10,
              chainAddresses: [],
              type: TokenType.ERC20_TOKEN,
              underlyingTokens: [],
            },
            assetAmount: '1000000000000000000',
            strategyId: '0xvault',
          },
        };

        earnService.setPendingTransaction({
          chainId: 10,
          hash: '0xhash',
          from: '0xwallet-1',
          ...newPositionTypeData,
        } as TransactionDetails);

        expect(earnService.userStrategies).toEqual([
          createEarnPositionMock({ id: '10-0xvault-0' }),
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
                timestamp: now,
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
      const newPositionTypeData: EarnDepositTypeData = {
        type: TransactionTypes.earnDeposit,
        typeData: {
          asset: {
            ...createSdkTokenMock({}),
            price: 1,
            chainId: 10,
            chainAddresses: [],
            type: TokenType.ERC20_TOKEN,
            underlyingTokens: [],
          },
          assetAmount: '1000000000000000000',
          strategyId: '0xvault',
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
          walletClient: {} as WalletClient,
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
          isAuth: true,
          chainId: 10,
        },
        {
          address: '0xwallet-2',
          status: WalletStatus.connected,
          type: WalletType.embedded,
          walletClient: {} as WalletClient,
          providerInfo: { id: 'id', type: '', check: '', name: '', logo: '' },
          isAuth: true,
          chainId: 10,
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
                  timestamp: now,
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
          transaction: {
            from: '0xwallet-1',
            hash: '0xhash',
            type: TransactionTypes.earnDeposit,
            chainId: 10,
            typeData: {
              asset: {
                ...createSdkTokenMock({}),
                price: 1,
                chainId: 10,
                chainAddresses: [],
                type: TokenType.ERC20_TOKEN,
                underlyingTokens: [],
              },
              assetAmount: '1000000000000000000',
              positionId: '10-0xvault-20',
              strategyId: '0xvault',
            } satisfies EarnDepositTypeData['typeData'],
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
              history: [
                // @ts-expect-error just typescript not being very smart
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                ...(createEarnPositionMock({}).history || []),
                {
                  action: EarnPositionActionType.INCREASED,
                  deposited: {
                    amount: 1000000000000000000n,
                    amountInUnits: '1',
                    amountInUSD: '1',
                  },
                  assetPrice: 1,
                  timestamp: now,
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
            }),
          },
          transaction: {
            hash: '0xhash',
            type: TransactionTypes.earnIncrease,
            typeData: {
              asset: {
                ...createSdkTokenMock({}),
                price: 1,
                chainId: 10,
                chainAddresses: [],
                type: TokenType.ERC20_TOKEN,
                underlyingTokens: [],
              },
              assetAmount: '1000000000000000000',
              positionId: '10-0xvault-10',
              strategyId: '0xvault',
            } satisfies EarnIncreaseTypeData['typeData'],
          },
        },
      ].forEach((testItem) => {
        beforeEach(() => {
          earnService.userStrategies = [
            createEarnPositionMock({ id: '1-0xunrelated-0' }),
            ...(Object.values(testItem.basePositions) as SavedSdkEarnPosition[]),
          ];

          return earnService.setPendingTransaction(testItem.transaction as unknown as TransactionDetails);
        });

        test(`it should do update the position as expecteed for ${testItem.transaction.type} transactions`, () => {
          const previousUserStrategies = earnService.userStrategies;

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
      });
    });
  });
});
/* eslint-enable @typescript-eslint/unbound-method */
