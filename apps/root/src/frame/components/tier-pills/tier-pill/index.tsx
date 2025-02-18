import React from 'react';
import useTierLevel from '@hooks/tiers/useTierLevel';
import styled from 'styled-components';
import { ActiveTiersIcons, AnimatedChevronRightIcon, colors, ContainerBox, Typography } from 'ui-library';
import { TIER_LEVEL_OPTIONS } from '@pages/tier-view/constants';
import { FormattedMessage, useIntl } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';

const StyledTierPill = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })<{ $needsToVerifyWallets: boolean }>`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
    $needsToVerifyWallets,
  }) => `
    background-color: ${colors[mode].background.secondary};
    border-radius: ${spacing(2)};
    padding: ${spacing(1.5)} ${spacing(2)};
    border: 1px solid ${$needsToVerifyWallets ? colors[mode].accent.primary : colors[mode].border.border2};
    cursor: pointer;
    ${
      $needsToVerifyWallets &&
      `
      box-shadow: ${colors[mode].dropShadow.dropShadow100};
    `
    }
  `}
`;

const StyledTierPillChevronContainer = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    color: ${colors[mode].accent.primary};
  `}
`;

const StyledClaimYourTierIconContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  ${({ theme: { spacing } }) => `
    position: relative;
    margin-right: ${spacing(1.5)};
  `}
`;
const StyledOverlayedTierIcon = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  ${({ theme: { spacing } }) => `
    position: absolute;
    right: ${spacing(-1.5)};
  `}
`;

const NonLeveledTierPill = ({ tierLevel }: { tierLevel: number }) => {
  const intl = useIntl();
  const TierIcon = ActiveTiersIcons[tierLevel];
  return (
    <>
      <TierIcon size="1rem" />
      <Typography variant="bodySmallSemibold" sx={({ palette }) => ({ color: colors[palette.mode].accent.primary })}>
        {intl.formatMessage(TIER_LEVEL_OPTIONS[tierLevel].title)}
      </Typography>
    </>
  );
};

const LeveledTierPill = ({ tierLevel }: { tierLevel: number }) => {
  const nextTierLevel = tierLevel + 1;

  const TierIcon = ActiveTiersIcons[tierLevel];
  const NextTierIcon = ActiveTiersIcons[nextTierLevel];
  return (
    <>
      <StyledClaimYourTierIconContainer>
        <TierIcon size="1rem" sx={{ opacity: 0.4 }} />
        <StyledOverlayedTierIcon>
          <NextTierIcon size="1rem" />
        </StyledOverlayedTierIcon>
      </StyledClaimYourTierIconContainer>
      <Typography variant="bodySmallSemibold" sx={({ palette }) => ({ color: colors[palette.mode].accent.primary })}>
        <FormattedMessage description="navigation.tier-pill.claim-tier.button" defaultMessage="Claim your tier!" />
      </Typography>
    </>
  );
};

const TierPill = () => {
  const { tierLevel, walletsToVerify, progress } = useTierLevel();
  const [hovered, setHovered] = React.useState(false);
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();

  const onClick = () => {
    trackEvent('Navigation - Tier Pill Clicked');
    pushToHistory('/tier-view');
  };

  const canLevelUp = progress >= 100;
  const needsToVerifyWallets = walletsToVerify.length > 0 && canLevelUp;

  return (
    <StyledTierPill
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      $needsToVerifyWallets={needsToVerifyWallets}
    >
      {needsToVerifyWallets ? (
        <LeveledTierPill tierLevel={tierLevel ?? 0} />
      ) : (
        <NonLeveledTierPill tierLevel={tierLevel ?? 0} />
      )}
      <StyledTierPillChevronContainer>
        <AnimatedChevronRightIcon $hovered={hovered} />
      </StyledTierPillChevronContainer>
    </StyledTierPill>
  );
};

export default TierPill;
