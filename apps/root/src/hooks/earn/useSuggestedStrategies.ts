import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { Strategy, Token } from 'common-types';
import { intersectionBy, uniqBy } from 'lodash';
import React from 'react';
import useAllStrategies from './useAllStrategies';

export default function useSuggestedStrategies(
  selectedAsset?: { token: Token; chainsWithBalance: number[] },
  selectedReward?: { token: Token }
) {
  const strategies = useAllStrategies();

  return React.useMemo<Strategy[]>(() => {
    // Filtering strategies for the following cases, in order of priority:
    // Case 1: The strategy exists with the selected props, and user has asset balance
    // Case 2: The strategy exists with the selected props, but user has no asset balance
    // Case 3: The strategy exists with the selected asset
    const { strategiesWithAssetAndBalance, strategiesWithAssetNoBalance, strategiesWithReward } = strategies.reduce<{
      strategiesWithAssetAndBalance: Strategy[];
      strategiesWithAssetNoBalance: Strategy[];
      strategiesWithReward: Strategy[];
    }>(
      (acc, strategy) => {
        const isSameAsset =
          (selectedAsset && getIsSameOrTokenEquivalent(selectedAsset.token, strategy.asset)) ||
          (selectedReward && getIsSameOrTokenEquivalent(selectedReward.token, strategy.asset));
        const isSameReward =
          selectedReward &&
          strategy.rewards.tokens.some((strategyRewardToken) =>
            getIsSameOrTokenEquivalent(selectedReward.token, strategyRewardToken)
          );
        if (isSameAsset && selectedAsset && selectedAsset.chainsWithBalance.includes(strategy.network.chainId)) {
          acc.strategiesWithAssetAndBalance.push(strategy);
        } else if (isSameAsset) {
          acc.strategiesWithAssetNoBalance.push(strategy);
        }
        if (isSameReward) {
          acc.strategiesWithReward.push(strategy);
        }
        return acc;
      },
      {
        strategiesWithAssetAndBalance: [],
        strategiesWithAssetNoBalance: [],
        strategiesWithReward: [],
      }
    );

    const orderedStrategiesWithAsset = [...strategiesWithAssetAndBalance, ...strategiesWithAssetNoBalance];

    // Best selection (Case 1)
    const bestSelection = intersectionBy(orderedStrategiesWithAsset, strategiesWithReward, 'id');

    return uniqBy([...bestSelection, ...orderedStrategiesWithAsset], 'id');
  }, [strategies, selectedAsset, selectedReward]);
}
