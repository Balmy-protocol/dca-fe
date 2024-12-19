import useTierLevel from '@hooks/tiers/useTierLevel';
import { AchievementKeys } from '@types';
import React from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { ContainerBox, Typography, Profile2UsersIcon, CheckCircleOutlineIcon, colors, Button } from 'ui-library';

const MESSAGES_BY_MISSING_ACHIEVEMENTS: Record<AchievementKeys, MessageDescriptor> = {
  [AchievementKeys.SWAP_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-swap-volume',
    defaultMessage: 'Swap ${missing}',
  }),
  [AchievementKeys.MIGRATED_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-migrated-volume',
    defaultMessage: 'Migrate ${missing} more liquidity',
  }),
  [AchievementKeys.TWEET]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-tweet',
    defaultMessage: 'Share a tweet',
  }),
  [AchievementKeys.REFERRALS]: defineMessage({
    description: 'tier-view.current-tier.my-tier.tier-progress.missing-achievement-referrals',
    defaultMessage: 'Refer <b>{missing} more people</b>',
  }),
};

const ProgressionRequeriments = () => {
  const { missing, details } = useTierLevel();
  const intl = useIntl();

  const missingReferrals = missing[AchievementKeys.REFERRALS];
  const missingMessages = Object.entries(details)
    .filter(([key]) => (key as AchievementKeys) !== AchievementKeys.REFERRALS)
    .map(([achievementKey]) => {
      const message = MESSAGES_BY_MISSING_ACHIEVEMENTS[achievementKey as AchievementKeys];
      return {
        key: achievementKey,
        message: intl.formatMessage(message, {
          missing: missing[achievementKey as AchievementKeys].current,
          b: (chunks) => <b>{chunks}</b>,
        }),
      };
    });

  return (
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
              missing: missingReferrals.current,
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
  );
};

export default ProgressionRequeriments;
