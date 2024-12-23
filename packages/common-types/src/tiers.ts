import { AchievementKeys } from './account';

export interface TierSingleRequirement {
  id: AchievementKeys;
  value: number | boolean;
}

export interface TierConditionalRequirement {
  type: 'AND' | 'OR';
  requirements: (TierSingleRequirement | TierConditionalRequirement)[];
}

export interface TierRequirements {
  level: number;
  requirements: (TierSingleRequirement | TierConditionalRequirement)[];
}
