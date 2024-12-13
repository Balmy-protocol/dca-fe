import { AccountId, EarnInviteCode, Address, Achievement, User } from '@types';
import { EventsManager } from './eventsManager';
import Web3Service from './web3Service';
import MeanApiService from './meanApiService';

export const LAST_LOGIN_KEY = 'last_logged_in_with';
export const WALLET_SIGNATURE_KEY = 'wallet_auth_signature';
export const LATEST_SIGNATURE_VERSION = '1.0.2';
export interface TierServiceData {
  tier: number;
  inviteCodes: EarnInviteCode[];
  referrals: AccountId[];
  achievements: Record<Address, Achievement[]>;
}

const initialState: TierServiceData = { tier: 0, inviteCodes: [], referrals: [], achievements: {} };

// Mapping of achievement IDs to specific requirements
export enum AchievementKeys {
  SWAP_VOLUME = 'agg-swaps',
  DCA_SWAPS = 'dca-positions',
  TWEET = 'tweet_shared',
  MIGRATED_VOLUME = 'migrated_volume',
  OWNS_NFT = 'lobster-nft-holder',
  REFERRALS = 'referrals',
}

const SWAP_VOLUME_BY_TIER = {
  1: 500,
  2: 1000,
  3: 2000,
};

const REQUIRED_REFERRALS_BY_TIER = {
  1: 1,
  2: 3,
  3: 5,
};

// Tier definitions with requirements
const TIER_REQUIREMENTS = [
  {
    level: 3,
    requirements: (referrals: AccountId[], totalAchievements: Record<string, number>) =>
      referrals.length >= 5 &&
      (totalAchievements[AchievementKeys.SWAP_VOLUME] >= 2000 ||
        totalAchievements[AchievementKeys.MIGRATED_VOLUME] >= 2000),
  },
  {
    level: 2,
    requirements: (referrals: AccountId[], totalAchievements: Record<string, number>) =>
      referrals.length >= 3 &&
      (totalAchievements[AchievementKeys.SWAP_VOLUME] >= 1000 || totalAchievements[AchievementKeys.TWEET] === 1),
  },
  {
    level: 1,
    requirements: (referrals: AccountId[], totalAchievements: Record<string, number>) =>
      referrals.length >= 1 || totalAchievements[AchievementKeys.SWAP_VOLUME] >= 500,
  },
  {
    level: 0,
    requirements: () => true,
  },
];

export default class TierService extends EventsManager<TierServiceData> {
  web3Service: Web3Service;

  meanApiService: MeanApiService;

  constructor(web3Service: Web3Service, meanApiService: MeanApiService) {
    super(initialState);
    this.web3Service = web3Service;
    this.meanApiService = meanApiService;
  }

  get tier() {
    return this.serviceData.tier;
  }

  set tier(tier) {
    this.serviceData = { ...this.serviceData, tier };
  }

  get inviteCodes() {
    return this.serviceData.inviteCodes;
  }

  set inviteCodes(inviteCodes: EarnInviteCode[]) {
    this.serviceData = { ...this.serviceData, inviteCodes };
  }

  get referrals() {
    return this.serviceData.referrals;
  }

  set referrals(referrals: AccountId[]) {
    this.serviceData = { ...this.serviceData, referrals };
  }

  get achievements() {
    return this.serviceData.achievements;
  }

  set achievements(achievements: Record<Address, Achievement[]>) {
    this.serviceData = { ...this.serviceData, achievements };
  }

  setUserTier(tier: number) {
    this.tier = tier;
  }

  getUserTier() {
    return this.tier;
  }

  setInviteCodes(inviteCodes: EarnInviteCode[]) {
    this.inviteCodes = inviteCodes;
  }

  getInviteCodes() {
    return this.inviteCodes;
  }

  setReferrals(referrals: AccountId[]) {
    this.referrals = referrals;
  }

  getReferrals() {
    return this.referrals;
  }

  setAchievements(achievements: Record<Address, Achievement[]>) {
    this.achievements = achievements;
  }

  getAchievements() {
    return this.achievements;
  }

  calculateTotalAchievements(user: User, countOwnedWallets: boolean = true): Record<string, number> {
    const totalAchievements: Record<string, number> = {};

    for (const wallet of user.wallets) {
      if (countOwnedWallets && !wallet.isOwner) continue; // Only include achievements from owned wallets
      for (const achievement of wallet.achievements) {
        const key = achievement.id;
        const value = Number(achievement.achieved) || 0;
        totalAchievements[key] = (totalAchievements[key] || 0) + value;
      }
    }

    return totalAchievements;
  }

  calculateUserTier(user: User): number {
    const totalAchievements = this.calculateTotalAchievements(user);

    for (const tier of TIER_REQUIREMENTS) {
      if (tier.requirements(this.referrals, totalAchievements)) {
        return tier.level;
      }
    }

    return 0; // Default case if no tier is met
  }

  calculateAndSetUserTier() {
    const user = this.web3Service.accountService.user;
    if (!user) return;
    const level = this.calculateUserTier(user);
    this.setUserTier(level);
  }

  calculateMissingForNextTier(): {
    missing: Partial<Record<AchievementKeys, number | boolean>>;
    details: Partial<Record<AchievementKeys, { current: number; required: number }>>;
  } {
    const user = this.web3Service.accountService.user;
    const currentTier = this.tier;
    if (!user) return { missing: {}, details: {} };
    const totalAchievements = this.calculateTotalAchievements(user, false);
    const nextTier = TIER_REQUIREMENTS.find((tier) => tier.level === currentTier + 1);
    if (!nextTier) {
      return { missing: {}, details: {} };
    }

    // Containers for missing requirements and details
    const missing: Partial<Record<AchievementKeys, number | boolean>> = {};
    const details: Partial<Record<AchievementKeys, { current: number; required: number }>> = {};

    // Check what is missing for the next tier
    if (nextTier.level > currentTier) {
      // Referrals
      const requiredReferrals =
        REQUIRED_REFERRALS_BY_TIER[nextTier.level as keyof typeof REQUIRED_REFERRALS_BY_TIER] || 0;
      const currentReferrals = this.referrals.length;
      details.referrals = { current: currentReferrals, required: requiredReferrals };
      if (currentReferrals < requiredReferrals) {
        missing.referrals = requiredReferrals - currentReferrals;
      }

      // Swap Volume
      const requiredSwapVolume = SWAP_VOLUME_BY_TIER[nextTier.level as keyof typeof SWAP_VOLUME_BY_TIER] || 0;
      const currentSwapVolume = totalAchievements[AchievementKeys.SWAP_VOLUME] || 0;
      details[AchievementKeys.SWAP_VOLUME] = { current: currentSwapVolume, required: requiredSwapVolume };
      if (currentSwapVolume < requiredSwapVolume) {
        missing[AchievementKeys.SWAP_VOLUME] = requiredSwapVolume - currentSwapVolume;
      }

      // DCA Swaps (only for Tier 0)
      if (nextTier.level === 0) {
        const requiredDCASwaps = 30;
        const currentDCASwaps = totalAchievements[AchievementKeys.DCA_SWAPS] || 0;
        details[AchievementKeys.DCA_SWAPS] = { current: currentDCASwaps, required: requiredDCASwaps };
        if (currentDCASwaps < requiredDCASwaps) {
          missing[AchievementKeys.DCA_SWAPS] = requiredDCASwaps - currentDCASwaps;
        }
      }

      // Migration Volume
      if (nextTier.level === 3) {
        const requiredMigrationVolume = 2000;
        const currentMigrationVolume = totalAchievements[AchievementKeys.MIGRATED_VOLUME] || 0;
        details[AchievementKeys.MIGRATED_VOLUME] = {
          current: currentMigrationVolume,
          required: requiredMigrationVolume,
        };
        if (currentMigrationVolume < requiredMigrationVolume) {
          missing[AchievementKeys.MIGRATED_VOLUME] = requiredMigrationVolume - currentMigrationVolume;
        }
      }

      // Twitter Share
      if (nextTier.level === 2) {
        const currentTweet = totalAchievements[AchievementKeys.TWEET] === 1 ? 1 : 0;
        details[AchievementKeys.TWEET] = { current: currentTweet, required: 1 };
        if (currentTweet < 1) {
          missing[AchievementKeys.TWEET] = true;
        }
      }

      // NFT Ownership
      if (nextTier.level === 0) {
        const currentNFT = totalAchievements[AchievementKeys.OWNS_NFT] ? 1 : 0;
        details[AchievementKeys.OWNS_NFT] = { current: currentNFT, required: 1 };
        if (currentNFT < 1) {
          missing[AchievementKeys.OWNS_NFT] = true;
        }
      }
    }

    return { missing, details };
  }

  getProgressPercentageToNextTier(): {
    progress: number;
    missing: Partial<Record<AchievementKeys, number | boolean>>;
    details: Partial<Record<AchievementKeys, { current: number; required: number }>>;
  } {
    const { details, missing } = this.calculateMissingForNextTier();

    let totalRequirements = 0;
    let totalCompleted = 0;

    for (const key in details) {
      const { current, required } = details[key as keyof typeof details] || { current: 0, required: 0 };
      totalRequirements += required;
      totalCompleted += Math.min(current, required);
    }

    // Calculate percentage
    const progress = totalRequirements > 0 ? (totalCompleted / totalRequirements) * 100 : 0;

    return { progress: Math.min(progress, 100), missing, details };
  }

  async pollUser() {
    const signature = await this.web3Service.accountService.getWalletVerifyingSignature({});
    if (!signature) return;
    const accounts = await this.meanApiService.getAccounts({ signature });
    const account = accounts.accounts[0];

    this.setReferrals(account.referrals || []);
    this.setInviteCodes(account.earn?.inviteCodes || []);
    this.calculateAndSetUserTier();
  }
}
