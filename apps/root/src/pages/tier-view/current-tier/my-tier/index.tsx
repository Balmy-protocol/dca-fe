import useTierLevel from '@hooks/tiers/useTierLevel';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { colors, Typography, ActiveTiersIcons, ContainerBox, Grid } from 'ui-library';
import ProgressionRequeriments from '../progression-requeriments';

const StyledMyTierCard = styled(ContainerBox).attrs({ gap: 6, flex: 1 })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.quartery};
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
  `}
`;

const StyledTierProgressCard = styled(ContainerBox).attrs({ gap: 2, flexDirection: 'column', flex: 1 })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.tertiary};
    border: 1px solid ${colors[palette.mode].accent.accent400};
    border-radius: ${spacing(4)};
  `}
`;

const StyledTierLevelSpan = styled(Typography).attrs({ variant: 'h1Bold' })`
  ${({ theme: { palette } }) => `
    background: ${palette.gradient.tierLevel};
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const MyTier = () => {
  const { tierLevel, progress } = useTierLevel();

  const TierIcon = ActiveTiersIcons[tierLevel];
  return (
    <Grid container spacing={6}>
      {/* current tier */}
      <Grid item xs={12} md={6}>
        <StyledMyTierCard>
          <TierIcon size="4.8125rem" />
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              <FormattedMessage
                description="tier-view.current-tier.my-tier.title"
                defaultMessage="You are at <span>Tier {tierLevel}</span>"
                values={{
                  tierLevel,
                  span: (chunks) => <StyledTierLevelSpan>{chunks}</StyledTierLevelSpan>,
                }}
              />
            </Typography>
            {tierLevel < 4 && (
              <Typography variant="h4Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage
                  description="tier-view.current-tier.my-tier.subtitle"
                  defaultMessage="{percentage}% to Tier {nextTierLevel}"
                  values={{
                    percentage: progress,
                    nextTierLevel: tierLevel + 1,
                  }}
                />
              </Typography>
            )}
          </ContainerBox>
        </StyledMyTierCard>
      </Grid>

      {/* tier progress */}
      <Grid item xs={12} md={6}>
        <StyledTierProgressCard>
          <ContainerBox gap={1} justifyContent="space-between">
            <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
              <FormattedMessage
                description="tier-view.current-tier.my-tier.tier-progress.title"
                defaultMessage="Reach Tier {tierLevel} and unlock all its benefits!"
                values={{
                  tierLevel: tierLevel + 1,
                }}
              />
            </Typography>
          </ContainerBox>
          <ProgressionRequeriments />
        </StyledTierProgressCard>
      </Grid>
    </Grid>
  );
};

export default MyTier;
