import { isSingleRequirement } from '@common/utils/tiers';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { TIER_REQUIREMENTS } from '@pages/tier-view/constants';
import { AchievementKeys, TierConditionalRequirement, TierSingleRequirement } from '@types';
import React from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { ContainerBox, Typography, CheckCircleOutlineIcon, colors, Button } from 'ui-library';

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

const OR_INTL_MESSAGE = defineMessage({
  description: 'tier-view.current-tier.my-tier.tier-progress.or-message',
  defaultMessage: 'or',
});

const generateProgressMessages = (
  currentTierLevel: number,
  // missing: Record<string, { current: number; required: number }>,
  details: Record<string, { current: number; required: number }>,
  intl: ReturnType<typeof useIntl>
): { message: ReturnType<typeof intl.formatMessage>; keys: AchievementKeys[] }[] => {
  const nextTier = TIER_REQUIREMENTS.find((tier) => tier.level === currentTierLevel + 1);
  if (!nextTier) return [];

  const messages: { message: ReturnType<typeof intl.formatMessage>; keys: AchievementKeys[] }[] = [];

  const formatSingleRequirement = (requirement: TierSingleRequirement): ReturnType<typeof intl.formatMessage> => {
    const { id } = requirement;
    const current = details[id]?.current || 0;
    const required = details[id]?.required || 0;
    const remaining = current > required ? required : required - current;

    return intl.formatMessage(MESSAGES_BY_MISSING_ACHIEVEMENTS[id], {
      missing: remaining.toFixed(0),
      b: (chunks) => <b>{chunks}</b>,
    });
  };

  const formatRequirements = (
    requirement: TierSingleRequirement | TierConditionalRequirement
  ): { message: ReturnType<typeof intl.formatMessage>; keys: AchievementKeys[] }[] => {
    if (isSingleRequirement(requirement)) {
      if (details[requirement.id]) {
        return [{ message: formatSingleRequirement(requirement), keys: [requirement.id] }];
      }
      return [];
    }

    if (requirement.type === 'AND') {
      return requirement.requirements.flatMap((req) => formatRequirements(req));
    }

    if (requirement.type === 'OR') {
      const missingRequirements = requirement.requirements.filter((req) => isSingleRequirement(req) && details[req.id]);

      if (missingRequirements.length > 0) {
        const keys = missingRequirements.map((req) => (req as TierSingleRequirement).id);
        const formattedRequirements = missingRequirements.map((req) =>
          formatSingleRequirement(req as TierSingleRequirement)
        );
        if (formattedRequirements.length > 1) {
          const lastMessage = formattedRequirements.pop();
          return [
            {
              message: (
                <>
                  {formattedRequirements}
                  {` `}
                  <FormattedMessage {...OR_INTL_MESSAGE} />
                  {` `}
                  {lastMessage}
                </>
              ),
              keys,
            },
          ];
        } else {
          return [{ message: formattedRequirements[0], keys }];
        }
      }
    }

    return [];
  };

  nextTier.requirements.forEach((requirement) => {
    messages.push(...formatRequirements(requirement));
  });

  return messages;
};

const ProgressionRequeriments = ({ onOpenHowToLevelUp }: { onOpenHowToLevelUp: () => void }) => {
  const { details, tierLevel } = useTierLevel();
  const intl = useIntl();

  const missingMessages = generateProgressMessages(tierLevel ?? 0, details, intl);
  const completedKeys = Object.keys(details || {}).filter(
    (key) => (details?.[key as AchievementKeys]?.current ?? 0) >= (details?.[key as AchievementKeys]?.required ?? 0)
  );
  return (
    <>
      <ContainerBox gap={1} justifyContent="space-between">
        <ContainerBox gap={1} flexDirection="column">
          {missingMessages.map((message, index) => (
            <ContainerBox key={index} gap={1} alignItems="center">
              {message.keys.every((key) => !completedKeys.includes(key)) ? (
                <CheckCircleOutlineIcon sx={{ color: ({ palette }) => colors[palette.mode].typography.typo3 }} />
              ) : (
                <CheckCircleOutlineIcon color="success" />
              )}
              <Typography
                variant="bodySmallRegular"
                color={({ palette }) =>
                  message.keys.every((key) => !completedKeys.includes(key))
                    ? colors[palette.mode].typography.typo3
                    : colors[palette.mode].semantic.success.darker
                }
              >
                {message.message}
              </Typography>
            </ContainerBox>
          ))}
        </ContainerBox>
        <Button variant="text" size="small" sx={{ alignSelf: 'flex-end' }} onClick={onOpenHowToLevelUp}>
          <FormattedMessage
            description="tier-view.current-tier.my-tier.tier-progress.button"
            defaultMessage="How to level up?"
          />
        </Button>
      </ContainerBox>
    </>
  );
};

export default ProgressionRequeriments;
