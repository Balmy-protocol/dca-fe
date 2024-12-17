import useTierLevel from '@hooks/tiers/useTierLevel';
import React, { createElement } from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  Typography,
  ActiveTiersIcons,
  ContainerBox,
  Button,
  Grid,
  Profile2UsersIcon,
  CheckCircleOutlineIcon,
} from 'ui-library';
import { AchievementKeys } from '@services/tierService';

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

const MESSAGES_BY_MISSING_ACHIEVEMENTS: Record<AchievementKeys, MessageDescriptor> = {
  [AchievementKeys.SWAP_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-swap-volume',
    defaultMessage: 'Swap ${missing}',
  }),
  [AchievementKeys.DCA_SWAPS]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-dca-swaps',
    defaultMessage: 'Make {missing} more DCA swaps',
  }),
  [AchievementKeys.MIGRATED_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-migrated-volume',
    defaultMessage: 'Migrate ${missing} more liquidity',
  }),
  [AchievementKeys.TWEET]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-tweet',
    defaultMessage: 'Share a tweet',
  }),
  [AchievementKeys.OWNS_NFT]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-owns-nft',
    defaultMessage: 'Own the Lobster NFT',
  }),
  [AchievementKeys.REFERRALS]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-referrals',
    defaultMessage: 'Refer <b>{missing} more people</b>',
  }),
};

const MyTier = () => {
  const { tierLevel, progress, missing, details } = useTierLevel();
  const intl = useIntl();

  const missingReferrals = missing[AchievementKeys.REFERRALS];
  const missingMessages = Object.entries(details)
    .filter(([key]) => (key as AchievementKeys) !== AchievementKeys.REFERRALS)
    .map(([achievementKey]) => {
      const message = MESSAGES_BY_MISSING_ACHIEVEMENTS[achievementKey as AchievementKeys];
      return {
        key: achievementKey,
        message: intl.formatMessage(message, {
          missing: missing[achievementKey as AchievementKeys],
          b: (chunks) => <b>{chunks}</b>,
        }),
      };
    });

  return (
    <Grid container spacing={6}>
      {/* current tier */}
      <Grid item xs={12} md={6}>
        <StyledMyTierCard>
          {createElement(ActiveTiersIcons[tierLevel], { size: '4.8125rem' })}
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
          <ContainerBox gap={1} justifyContent="space-between">
            <ContainerBox gap={1} flexDirection="column">
              <ContainerBox gap={1} alignItems="center">
                {Number(missingReferrals) > 0 ? (
                  <Profile2UsersIcon sx={{ color: ({ palette }) => colors[palette.mode].typography.typo3 }} />
                ) : (
                  <CheckCircleOutlineIcon color="success" />
                )}
                <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
                  {intl.formatMessage(MESSAGES_BY_MISSING_ACHIEVEMENTS[AchievementKeys.REFERRALS], {
                    missing: missingReferrals,
                    b: (chunks) => <b>{chunks}</b>,
                  })}
                </Typography>
              </ContainerBox>
              {missingMessages.map((message, index) => (
                <ContainerBox key={index} gap={1} alignItems="center">
                  {missing[message.key as AchievementKeys] ? (
                    <CheckCircleOutlineIcon sx={{ color: ({ palette }) => colors[palette.mode].typography.typo3 }} />
                  ) : (
                    <CheckCircleOutlineIcon color="success" />
                  )}
                  <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
                    {message.message}
                  </Typography>
                </ContainerBox>
              ))}
            </ContainerBox>
            <Button variant="text" size="small" sx={{ alignSelf: 'flex-end' }}>
              <FormattedMessage
                description="tier-view.current-tier.my-tier.tier-progress.button"
                defaultMessage="How to level up?"
              />
            </Button>
          </ContainerBox>
        </StyledTierProgressCard>
      </Grid>
    </Grid>
  );
};

export default MyTier;
