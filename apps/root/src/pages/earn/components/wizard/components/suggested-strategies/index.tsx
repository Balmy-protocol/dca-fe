import React from 'react';
import { Strategy, Token } from 'common-types';
import styled from 'styled-components';
import {
  Button,
  ContainerBox,
  Grid,
  Typography,
  colors,
  StarEmoji,
  Grow,
  Card,
  AnimatedChevronRightIcon,
} from 'ui-library';
import DataCards, { DataCardVariants } from '@pages/strategy-guardian-detail/vault-data/components/data-cards';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { FormattedMessage } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import { useThemeMode } from '@state/config/hooks';
import useSuggestedStrategies from '@hooks/earn/useSuggestedStrategies';

interface SugestedStrategyCardProps {
  strategy: Strategy;
}

const StyledCard = styled(Card).attrs({ variant: 'outlined' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    box-shadow: ${colors[palette.mode].dropShadow.dropShadow300};
  `}
`;

const SuggestedStrategyCard = ({ strategy }: SugestedStrategyCardProps) => {
  const pushToHistory = usePushToHistory();
  const [hovered, setHovered] = React.useState(false);
  const handleViewStrategy = () => {
    pushToHistory(`/earn/${strategy.network.chainId}/vaults/${strategy.id}`);
  };

  return (
    <StyledCard>
      <ContainerBox flexDirection="column" alignItems="stretch" gap={5}>
        <ContainerBox justifyContent="space-between" alignItems="center">
          <ContainerBox gap={2} alignItems="center">
            <TokenIconWithNetwork token={strategy.asset} />
            <Typography variant="bodySmallRegular">{strategy.asset.symbol}</Typography>
          </ContainerBox>
          <Typography variant="bodySmallRegular">{strategy.farm.name}</Typography>
        </ContainerBox>
        <DataCards strategy={strategy} dataCardsGap={2} variant={DataCardVariants.Wizard} />
        <ContainerBox fullWidth justifyContent="center">
          <Button
            variant="text"
            color="primary"
            onClick={handleViewStrategy}
            fullWidth
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            endIcon={<AnimatedChevronRightIcon $hovered={hovered} color="primary" />}
          >
            <FormattedMessage description="earn.wizard.suggestedStrategies.button" defaultMessage="View Vault" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </StyledCard>
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
  const themeMode = useThemeMode();
  const suggested = useSuggestedStrategies(selectedAsset, selectedReward);

  return (
    <ContainerBox flexDirection="column" gap={5}>
      <ContainerBox gap={2} alignItems="center">
        <StarEmoji />
        <Typography variant="h4Bold" color={colors[themeMode].typography.typo1}>
          <FormattedMessage defaultMessage="Top Vaults" description="earn.wizard.suggestedStrategies.title" />
        </Typography>
      </ContainerBox>
      <Grid container spacing={6}>
        {suggested.slice(0, 3).map((strategy, index) => (
          <Grow in timeout={(index + 1) * 1000} key={strategy.id}>
            <Grid item xs={12} md={6} xl={4}>
              <SuggestedStrategyCard strategy={strategy} />
            </Grid>
          </Grow>
        ))}
      </Grid>
    </ContainerBox>
  );
};

export default SuggestedStrategies;
