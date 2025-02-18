import { createMockInstance } from '@common/utils/tests';
import TierService from './tierService';
import Web3Service from './web3Service';
import MeanApiService, { AccountWithConfig } from './meanApiService';
import {
  AchievementKeys,
  User,
  Wallet,
  WalletType,
  WalletStatus,
  Address,
  TransactionTypes,
  TransactionDetails,
} from '@types';
import AccountService from './accountService';
import { IntervalSetActions } from '@constants/timing';
import { Chains } from '@balmy/sdk';

const MockedWeb3Service = jest.mocked(Web3Service, { shallow: true });
const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });

// Update wallet objects to include all required properties
const createTestWallet = (props: Partial<Wallet>): Wallet => ({
  address: '0x1',
  type: WalletType.external,
  status: WalletStatus.connected,
  label: 'Test Wallet',
  isAuth: false,
  isOwner: true,
  ...props,
});

const mockedTodayMilis = 1642439808 * 1000;

describe('Tier Service', () => {
  let tierService: TierService;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let web3Service: jest.MockedObject<Web3Service>;

  beforeEach(() => {
    meanApiService = createMockInstance(MockedMeanApiService);
    web3Service = createMockInstance(MockedWeb3Service);

    tierService = new TierService(web3Service as unknown as Web3Service, meanApiService as unknown as MeanApiService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  // Replace the existing calculateUserTier test with our new test suite
  describe('calculateTotalAchievements', () => {
    it('should sum achievements from owned wallets only by default', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
          createTestWallet({
            address: '0x2',
            isOwner: false,
          }),
        ],
      } as User;

      tierService.setAchievements(
        ['0x1', '0x2'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
          '0x2': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
        },
        false
      );
      tierService.setReferrals({
        id: '123',
        activated: 2,
        referred: 2,
      }); // 2 referrals

      const result = tierService.calculateTotalAchievements(user);
      expect(result).toEqual({
        [AchievementKeys.REFERRALS]: 2,
        [AchievementKeys.SWAP_VOLUME]: 1000,
      });
    });

    it('should sum achievements from all wallets when specified', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
          createTestWallet({
            address: '0x2',
            isOwner: false,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 5,
        referred: 5,
      }); // 5 referrals
      tierService.setAchievements(
        ['0x1', '0x2'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
          '0x2': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
        },
        false
      );
      const result = tierService.calculateTotalAchievements(user, false);
      expect(result).toEqual({
        [AchievementKeys.REFERRALS]: 5,
        [AchievementKeys.SWAP_VOLUME]: 1500,
      });
    });
  });

  describe('calculateUserTier', () => {
    it('should return tier 0 for new users', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 0,
        referred: 0,
      }); // 0 referrals

      tierService.setAchievements(['0x1'], {}, false);
      const result = tierService.calculateUserTier(user);
      expect(result).toBe(0);
    });

    it('should return tier 1 when meeting basic requirements', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 0,
        referred: 0,
      }); // Tier 1 can be reached with just swap volume
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
        },
        false
      );
      const result = tierService.calculateUserTier(user);
      expect(result).toBe(1);
    });

    it('should return tier 2 when meeting AND/OR conditions', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0xaddress',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 1,
        referred: 1,
      }); // 1 referral for tier 2

      tierService.setAchievements(['0xaddress'], {}, true);
      const result = tierService.calculateUserTier(user);
      expect(result).toBe(2);
    });

    it('should return tier 2 when meeting AND/OR conditions with swap volume', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 1,
        referred: 1,
      }); // 1 referral for tier 2
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
        },
        false
      );
      const result = tierService.calculateUserTier(user);
      expect(result).toBe(2);
    });

    it('should return tier 3 when meeting highest requirements', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 3,
        referred: 3,
      }); // 3 referrals for tier 3
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 2000 }],
        },
        false
      );
      const result = tierService.calculateUserTier(user);
      expect(result).toBe(3);
    });

    it('should return tier 3 when meeting highest requirements with migrated volume', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
          }),
        ],
      } as User;

      tierService.setReferrals({
        id: '123',
        activated: 5,
        referred: 5,
      }); // 5 referrals
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.MIGRATED_VOLUME, achieved: 2000 }],
        },
        false
      );

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(3);
    });
  });

  describe('calculateMissingForNextTier', () => {
    beforeEach(() => {
      const mockAccountService = {
        user: {
          wallets: [
            createTestWallet({
              address: '0x1',
              isOwner: true,
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals({
        id: '123',
        activated: 1,
        referred: 1,
      }); // 1 referral
    });

    it('should return empty objects when no user is set', () => {
      web3Service.accountService.user = undefined;
      const result = tierService.calculateMissingForNextTier();
      expect(result).toEqual({
        missing: {},
        details: {},
        walletsToVerify: [],
      });
    });

    it('should calculate missing requirements for next tier', () => {
      tierService.setUserTier(1); // Current tier
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
        },
        false
      );
      const result = tierService.calculateMissingForNextTier();

      expect(result.missing).toEqual({
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 1, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.walletsToVerify).toEqual([]);
    });

    it('should identify non-owned wallets that could help meet requirements', () => {
      const mockAccountService = {
        user: {
          wallets: [
            createTestWallet({
              address: '0x1',
              isOwner: true,
            }),
            createTestWallet({
              address: '0x2',
              isOwner: false,
            }),
          ],
        } as User,
      } as AccountService;

      tierService.setAchievements(
        ['0x1', '0x2'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 200 }],
          '0x2': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
        },
        false
      );
      web3Service.accountService = mockAccountService;
      tierService.setReferrals({
        id: '123',
        activated: 3,
        referred: 3,
      }); // 3 referrals (meets the AND condition)
      tierService.setUserTier(1);

      const result = tierService.calculateMissingForNextTier();

      // For Tier 2, we need either SWAP_VOLUME >= 1000 OR TWEET >= 1
      expect(result.missing).toEqual({
        [AchievementKeys.SWAP_VOLUME]: { current: 200, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 3, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 1200, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.walletsToVerify).toEqual(['0x2']);
    });
  });

  describe('getProgressPercentageToNextTier', () => {
    it('should calculate correct progress percentage', () => {
      const mockAccountService = {
        user: {
          wallets: [
            createTestWallet({
              address: '0x1',
              isOwner: true,
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals({
        id: '123',
        activated: 0,
        referred: 0,
      }); // 0 referrals
      tierService.setAchievements(
        ['0x1'],
        {
          '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
        },
        false
      );
      tierService.setUserTier(1);
      const result = tierService.getProgressPercentageToNextTier();

      // For Tier 2, we need:
      // - 3 referrals (currently have 0/1 = 0%)
      // - AND either 1000 swap volume OR 1 tweet (currently have 500/1000 = 50%)
      expect(result.progress).toBe(25);
      expect(result.missing).toEqual({
        [AchievementKeys.REFERRALS]: { current: 0, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 0, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
    });

    it('should return 0 progress when at tier 0', () => {
      const mockAccountService = {
        user: {
          wallets: [
            createTestWallet({
              address: '0x1',
              isOwner: true,
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals({
        id: '123',
        activated: 0,
        referred: 0,
      }); // 0 referrals
      tierService.setAchievements(['0x1'], {}, false);
      tierService.setUserTier(0);
      const result = tierService.getProgressPercentageToNextTier();

      expect(result.progress).toBe(0);
      expect(result.missing).toEqual({
        [AchievementKeys.REFERRALS]: { current: 0, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 0, required: 500 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 0, required: 1 },
        [AchievementKeys.SWAP_VOLUME]: { current: 0, required: 500 },
      });
    });
  });

  describe('pollUser', () => {
    it('should update user data when signature is available', async () => {
      const mockSignature = 'mock-signature';
      const mockAccounts = {
        accounts: [
          {
            referrals: {
              id: '123',
              activated: 1,
              referred: 1,
            },
            achievements: {
              wallets: {
                '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
              },
              account: [],
            },
            wallets: [
              createTestWallet({
                address: '0x1',
                isOwner: true,
              }),
            ],
          },
        ],
      };

      const mockAccountService = {
        getWalletVerifyingSignature: jest.fn().mockResolvedValue(mockSignature),
      } as unknown as AccountService;

      web3Service.accountService = mockAccountService;
      meanApiService.getAccounts.mockResolvedValue(mockAccounts as unknown as { accounts: AccountWithConfig[] });

      await tierService.pollUser();

      expect(tierService.getReferrals()).toEqual({
        id: '123',
        activated: 1,
        referred: 1,
      });
      expect(tierService.getAchievements()).toEqual({
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
      });
    });

    it('should not update when no signature is available', async () => {
      const mockAccountService = {
        getWalletVerifyingSignature: jest.fn().mockResolvedValue(null),
      } as unknown as AccountService;

      web3Service.accountService = mockAccountService;

      await tierService.pollUser();

      expect(meanApiService.getAccounts).not.toHaveBeenCalled();
    });
  });

  describe('setAchievements', () => {
    beforeEach(() => {
      const mockedToday = new Date(mockedTodayMilis);
      jest.useFakeTimers();
      jest.setSystemTime(mockedToday);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set new achievements for wallets', () => {
      const wallets = ['0x1', '0x2'] as Address[];
      const achievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
        '0x2': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
      };

      tierService.setAchievements(wallets, achievements, false);

      expect(tierService.achievements).toEqual({
        '0x1': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
            lastUpdated: mockedTodayMilis,
          },
        ],
        '0x2': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 500 },
            lastUpdated: mockedTodayMilis,
          },
        ],
      });
    });

    it('should preserve existing achievements if update interval has not passed', () => {
      // First set initial achievements
      const initialAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
      };
      tierService.setAchievements(['0x1'], initialAchievements, false);

      // Advance time but not enough to trigger update
      jest.advanceTimersByTime(IntervalSetActions.tierAchievementSpoilage - 1000);

      // Try to update with new value
      const newAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
      };
      tierService.setAchievements(['0x1'], newAchievements, false);

      expect(tierService.achievements).toEqual({
        '0x1': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
            lastUpdated: mockedTodayMilis,
          },
        ],
      });
    });

    it('should update existing achievements if update interval has not passed but new value is higher', () => {
      // First set initial achievements
      const initialAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
      };
      tierService.setAchievements(['0x1'], initialAchievements, false);

      // Advance time but not enough to trigger update
      jest.advanceTimersByTime(IntervalSetActions.tierAchievementSpoilage - 1000);

      // Try to update with new value
      const newAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
      };
      tierService.setAchievements(['0x1'], newAchievements, false);

      expect(tierService.achievements).toEqual({
        '0x1': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
            lastUpdated: mockedTodayMilis + IntervalSetActions.tierAchievementSpoilage - 1000,
          },
        ],
      });
    });

    it('should update achievements if update interval has passed', () => {
      // Set initial achievements
      const initialAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
      };
      tierService.setAchievements(['0x1'], initialAchievements, false);

      // Advance time past the update interval
      jest.advanceTimersByTime(IntervalSetActions.tierAchievementSpoilage + 1000);

      // Update with new achievements
      const newAchievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 500 }],
      };
      tierService.setAchievements(['0x1'], newAchievements, false);

      expect(tierService.achievements).toEqual({
        '0x1': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 500 },
            lastUpdated: mockedTodayMilis + IntervalSetActions.tierAchievementSpoilage + 1000,
          },
        ],
      });
    });

    it('should add twitter achievement when twitterShare is true', () => {
      const wallets = ['0x1'] as Address[];
      const achievements = {
        '0x1': [{ id: AchievementKeys.SWAP_VOLUME, achieved: 1000 }],
      };

      tierService.setAchievements(wallets, achievements, true);

      expect(tierService.achievements).toEqual({
        '0x1': [
          {
            achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
            lastUpdated: mockedTodayMilis,
          },
          {
            achievement: { id: AchievementKeys.TWEET, achieved: 1 },
            lastUpdated: mockedTodayMilis,
          },
        ],
      });
    });

    it('should handle empty achievements', () => {
      const wallets = ['0x1', '0x2'] as Address[];
      const achievements = {};

      tierService.setAchievements(wallets, achievements, false);

      expect(tierService.achievements).toEqual({
        '0x1': [],
        '0x2': [],
      });
    });
  });

  describe('updateAchievements', () => {
    beforeEach(() => {
      const mockedToday = new Date(mockedTodayMilis);
      jest.useFakeTimers();
      jest.setSystemTime(mockedToday);

      // Set up user in web3Service
      web3Service.accountService = {
        user: {
          wallets: [
            createTestWallet({
              address: '0xwallet',
              isOwner: true,
            }),
          ],
        } as User,
      } as AccountService;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('swap transactions', () => {
      it('should NOT update swap volume achievement for existing achievement if the chain is not superchain', () => {
        // Set initial achievements
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.swap,
          from: '0xwallet',
          chainId: Chains.POLYGON.chainId,
          typeData: {
            amountFromUsd: 500,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should update swap volume achievement for existing achievement', () => {
        // Set initial achievements
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.swap,
          from: '0xwallet',
          chainId: Chains.BASE.chainId,
          typeData: {
            amountFromUsd: 500,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should create new swap volume achievement if none exists', () => {
        // Start with empty achievements for the wallet
        tierService.achievements = {
          '0xwallet': [],
        };

        const transaction = {
          type: TransactionTypes.swap,
          from: '0xwallet',
          typeData: {
            amountToUsd: 500,
          },
          chainId: Chains.BASE.chainId,
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should use amountToUsd if amountFromUsd is not available', () => {
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.swap,
          from: '0xwallet',
          typeData: {
            amountToUsd: 500,
          },
          chainId: Chains.BASE.chainId,
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should not update achievements when USD amount is not available', () => {
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.swap,
          from: '0xwallet',
          typeData: {},
          chainId: Chains.BASE.chainId,
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });
    });

    describe('other transaction types', () => {
      it('should not update achievements for non-swap transactions', () => {
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        for (const type in TransactionTypes) {
          const transaction = {
            type,
            from: '0xwallet',
            typeData: {
              amountFromUsd: 500,
            },
            chainId: Chains.BASE.chainId,
          } as unknown as TransactionDetails;

          tierService.updateAchievements(transaction);
        }

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.SWAP_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });
    });

    describe('migration transactions', () => {
      it('should update migrated volume achievement for earn create transaction', () => {
        // Set initial achievements
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.earnCreate,
          from: '0xwallet',
          typeData: {
            amountInUsd: 500,
            isMigration: true,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should update migrated volume achievement for earn increase transaction', () => {
        // Set initial achievements
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.earnIncrease,
          from: '0xwallet',
          typeData: {
            amountInUsd: 500,
            isMigration: true,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should create new migrated volume achievement if none exists', () => {
        // Start with empty achievements for the wallet
        tierService.achievements = {
          '0xwallet': [],
        };

        const transaction = {
          type: TransactionTypes.earnCreate,
          from: '0xwallet',
          typeData: {
            amountInUsd: 500,
            isMigration: true,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 500 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should not update achievements for non-migration earn transactions', () => {
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.earnCreate,
          from: '0xwallet',
          typeData: {
            amountInUsd: 500,
            isMigration: false,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });

      it('should not update achievements when USD amount is not available', () => {
        tierService.achievements = {
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        };

        const transaction = {
          type: TransactionTypes.earnCreate,
          from: '0xwallet',
          typeData: {
            isMigration: true,
          },
        } as TransactionDetails;

        tierService.updateAchievements(transaction);

        expect(tierService.achievements).toEqual({
          '0xwallet': [
            {
              achievement: { id: AchievementKeys.MIGRATED_VOLUME, achieved: 1000 },
              lastUpdated: mockedTodayMilis,
            },
          ],
        });
      });
    });
  });
});
