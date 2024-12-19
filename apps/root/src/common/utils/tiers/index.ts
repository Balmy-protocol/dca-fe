import { Achievement, ApiAchievement } from '@types';

export const parseAchievement = (achievement: ApiAchievement): Achievement => {
  return {
    id: achievement.id,
    achieved: typeof achievement.achieved === 'boolean' ? (achievement.achieved ? 1 : 0) : Number(achievement.achieved),
  };
};
