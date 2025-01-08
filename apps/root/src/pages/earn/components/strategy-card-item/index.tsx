import React from 'react';
import { Strategy, StrategyConditionType } from 'common-types';
import styled from 'styled-components';
import { Button, ContainerBox, Typography, colors, Card, Skeleton } from 'ui-library';
import DataCards, { DataCardVariants } from '@pages/strategy-guardian-detail/vault-data/components/data-cards';
import TokenIconWithNetwork from '@common/components/token-icon-with-network';
import { FormattedMessage } from 'react-intl';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { Link } from 'react-router-dom';
import { PROMOTED_STRATEGIES_IDS } from '@constants/earn';
import PromotedFlag from '../strategies-table/components/promoted-flag';

interface SugestedStrategyCardProps {
  strategy: Strategy;
  variant?: DataCardVariants;
  tierLevel: number;
}

const StyledLink = styled(Link)`
  text-decoration: none;
  text-align: center;
  ${({ theme: { palette, spacing } }) => `
    color: ${colors[palette.mode].accentPrimary};
    margin-top: ${spacing(2)};
  `}
`;

const StyledCard = styled(Card).attrs({ variant: 'outlined' })<{ $condition?: StrategyConditionType }>`
  ${({ theme: { palette, spacing }, $condition }) => `
      padding: ${spacing(6)};
      box-shadow: ${colors[palette.mode].dropShadow.dropShadow300};
      display: flex;
      flex-direction: column;
      gap: ${spacing(4)};
      ${
        $condition === StrategyConditionType.PROMOTED &&
        `
          overflow: visible;
          position: relative;
          outline-color: ${colors[palette.mode].semantic.success.darker};
          outline-width: 1.5px;
        `
      }
      ${
        $condition === StrategyConditionType.LOCKED &&
        `
          position: relative;
          outline-color: ${colors[palette.mode].accentPrimary};
          outline-width: 1.5px;
        `
      }
    `}
`;

const StrategyCardItem = ({ strategy, variant, tierLevel }: SugestedStrategyCardProps) => {
  const isPromoted = PROMOTED_STRATEGIES_IDS.includes(strategy.id);
  const isLocked = Boolean(strategy.needsTier && strategy.needsTier > tierLevel);
  const condition = isLocked ? StrategyConditionType.LOCKED : isPromoted ? StrategyConditionType.PROMOTED : undefined;

  return (
    <StyledCard $condition={condition}>
      <ContainerBox justifyContent="space-between" alignItems="center">
        <ContainerBox gap={2} alignItems="center">
          <TokenIconWithNetwork token={strategy.asset} />
          <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].typography.typo2}>
            {strategy.asset.symbol}
          </Typography>
          {strategy.rewards.tokens.length > 0 && (
            <>
              {` · `}
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="earn.strategy-card.rewards" defaultMessage="Rewards" />
              </Typography>
              <ComposedTokenIcon size={8} tokens={strategy.rewards.tokens} />
            </>
          )}
        </ContainerBox>
        <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
          {strategy.farm.name}
        </Typography>
      </ContainerBox>
      <DataCards
        strategy={strategy}
        dataCardsGap={2}
        variant={variant}
        isLocked={condition === StrategyConditionType.LOCKED}
      />
      <StyledLink to={`/earn/vaults/${strategy.network.chainId}/${strategy.id}`}>
        <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].accentPrimary}>
          <FormattedMessage description="earn.strategy-card.button" defaultMessage="View Vault" />
        </Typography>
      </StyledLink>
      {condition === StrategyConditionType.PROMOTED && <PromotedFlag isCard tier={strategy.needsTier} />}
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
