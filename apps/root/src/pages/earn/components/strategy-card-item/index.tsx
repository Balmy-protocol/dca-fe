import React from 'react';
import { Strategy } from 'common-types';
import styled from 'styled-components';
import { Button, ContainerBox, Typography, colors, Card, AnimatedChevronRightIcon, Skeleton } from 'ui-library';
import DataCards, { DataCardVariants } from '@pages/strategy-guardian-detail/vault-data/components/data-cards';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { FormattedMessage } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import ComposedTokenIcon from '@common/components/composed-token-icon';

interface SugestedStrategyCardProps {
  strategy: Strategy;
  variant?: DataCardVariants;
}

const StyledCard = styled(Card).attrs({ variant: 'outlined' })`
  ${({ theme: { palette, spacing } }) => `
      padding: ${spacing(6)};
      box-shadow: ${colors[palette.mode].dropShadow.dropShadow300};
    `}
`;

const StrategyCardItem = ({ strategy, variant }: SugestedStrategyCardProps) => {
  const pushToHistory = usePushToHistory();
  const [hovered, setHovered] = React.useState(false);
  const handleViewStrategy = () => {
    pushToHistory(`/earn/vaults/${strategy.network.chainId}/${strategy.id}`);
  };

  return (
    <StyledCard>
      <ContainerBox flexDirection="column" alignItems="stretch" gap={5}>
        <ContainerBox justifyContent="space-between" alignItems="center">
          <ContainerBox gap={2} alignItems="center">
            <TokenIconWithNetwork token={strategy.asset} />
            <Typography variant="bodySemibold">{strategy.asset.symbol}</Typography>
            {strategy.rewards.tokens.length > 0 && (
              <>
                {` · `}
                <Typography variant="bodyRegular">
                  <FormattedMessage description="earn.strategy-card.rewards" defaultMessage="Rewards" />
                </Typography>
                <ComposedTokenIcon size={8} tokens={strategy.rewards.tokens} />
              </>
            )}
          </ContainerBox>
          <Typography variant="bodySmallRegular">{strategy.farm.name}</Typography>
        </ContainerBox>
        <DataCards strategy={strategy} dataCardsGap={2} variant={variant} />
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
            <FormattedMessage description="earn.strategy-card.button" defaultMessage="View Vault" />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </StyledCard>
  );
};

const SkeletonStrategyCardItem = () => (
  <StyledCard>
    <ContainerBox flexDirection="column" alignItems="stretch" gap={5}>
      <ContainerBox justifyContent="space-between" alignItems="center">
        <ContainerBox gap={2} alignItems="center">
          <Skeleton variant="circular" width={32} height={32} />
          <Typography variant="bodySemibold">
            <Skeleton width="6ch" variant="text" />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton width="6ch" variant="text" />
          </Typography>
          <Skeleton variant="circular" width={32} height={32} />
        </ContainerBox>
        <Typography variant="bodySmallRegular">
          <Skeleton width="100%" variant="text" />
        </Typography>
      </ContainerBox>
      <DataCards dataCardsGap={2} variant={DataCardVariants.Home} />
      <ContainerBox fullWidth justifyContent="center">
        <Button variant="text" color="primary" fullWidth disabled>
          <Skeleton width={80} />
        </Button>
      </ContainerBox>
    </ContainerBox>
  </StyledCard>
);

StrategyCardItem.Skeleton = SkeletonStrategyCardItem;

export default StrategyCardItem;
