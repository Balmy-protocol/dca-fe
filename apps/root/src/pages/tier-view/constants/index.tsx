import { defineMessage, MessageDescriptor } from 'react-intl';
import React from 'react';
import { TierGiftIcon, TierTicketDiscountIcon, TierChartIcon, TierMedalStarIcon } from 'ui-library';
import { TierRequirements, AchievementKeys } from 'common-types';

export const TIER_LEVEL_OPTIONS = [
  {
    key: 0,
    title: defineMessage({ description: 'tier-view.current-tier.tiers.tier-0', defaultMessage: 'Pioneer' }),
  },
  {
    key: 1,
    title: defineMessage({ description: 'tier-view.current-tier.tiers.tier-1', defaultMessage: 'Guardian' }),
  },
  {
    key: 2,
    title: defineMessage({ description: 'tier-view.current-tier.tiers.tier-2', defaultMessage: 'Expert' }),
  },
  {
    key: 3,
    title: defineMessage({ description: 'tier-view.current-tier.tiers.tier-3', defaultMessage: 'Master' }),
  },
  {
    key: 4,
    title: defineMessage({ description: 'tier-view.current-tier.tiers.tier-4', defaultMessage: 'Legend' }),
  },
];

export type TierReward = {
  title: MessageDescriptor;
  description: MessageDescriptor;
  icon: React.ReactNode;
  badge?: MessageDescriptor;
  comingSoon: boolean;
};

export type TierLevelReward = {
  description: MessageDescriptor;
  icon: React.ReactNode;
};

export const TIER_REWARDS: Record<number, TierReward[]> = {
  0: [
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-1.title',
        defaultMessage: 'Guardian security',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-1.description',
        defaultMessage: "Access the new era of protected DeFi earnings with Guardian's security",
      }),
      icon: <TierGiftIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-2.title',
        defaultMessage: 'Yield tracking',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-2.description',
        defaultMessage: 'Track yields across all your accounts in one powerful dashboard',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-3.title',
        defaultMessage: 'Realtime monitoring',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-3.description',
        defaultMessage: 'Real-time monitoring, performance analytics, and clear profit tracking',
      }),
      icon: <TierChartIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-4.title',
        defaultMessage: 'Pioneer Guardian NFT',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-0.reward-4.description',
        defaultMessage: 'Coming soon',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
      badge: undefined,
      comingSoon: true,
    },
  ],
  1: [
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-1.title',
        defaultMessage: 'All Pioneer benefits',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-1.description',
        defaultMessage: 'Enjoy all the exclusive benefits of Tier 0 and make the most of them!',
      }),
      icon: <TierGiftIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-2.title',
        defaultMessage: 'Exclusive monthly raffles',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-2.description',
        defaultMessage:
          'Entry into exclusive monthly raffles featuring: Limited edition Balmy merch, Cold storage wallets for upgrading your personal security, and more!',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-3.title',
        defaultMessage: 'Reduction on performance fees',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-3.description',
        defaultMessage: 'Benefit from a 25% off performance fees, keeping more of your earnings.',
      }),
      icon: <TierChartIcon fontSize="large" />,
      badge: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-3.badge',
        defaultMessage: 'Tier 2 · 50% fees!',
      }),
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-4.title',
        defaultMessage: 'Guardian NFT',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-1.reward-4.description',
        defaultMessage: 'Coming soon',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
      badge: undefined,
      comingSoon: true,
    },
  ],
  2: [
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-1.title',
        defaultMessage: 'All Guardian benefits',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-1.description',
        defaultMessage: 'Enjoy all the exclusive benefits of Tier 1 and make the most of them!',
      }),
      icon: <TierGiftIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-2.title',
        defaultMessage: 'Lower fees',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-2.description',
        defaultMessage: 'Benefit from a 50% off performance fees, keeping more of your earnings.',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
      badge: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-2.badge',
        defaultMessage: 'Tier 3 · ZERO fees!',
      }),
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-3.title',
        defaultMessage: 'Yield Strategies',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-3.description',
        defaultMessage: 'Access to advanced yield strategies with over 10,000 $OP in rewards',
      }),
      icon: <TierChartIcon fontSize="large" />,
      badge: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-3.badge',
        defaultMessage: 'Tier 3 · 50,000 $OP!',
      }),
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-4.title',
        defaultMessage: 'Expert NFT',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-2.reward-4.description',
        defaultMessage: 'Coming soon',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
      badge: undefined,
      comingSoon: true,
    },
  ],
  3: [
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-1.title',
        defaultMessage: 'All Expert benefits',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-1.description',
        defaultMessage: 'Enjoy all the exclusive benefits of Tier 2 and make the most of them!',
      }),
      icon: <TierGiftIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-2.title',
        defaultMessage: 'No fees',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-2.description',
        defaultMessage: 'No performance fees, keeping more of your earnings.',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-3.title',
        defaultMessage: 'Yield Strategies',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-3.description',
        defaultMessage: 'Access to advanced yield strategies with over 50,000 $OP in rewards',
      }),
      icon: <TierChartIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-4.title',
        defaultMessage: 'Master NFT',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-3.reward-4.description',
        defaultMessage: 'Coming soon',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
      badge: undefined,
      comingSoon: true,
    },
  ],
  4: [
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-4.reward-1.title',
        defaultMessage: 'All Master benefits',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-4.reward-1.description',
        defaultMessage: 'Enjoy all the exclusive benefits of Tier 3 and make the most of them!',
      }),
      icon: <TierGiftIcon fontSize="large" />,
      badge: undefined,
      comingSoon: false,
    },
    {
      title: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-4.reward-2.title',
        defaultMessage: 'Details classified',
      }),
      description: defineMessage({
        description: 'tier-view.current-tier.tiers.rewards.tier-4.reward-2.description',
        defaultMessage: 'More info coming soon',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
      badge: undefined,
      comingSoon: true,
    },
  ],
};

export const TIER_LEVEL_UP_REWARDS: Record<number, TierLevelReward[]> = {
  0: [
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-0.reward-1.description',
        defaultMessage: 'Guardian security',
      }),
      icon: <TierGiftIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-0.reward-2.description',
        defaultMessage: 'Yield tracking',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-0.reward-3.description',
        defaultMessage: 'Realtime monitoring',
      }),
      icon: <TierChartIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-0.reward-4.description',
        defaultMessage: 'Pioneer Guardian NFT',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
    },
  ],
  1: [
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-1.reward-2.description',
        defaultMessage: 'Exclusive monthly raffles',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-1.reward-3.description',
        defaultMessage: 'Reduction on performance fees',
      }),
      icon: <TierChartIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-1.reward-4.description',
        defaultMessage: 'Guardian NFT',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
    },
  ],
  2: [
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-2.reward-2.description',
        defaultMessage: 'Lower fees',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-2.reward-3.description',
        defaultMessage: 'Yield Strategies',
      }),
      icon: <TierChartIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-2.reward-4.description',
        defaultMessage: 'Expert NFT',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
    },
  ],
  3: [
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-3.reward-2.description',
        defaultMessage: 'No fees',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-3.reward-3.description',
        defaultMessage: 'Yield Strategies',
      }),
      icon: <TierChartIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-3.reward-4.description',
        defaultMessage: 'Master NFT',
      }),
      icon: <TierMedalStarIcon fontSize="large" />,
    },
  ],
  4: [
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-4.reward-1.description',
        defaultMessage: 'Details classified',
      }),
      icon: <TierGiftIcon fontSize="large" />,
    },
    {
      description: defineMessage({
        description: 'tier-view.verify-to-level-up-modal.rewards.tier-4.reward-2.description',
        defaultMessage: 'More info coming soon',
      }),
      icon: <TierTicketDiscountIcon fontSize="large" />,
    },
  ],
};

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
