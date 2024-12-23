import { Achievement, ApiAchievement, TierConditionalRequirement, TierSingleRequirement } from '@types';

export const parseAchievement = (achievement: ApiAchievement): Achievement => {
  return {
    id: achievement.id,
    achieved: typeof achievement.achieved === 'boolean' ? (achievement.achieved ? 1 : 0) : Number(achievement.achieved),
  };
};

export const isSingleRequirement = (
  requirement: TierSingleRequirement | TierConditionalRequirement
): requirement is TierSingleRequirement => {
  return (requirement as TierSingleRequirement).id !== undefined;
};
