import { createMockInstance } from '@common/utils/tests';
import TierService from './tierService';
import Web3Service from './web3Service';
import MeanApiService, { AccountWithConfig } from './meanApiService';
import { AchievementKeys, User, Wallet, WalletType, WalletStatus } from '@types';
import AccountService from './accountService';

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
  achievements: [],
  ...props,
});

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
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '1000' }],
          }),
          createTestWallet({
            address: '0x2',
            isOwner: false,
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x123', '0x456']); // 2 referrals

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
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '1000' }],
          }),
          createTestWallet({
            address: '0x2',
            isOwner: false,
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x123', '0x456', '0x789', '0x101', '0x102']); // 5 referrals

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
            achievements: [],
          }),
        ],
      } as User;

      tierService.setReferrals([]); // 0 referrals

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(0);
    });

    it('should return tier 1 when meeting basic requirements', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
          }),
        ],
      } as User;

      tierService.setReferrals([]); // Tier 1 can be reached with just swap volume

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(1);
    });

    it('should return tier 2 when meeting AND/OR conditions', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
            achievements: [{ id: AchievementKeys.TWEET, achieved: '1' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x1', '0x2', '0x3']); // 3 referrals

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(2);
    });

    it('should return tier 2 when meeting AND/OR conditions with swap volume', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '1000' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x1', '0x2', '0x3']); // 3 referrals

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(2);
    });

    it('should return tier 3 when meeting highest requirements', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
            achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '2000' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x1', '0x2', '0x3', '0x4', '0x5']); // 5 referrals

      const result = tierService.calculateUserTier(user);
      expect(result).toBe(3);
    });

    it('should return tier 3 when meeting highest requirements with migrated volume', () => {
      const user: User = {
        wallets: [
          createTestWallet({
            address: '0x1',
            isOwner: true,
            achievements: [{ id: AchievementKeys.MIGRATED_VOLUME, achieved: '2000' }],
          }),
        ],
      } as User;

      tierService.setReferrals(['0x1', '0x2', '0x3', '0x4', '0x5']); // 5 referrals

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
              achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals(['0x1', '0x2']); // 2 referrals
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
      const result = tierService.calculateMissingForNextTier();

      expect(result.missing).toEqual({
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
        [AchievementKeys.REFERRALS]: { current: 2, required: 3 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 2, required: 3 },
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
              achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
            }),
            createTestWallet({
              address: '0x2',
              isOwner: false,
              achievements: [{ id: AchievementKeys.TWEET, achieved: '1' }],
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals(['0x1', '0x2', '0x3']); // 3 referrals (meets the AND condition)
      tierService.setUserTier(1);

      const result = tierService.calculateMissingForNextTier();

      // For Tier 2, we need either SWAP_VOLUME >= 1000 OR TWEET >= 1
      expect(result.missing).toEqual({
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 3, required: 3 },
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 1, required: 1 },
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
              achievements: [{ id: AchievementKeys.SWAP_VOLUME, achieved: '500' }],
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals(['0x123', '0x456']); // 2 referrals

      tierService.setUserTier(1);
      const result = tierService.getProgressPercentageToNextTier();

      // For Tier 2, we need:
      // - 3 referrals (currently have 2/3 = 66.67%)
      // - AND either 1000 swap volume OR 1 tweet (currently have 500/1000 = 50%)
      expect(result.progress).toBe(58.33);
      expect(result.missing).toEqual({
        [AchievementKeys.REFERRALS]: { current: 2, required: 3 },
        [AchievementKeys.SWAP_VOLUME]: { current: 500, required: 1000 },
        [AchievementKeys.TWEET]: { current: 0, required: 1 },
      });
      expect(result.details).toEqual({
        [AchievementKeys.REFERRALS]: { current: 2, required: 3 },
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
              achievements: [],
            }),
          ],
        } as User,
      } as AccountService;

      web3Service.accountService = mockAccountService;
      tierService.setReferrals([]); // 0 referrals

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
            referrals: ['0x123'],
            earn: {
              inviteCodes: ['CODE1'],
            },
          },
        ],
      };

      const mockAccountService = {
        getWalletVerifyingSignature: jest.fn().mockResolvedValue(mockSignature),
      } as unknown as AccountService;

      web3Service.accountService = mockAccountService;
      meanApiService.getAccounts.mockResolvedValue(mockAccounts as unknown as { accounts: AccountWithConfig[] });

      await tierService.pollUser();

      expect(tierService.getReferrals()).toEqual(['0x123']);
      expect(tierService.getInviteCodes()).toEqual(['CODE1']);
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
});
