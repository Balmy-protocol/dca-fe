import React from 'react';
import { Strategy, Token } from 'common-types';
import styled from 'styled-components';
import {
  BackgroundPaper,
  Button,
  ContainerBox,
  Grid,
  Typography,
  colors,
  StarEmoji,
  KeyboardArrowRightIcon,
} from 'ui-library';
import DataCards, { DataCardVariants } from '@pages/strategy-guardian-detail/vault-data/components/data-cards';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { FormattedMessage } from 'react-intl';
import useAllStrategies from '@hooks/earn/useAllStrategies';
import { getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { intersectionBy, uniqBy } from 'lodash';
import usePushToHistory from '@hooks/usePushToHistory';
import { useThemeMode } from '@state/config/hooks';

interface SugestedStrategyCardProps {
  strategy: Strategy;
}

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background: ${colors[palette.mode].background.tertiary};
    box-shadow: ${colors[palette.mode].dropShadow.dropShadow300};
  `}
`;

const SuggestedStrategyCard = ({ strategy }: SugestedStrategyCardProps) => {
  const pushToHistory = usePushToHistory();
  const handleViewStrategy = () => {
    pushToHistory(`/earn/${strategy.network.chainId}/vaults/${strategy.id}`);
  };

  return (
    <StyledPaper>
      <ContainerBox flexDirection="column" alignItems="stretch" gap={5}>
        <ContainerBox justifyContent="space-between" alignItems="center">
          <ContainerBox gap={2} alignItems="center">
            <TokenIconWithNetwork token={strategy.asset} />
            <Typography variant="bodySmallRegular">{strategy.asset.symbol}</Typography>
          </ContainerBox>
          <Typography variant="bodySmallRegular">{strategy.farm.name}</Typography>
        </ContainerBox>
        <DataCards strategy={strategy} dataCardsGap={2} variant={DataCardVariants.Wizard} />
        <Button
          variant="text"
          color="primary"
          onClick={handleViewStrategy}
          fullWidth
          endIcon={<KeyboardArrowRightIcon />}
        >
          <FormattedMessage description="earn.wizard.suggestedStrategies.button" defaultMessage="View Vault" />
        </Button>
      </ContainerBox>
    </StyledPaper>
  );
};

interface SuggestedStrategiesProps {
  selectedAsset: {
    chainsWithBalance: number[];
    token: Token;
  };
  selectedReward: {
    token: Token;
  };
}
const SuggestedStrategies = ({ selectedAsset, selectedReward }: SuggestedStrategiesProps) => {
  const { strategies } = useAllStrategies();
  const themeMode = useThemeMode();

  const suggested = React.useMemo<Strategy[]>(() => {
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
        const isSameAsset = getIsSameOrTokenEquivalent(selectedAsset.token, strategy.asset);
        const isSameReward = strategy.rewards.tokens.some((strategyRewardToken) =>
          getIsSameOrTokenEquivalent(selectedReward.token, strategyRewardToken)
        );
        if (isSameAsset && selectedAsset.chainsWithBalance.includes(strategy.farm.chainId)) {
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

  return (
    <ContainerBox flexDirection="column" gap={5}>
      <ContainerBox gap={2} alignItems="center">
        <StarEmoji />
        <Typography variant="h4Bold" color={colors[themeMode].typography.typo1}>
          <FormattedMessage defaultMessage="Top Vaults" description="earn.wizard.suggestedStrategies.title" />
        </Typography>
      </ContainerBox>
      <Grid container spacing={6}>
        {suggested.slice(0, 3).map((strategy) => (
          <Grid item xs={12} md={6} xl={4} key={strategy.id}>
            <SuggestedStrategyCard key={strategy.id} strategy={strategy} />
          </Grid>
        ))}
      </Grid>
    </ContainerBox>
  );
};

export default SuggestedStrategies;
