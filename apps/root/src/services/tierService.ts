import {
  AccountId,
  EarnInviteCode,
  User,
  AchievementKeys,
  Achievement,
  Address,
  ApiAchievement,
  TierSingleRequirement,
  TierConditionalRequirement,
  TierRequirements,
} from '@types';
import { EventsManager } from './eventsManager';
import Web3Service from './web3Service';
import MeanApiService from './meanApiService';
import { isSingleRequirement, parseAchievement } from '@common/utils/tiers';

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

// Tier definitions with requirements
export const TIER_REQUIREMENTS: TierRequirements[] = [
  {
    level: 3,
    requirements: [
      {
        type: 'AND',
        requirements: [
          { id: AchievementKeys.REFERRALS, value: 5 },
          {
            type: 'OR',
            requirements: [
              { id: AchievementKeys.SWAP_VOLUME, value: 2000 },
              { id: AchievementKeys.MIGRATED_VOLUME, value: 2000 },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 2,
    requirements: [
      {
        type: 'AND',
        requirements: [
          { id: AchievementKeys.REFERRALS, value: 3 },
          {
            type: 'OR',
            requirements: [
              { id: AchievementKeys.SWAP_VOLUME, value: 1000 },
              { id: AchievementKeys.TWEET, value: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 1,
    requirements: [
      {
        type: 'OR',
        requirements: [
          { id: AchievementKeys.REFERRALS, value: 1 },
          { id: AchievementKeys.SWAP_VOLUME, value: 500 },
        ],
      },
    ],
  },
  {
    level: 0,
    requirements: [],
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

  setAchievements(wallets: Address[], achievements: Record<Address, ApiAchievement[]>, twitterShare: boolean) {
    const baseAchievements = wallets.reduce<Record<Address, Achievement[]>>(
      (acc, address) => {
        // eslint-disable-next-line no-param-reassign
        acc[address] = [];
        return acc;
      },
      {} as Record<Address, Achievement[]>
    );

    const achievementsByWallet = Object.fromEntries(
      Object.entries(baseAchievements).map(([address]) => {
        const walletAchievements = (achievements[address as Address] || []).map(parseAchievement);
        if (twitterShare) {
          walletAchievements.push({ id: AchievementKeys.TWEET, achieved: 1 });
        }
        return [address, walletAchievements];
      })
    );

    this.achievements = achievementsByWallet;
  }

  getAchievements() {
    return this.achievements;
  }

  calculateTotalAchievements(user: User, countOwnedWallets: boolean = true): Record<string, number> {
    const totalAchievements: Record<string, number> = {};

    for (const wallet of user.wallets) {
      if (countOwnedWallets && !wallet.isOwner) continue; // Only include achievements from owned wallets
      const walletAchievements = this.achievements[wallet.address] || [];
      for (const achievement of walletAchievements) {
        const key = achievement.id;
        const value = Number(achievement.achieved) || 0;
        totalAchievements[key] = (totalAchievements[key] || 0) + value;
      }
    }

    const referrals = this.referrals.length;
    totalAchievements[AchievementKeys.REFERRALS] = referrals;

    return totalAchievements;
  }

  calculateUserTier(user: User): number {
    const totalAchievements = this.calculateTotalAchievements(user, true); // Owned wallets only

    const evaluateSingleRequirement = (requirement: TierSingleRequirement): boolean => {
      const currentValue = totalAchievements[requirement.id] || 0;
      if (typeof requirement.value === 'number') {
        return currentValue >= requirement.value;
      }
      return !!currentValue === requirement.value; // Ensure boolean matches
    };

    const evaluateConditionalRequirement = (requirement: TierConditionalRequirement): boolean => {
      if (requirement.type === 'AND') {
        return requirement.requirements.every((req) =>
          isSingleRequirement(req) ? evaluateSingleRequirement(req) : evaluateConditionalRequirement(req)
        );
      } else if (requirement.type === 'OR') {
        return requirement.requirements.some((req) =>
          isSingleRequirement(req) ? evaluateSingleRequirement(req) : evaluateConditionalRequirement(req)
        );
      }
      return false;
    };

    for (const tier of TIER_REQUIREMENTS.sort((a, b) => b.level - a.level)) {
      const meetsRequirements = tier.requirements.every((requirement) =>
        isSingleRequirement(requirement)
          ? evaluateSingleRequirement(requirement)
          : evaluateConditionalRequirement(requirement)
      );

      if (meetsRequirements) {
        return tier.level;
      }
    }

    return 0; // Default to Tier 0 if no higher tiers are met
  }

  calculateMissingForNextTier(): {
    missing: Record<string, { current: number; required: number }>;
    details: Record<string, { current: number; required: number }>;
    walletsToVerify: string[];
  } {
    const user = this.web3Service.accountService.user;
    if (!user) return { missing: {}, details: {}, walletsToVerify: [] };

    const currentTierLevel = this.tier;
    const totalAchievementsOwned = this.calculateTotalAchievements(user, true);
    const totalAchievementsAll = this.calculateTotalAchievements(user, false);

    const nextTier = TIER_REQUIREMENTS.find((tier) => tier.level === currentTierLevel + 1);
    if (!nextTier) {
      return { missing: {}, details: {}, walletsToVerify: [] };
    }

    const missing: Record<string, { current: number; required: number }> = {};
    const details: Record<string, { current: number; required: number }> = {};
    const walletsToVerify: string[] = [];

    const evaluateSingleRequirement = (requirement: TierSingleRequirement): boolean => {
      const currentOwned = totalAchievementsOwned[requirement.id] || 0;
      const currentTotal = totalAchievementsAll[requirement.id] || 0;
      const requiredValue = requirement.value;

      // Always add to details
      details[requirement.id] = {
        current: currentTotal,
        required: Number(requiredValue),
      };

      // Add to missing if not met by owned wallets
      if (currentOwned < Number(requiredValue)) {
        missing[requirement.id] = {
          current: currentOwned,
          required: Number(requiredValue),
        };

        // Check if non-owned wallets could help
        if (currentTotal > currentOwned) {
          walletsToVerify.push(
            ...user.wallets
              .filter(
                (wallet) =>
                  !wallet.isOwner &&
                  this.achievements[wallet.address]?.some(
                    (achievement) => achievement.id === requirement.id && Number(achievement.achieved) > 0
                  )
              )
              .map((wallet) => wallet.address)
          );
        }
        return false;
      }
      return true;
    };

    const evaluateConditionalRequirement = (requirement: TierConditionalRequirement): boolean => {
      if (requirement.type === 'AND') {
        const results = requirement.requirements.map((req) =>
          isSingleRequirement(req) ? evaluateSingleRequirement(req) : evaluateConditionalRequirement(req)
        );
        return results.every((result) => result);
      } else if (requirement.type === 'OR') {
        // Always evaluate all requirements to populate details and missing
        const results = requirement.requirements.map((req) =>
          isSingleRequirement(req) ? evaluateSingleRequirement(req) : evaluateConditionalRequirement(req)
        );

        // If any requirement is met, we can remove its alternatives from missing
        if (results.some((result) => result)) {
          requirement.requirements.forEach((req) => {
            if (isSingleRequirement(req)) {
              delete missing[req.id];
            }
          });
        }

        return results.some((result) => result);
      }
      return false;
    };

    nextTier.requirements.forEach((requirement) => {
      if (isSingleRequirement(requirement)) {
        evaluateSingleRequirement(requirement);
      } else {
        evaluateConditionalRequirement(requirement);
      }
    });

    return { missing, details, walletsToVerify };
  }

  getProgressPercentageToNextTier(): {
    progress: number;
    missing: Record<string, { current: number; required: number }>;
    details: Record<string, { current: number; required: number }>;
  } {
    const user = this.web3Service.accountService.user;
    if (!user) {
      return {
        progress: 0,
        missing: {},
        details: {},
      };
    }

    const currentTierLevel = this.tier;
    const nextTier = TIER_REQUIREMENTS.find((tier) => tier.level === currentTierLevel + 1);
    if (!nextTier) {
      return {
        progress: 100,
        missing: {},
        details: {},
      };
    }

    const { missing, details } = this.calculateMissingForNextTier();

    // Calculate progress based on all requirements for next tier
    const totalAchievements = this.calculateTotalAchievements(user, true);
    let totalProgress = 0;
    let totalRequirements = 0;

    const calculateRequirementProgress = (requirement: TierSingleRequirement | TierConditionalRequirement): number => {
      if (isSingleRequirement(requirement)) {
        const current = totalAchievements[requirement.id] || 0;
        const required = requirement.value as number;
        return Math.min(current / required, 1);
      } else if (requirement.type === 'AND') {
        let andProgress = 0;
        requirement.requirements.forEach((req) => {
          andProgress += calculateRequirementProgress(req);
        });
        return andProgress / requirement.requirements.length;
      } else if (requirement.type === 'OR') {
        // For OR conditions, take the maximum progress among the requirements
        return Math.max(...requirement.requirements.map((req) => calculateRequirementProgress(req)));
      }
      return 0;
    };

    nextTier.requirements.forEach((requirement) => {
      totalProgress += calculateRequirementProgress(requirement);
      totalRequirements += 1;
    });

    const progress = totalRequirements > 0 ? Number(((totalProgress / totalRequirements) * 100).toFixed(2)) : 0;

    return {
      progress: Math.min(progress, 100),
      missing,
      details,
    };
  }

  async pollUser() {
    const signature = await this.web3Service.accountService.getWalletVerifyingSignature({});
    if (!signature) return;
    const accounts = await this.meanApiService.getAccounts({ signature });
    const account = accounts.accounts[0];

    this.setReferrals(account.earn?.referrals || []);
    this.setInviteCodes(account.earn?.inviteCodes || []);
    this.setAchievements(
      account.wallets.map((wallet) => wallet.address),
      account.earn?.achievements || {},
      account.earn?.twitterShare || false
    );
    this.calculateAndSetUserTier();
  }

  calculateAndSetUserTier() {
    const user = this.web3Service.accountService.user;
    if (!user) return;
    const level = this.calculateUserTier(user);
    this.setUserTier(level);
  }
}
