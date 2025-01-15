import { isSingleRequirement } from '@common/utils/tiers';
import { defineMessage, IntlShape, MessageDescriptor, FormattedMessage, useIntl } from 'react-intl';
import useTierLevel from '@hooks/tiers/useTierLevel';
import { SHARE_TWEET_ID, TIER_REQUIREMENTS } from '@pages/tier-view/constants';
import { ThemeMode } from '@state/config/hooks';
import { AchievementKeys, TierConditionalRequirement, TierRequirements, TierSingleRequirement } from 'common-types';
import React from 'react';
import {
  CheckCircleOutlineIcon,
  colors,
  ContainerBox,
  DividerBorder2,
  InfoCircleIcon,
  LinearProgress,
  LinearProgressProps,
  Link,
  Modal,
  TagUserIcon,
  TwitterIcon,
  Typography,
  Wallet2Icon,
} from 'ui-library';
import styled from 'styled-components';
import { withStyles } from 'tss-react/mui';
import { isNil } from 'lodash';
import useTierService from '@hooks/tiers/useTierService';
import useAnalytics from '@hooks/useAnalytics';

const getTierColor = (isNextTier: boolean, isBelowCurrentTier: boolean, mode: ThemeMode) => {
  if (isNextTier) return colors[mode].accent.primary;
  if (isBelowCurrentTier) return colors[mode].typography.typo4;
  return colors[mode].typography.typo2;
};
const getRequirementsColor = (isNextTier: boolean, isBelowCurrentTier: boolean, mode: ThemeMode) => {
  if (isNextTier) return colors[mode].typography.typo4;
  if (isBelowCurrentTier) return colors[mode].typography.typo4;
  return colors[mode].typography.typo2;
};

const MESSAGES_BY_MISSING_ACHIEVEMENTS: Record<AchievementKeys, MessageDescriptor> = {
  [AchievementKeys.SWAP_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.achievement-swap-volume',
    defaultMessage: '≥ ${value} in swaps',
  }),
  [AchievementKeys.MIGRATED_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.achievement-migrated-volume',
    defaultMessage: 'migrate ≥ ${value} from Aave/Compound',
  }),
  [AchievementKeys.TWEET]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.achievement-tweet',
    defaultMessage: 'Share a tweet',
  }),
  [AchievementKeys.REFERRALS]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.achievement-referrals',
    defaultMessage: '≥ {value} referrals',
  }),
};

const OR_INTL_MESSAGE = defineMessage({
  description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.or-message',
  defaultMessage: 'OR',
});

const AND_INTL_MESSAGE = defineMessage({
  description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.and-message',
  defaultMessage: 'AND',
});

const tierRequirementsFormatter = (tier: TierRequirements, intl: IntlShape): string => {
  if (tier.level === 0)
    return intl.formatMessage(
      defineMessage({
        description: 'tier-view.current-tier.how-to-level-up-modal.tier-requirements.zero',
        defaultMessage: 'Early Access registration or eligibility criteria.',
      })
    );

  const formatSingleRequirement = (requirement: TierSingleRequirement): string => {
    const { id, value } = requirement;

    let formattedValue = value.toString();

    if (typeof value === 'number') {
      formattedValue = value.toFixed(0);
    }

    return intl.formatMessage(MESSAGES_BY_MISSING_ACHIEVEMENTS[id], {
      value: formattedValue,
    });
  };

  const formatRequirements = (requirement: TierConditionalRequirement | TierSingleRequirement): string => {
    if (isSingleRequirement(requirement)) {
      return formatSingleRequirement(requirement);
    }

    const formattedRequirements = requirement.requirements.flatMap((req) => formatRequirements(req));
    const lastMessage = formattedRequirements.pop();
    const joinedMessages = formattedRequirements.reduce<string>((acc, curr) => {
      return `${acc} ${curr} ${intl.formatMessage(requirement.type === 'AND' ? AND_INTL_MESSAGE : OR_INTL_MESSAGE)}`;
    }, '');

    if (requirement.type === 'AND') {
      return `${joinedMessages} ${lastMessage}`;
    }

    if (requirement.type === 'OR') {
      return `(${joinedMessages} ${lastMessage})`;
    }

    return '';
  };

  // TODO: Refactor requirements to have a single entry point
  return formatRequirements({ type: 'AND', requirements: tier.requirements });
};

const StyledNextTierProgressCard = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 3,
})`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    padding: ${spacing(4)};
    border: 1px solid ${colors[mode].border.border2};
    background-color: ${colors[mode].background.quartery};
    border-radius: ${spacing(4)};
  `}
`;

const TIER_REQUIREMENT_MESSAGES: Record<AchievementKeys, MessageDescriptor> = {
  [AchievementKeys.SWAP_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.next-tier-progress.swap-volume',
    defaultMessage: 'Swap',
  }),
  [AchievementKeys.MIGRATED_VOLUME]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.next-tier-progress.migrated-volume',
    defaultMessage: 'Migrate',
  }),
  [AchievementKeys.TWEET]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.next-tier-progress.tweet',
    defaultMessage: 'Share a tweet',
  }),
  [AchievementKeys.REFERRALS]: defineMessage({
    description: 'tier-view.current-tier.how-to-level-up-modal.next-tier-progress.referrals',
    defaultMessage: 'Referrals',
  }),
};

const TIER_REQUIREMENT_ICONS: Record<AchievementKeys, React.ReactNode> = {
  [AchievementKeys.SWAP_VOLUME]: (
    <Wallet2Icon sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo2 }} />
  ),
  [AchievementKeys.MIGRATED_VOLUME]: (
    <Wallet2Icon sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo2 }} />
  ),
  [AchievementKeys.TWEET]: <TwitterIcon sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo2 }} />,
  [AchievementKeys.REFERRALS]: <TagUserIcon sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo2 }} />,
};

const StyledProgressToNextTierProgressBar = withStyles(
  ({ variant = 'determinate', ...props }: LinearProgressProps) => <LinearProgress variant={variant} {...props} />,
  ({ palette: { mode } }) => ({
    root: {
      background: colors[mode].border.border2,
    },
    bar: {
      background: colors[mode].accent.primary,
    },
  })
);

const HowToLevelUpModalNextTierRequirementNumberAmount = ({
  current,
  required,
  achievementKey,
}: {
  current: number;
  required: number;
  achievementKey: AchievementKeys;
}) => {
  const currentValueToUse = Math.min(current, required);
  const intl = useIntl();
  const icon = TIER_REQUIREMENT_ICONS[achievementKey];

  return (
    <ContainerBox gap={3} alignItems="center">
      <ContainerBox gap={2} alignItems="center">
        {icon}
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          {intl.formatMessage(TIER_REQUIREMENT_MESSAGES[achievementKey])}
        </Typography>
      </ContainerBox>
      <StyledProgressToNextTierProgressBar value={(currentValueToUse / required) * 100} sx={{ flex: 1 }} />
      <ContainerBox alignItems="center">
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          ${currentValueToUse.toFixed(0)}
        </Typography>
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo5}>
          /{required}
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

const HowToLevelUpModalNextTierRequirementBoolean = ({
  current,
  required,
  achievementKey,
}: {
  current: number;
  required: number;
  achievementKey: AchievementKeys;
}) => {
  const currentValueToUse = Math.min(current, required);
  const intl = useIntl();

  const icon = TIER_REQUIREMENT_ICONS[achievementKey];

  const tierService = useTierService();
  const { trackEvent } = useAnalytics();

  const onShare = React.useCallback(() => {
    void tierService.updateTwitterShare();
    trackEvent('Tiers - Share tweet to level up');
  }, []);

  return (
    <ContainerBox gap={2} alignItems="center">
      {icon}
      <ContainerBox gap={1} alignItems="center">
        {achievementKey === AchievementKeys.TWEET && (
          <Link
            href={`https://twitter.com/intent/retweet?tweet_id=${SHARE_TWEET_ID}`}
            target="_blank"
            onClick={onShare}
          >
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].accentPrimary}>
              {intl.formatMessage(TIER_REQUIREMENT_MESSAGES[achievementKey])}
            </Typography>
          </Link>
        )}
        {achievementKey !== AchievementKeys.TWEET && (
          <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            {intl.formatMessage(TIER_REQUIREMENT_MESSAGES[achievementKey])}
          </Typography>
        )}
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo5}>
          {`·`}
        </Typography>
        {currentValueToUse >= required ? (
          <CheckCircleOutlineIcon color="success" />
        ) : (
          <CheckCircleOutlineIcon sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo5 }} />
        )}
      </ContainerBox>
    </ContainerBox>
  );
};

const HowToLevelUpModalNextTierRequirementNumberCount = ({
  current,
  required,
  achievementKey,
}: {
  current: number;
  required: number;
  achievementKey: AchievementKeys;
}) => {
  const currentValueToUse = Math.min(current, required);
  const intl = useIntl();

  const icon = TIER_REQUIREMENT_ICONS[achievementKey];
  return (
    <ContainerBox gap={2} alignItems="center">
      {icon}
      <ContainerBox gap={1} alignItems="center">
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          {intl.formatMessage(TIER_REQUIREMENT_MESSAGES[achievementKey])}
        </Typography>
        <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo5}>
          {`·`}
        </Typography>
        <ContainerBox alignItems="center">
          <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            {currentValueToUse}
          </Typography>
          <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo5}>
            /{required}
          </Typography>
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};

const HowToLevelUpModalNextTierRequirement = ({
  achievementKey,
  current,
  required,
}: {
  achievementKey: AchievementKeys;
  current: number;
  required: number;
}) => {
  switch (achievementKey) {
    case AchievementKeys.SWAP_VOLUME:
      return (
        <HowToLevelUpModalNextTierRequirementNumberAmount
          current={current}
          required={required}
          achievementKey={achievementKey}
        />
      );
    case AchievementKeys.MIGRATED_VOLUME:
      return (
        <HowToLevelUpModalNextTierRequirementNumberAmount
          current={current}
          required={required}
          achievementKey={achievementKey}
        />
      );
    case AchievementKeys.TWEET:
      return (
        <HowToLevelUpModalNextTierRequirementBoolean
          current={current}
          required={required}
          achievementKey={achievementKey}
        />
      );
    case AchievementKeys.REFERRALS:
      return (
        <HowToLevelUpModalNextTierRequirementNumberCount
          current={current}
          required={required}
          achievementKey={achievementKey}
        />
      );
    default:
      return null;
  }
};

const StyledButtonSpan = styled(Typography).attrs({
  variant: 'bodyBoldNormalLineHeight',
})`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    color: ${colors[mode].accent.primary};
  `}
  cursor: pointer;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

const HowToLevelUpModalNextTier = ({
  tier,
  onGoToVerifyWallets,
}: {
  tier: TierRequirements;
  onGoToVerifyWallets: () => void;
}) => {
  const intl = useIntl();

  const { details, walletsToVerify } = useTierLevel();

  const achievementsToShow = Object.entries(details).map(([achievementKey, achieved]) => {
    return {
      achievementKey: achievementKey as AchievementKeys,
      current: achieved.current,
      required: achieved.required,
    };
  });

  return (
    <ContainerBox gap={3} flexDirection="column">
      <ContainerBox gap={1} alignItems="center" flexWrap="wrap">
        <Typography variant="h6Bold" color={({ palette: { mode } }) => getTierColor(true, false, mode)}>
          <FormattedMessage
            id="tier-view.current-tier.how-to-level-up-modal.next-tier"
            defaultMessage="Tier {tierLevel} · On the way"
            values={{ tierLevel: tier.level }}
          />
        </Typography>
        <Typography variant="bodyRegular" color={({ palette: { mode } }) => getRequirementsColor(true, false, mode)}>
          {tierRequirementsFormatter(tier, intl)}
        </Typography>
      </ContainerBox>
      <StyledNextTierProgressCard>
        <Typography variant="h6Bold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          <FormattedMessage
            id="tier-view.current-tier.how-to-level-up-modal.next-tier-progress"
            defaultMessage="Progress to reach Tier {tierLevel}"
            values={{ tierLevel: tier.level }}
          />
        </Typography>
        <ContainerBox gap={3} flexDirection="column">
          {achievementsToShow.map(({ achievementKey, current, required }) => (
            <HowToLevelUpModalNextTierRequirement
              key={achievementKey}
              achievementKey={achievementKey}
              current={current}
              required={required}
            />
          ))}
        </ContainerBox>
        {walletsToVerify.length > 0 && (
          <>
            <DividerBorder2 />
            <ContainerBox gap={2} alignItems="center">
              <InfoCircleIcon
                sx={({ palette }) => ({
                  color: colors[palette.mode].semantic.informative.primary,
                  transform: 'rotate(180deg)',
                })}
              />
              <Typography variant="bodyRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
                <FormattedMessage
                  description="tier-view.current-tier.how-to-level-up-modal.next-tier-progress.wallets-to-verify"
                  defaultMessage="You're one step away from unlocking your next tier! <b>To proceed, </b><buttonSpan>sign with the wallet(s)</buttonSpan><b> until the requirements are fully met.</b> Once completed, your progress will be validated. "
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    buttonSpan: (chunks: React.ReactNode) => (
                      <StyledButtonSpan onClick={onGoToVerifyWallets}>{chunks}</StyledButtonSpan>
                    ),
                  }}
                />
              </Typography>
            </ContainerBox>
          </>
        )}
      </StyledNextTierProgressCard>
    </ContainerBox>
  );
};

const HowToLevelUpModalTier = ({ tier, currentTier }: { tier: TierRequirements; currentTier: number }) => {
  const intl = useIntl();
  const isBelowCurrentTier = tier.level <= currentTier;
  return (
    <ContainerBox gap={1} alignItems="center" flexWrap="wrap">
      <Typography variant="h6Bold" color={({ palette: { mode } }) => getTierColor(false, isBelowCurrentTier, mode)}>
        <FormattedMessage
          id="tier-view.current-tier.how-to-level-up-modal.tier-level"
          defaultMessage="Tier {tierLevel}"
          values={{ tierLevel: tier.level }}
        />
      </Typography>
      <Typography variant="bodyRegular" color={({ palette: { mode } }) => colors[mode].typography.typo5}>
        {`·`}
      </Typography>
      <Typography
        variant="bodyRegular"
        color={({ palette: { mode } }) => getRequirementsColor(false, isBelowCurrentTier, mode)}
      >
        {tierRequirementsFormatter(tier, intl)}
      </Typography>
    </ContainerBox>
  );
};

const HowToLevelUpModal = ({
  isOpen,
  onClose,
  onGoToVerifyWallets,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoToVerifyWallets: () => void;
}) => {
  const { tierLevel } = useTierLevel();
  const nextTier = isNil(tierLevel) ? 0 : tierLevel + 1;

  const handleGoToVerifyWallets = () => {
    onGoToVerifyWallets();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} showCloseIcon maxWidth="sm">
      <ContainerBox gap={6} flexDirection="column">
        <ContainerBox gap={2} flexDirection="column">
          <Typography variant="h3Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              id="tier-view.current-tier.how-to-level-up-modal.title"
              defaultMessage="How to level up"
            />
          </Typography>
          <Typography variant="body1" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            <FormattedMessage
              id="tier-view.current-tier.how-to-level-up-modal.description"
              defaultMessage="Track progress accross your connected wallets"
            />
          </Typography>
        </ContainerBox>
        <ContainerBox gap={4} flexDirection="column">
          {TIER_REQUIREMENTS.sort((a, b) => a.level - b.level).map((tier) =>
            tier.level === nextTier ? (
              <HowToLevelUpModalNextTier key={tier.level} tier={tier} onGoToVerifyWallets={handleGoToVerifyWallets} />
            ) : (
              <HowToLevelUpModalTier key={tier.level} tier={tier} currentTier={tierLevel ?? 0} />
            )
          )}
        </ContainerBox>
      </ContainerBox>
    </Modal>
  );
};

export default HowToLevelUpModal;
