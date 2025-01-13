import React from 'react';
import { Token } from 'common-types';
import { ContainerBox, Grid, Typography, colors, StarEmoji, Grow } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import useSuggestedStrategies from '@hooks/earn/useSuggestedStrategies';
import StrategyCardItem from '@pages/earn/components/strategy-card-item';
import { DataCardVariants } from '@pages/strategy-guardian-detail/vault-data/components/data-cards';
import useTierLevel from '@hooks/tiers/useTierLevel';

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
  const themeMode = useThemeMode();
  const suggested = useSuggestedStrategies(selectedAsset, selectedReward);
  const { tierLevel } = useTierLevel();

  return (
    <ContainerBox flexDirection="column" gap={5}>
      <ContainerBox gap={2} alignItems="center">
        <StarEmoji />
        <Typography variant="h2Bold" color={colors[themeMode].typography.typo1}>
          <FormattedMessage defaultMessage="Top Vaults" description="earn.wizard.suggestedStrategies.title" />
        </Typography>
      </ContainerBox>
      <Grid container spacing={6}>
        {suggested.slice(0, 3).map((strategy, index) => (
          <Grow in timeout={(index + 1) * 1000} key={strategy.id}>
            <Grid item xs={12} md={6} lg={4}>
              <StrategyCardItem strategy={strategy} variant={DataCardVariants.Home} tierLevel={tierLevel ?? 0} />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </ContainerBox>
  );
};

export default SuggestedStrategies;
