import useTierLevel from '@hooks/tiers/useTierLevel';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  Typography,
  ActiveTiersIcons,
  ContainerBox,
  Grid,
  InfoCircleIcon,
  AnimatedChevronRightIcon,
  Button,
} from 'ui-library';
import ProgressionRequeriments from '../progression-requeriments';
import VerifyToLevelUpModal from '../verify-to-level-up-modal';
import HowToLevelUpModal from '../how-to-level-up-modal';
import { useIsEarnMobile } from '@hooks/earn/useIsEarnMobile';

const StyledMyTierCard = styled(ContainerBox).attrs({ gap: 6, flex: 1 })<{ isMobile: boolean }>`
  ${({ theme: { palette, spacing }, isMobile }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.quartery};
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
    ${
      isMobile &&
      `
      padding: ${spacing(4)};
    `
    }
    gap: ${isMobile ? spacing(4) : spacing(6)};
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

const StyledTierProgressNeedsToVerifyContainer = styled(ContainerBox).attrs({
  gap: 1,
  alignItems: 'center',
  justifyContent: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    background-color: ${colors[palette.mode].background.secondary};
    border-radius: ${spacing(4)};
    border: 1px solid ${colors[palette.mode].semantic.informative.primary};
    padding: ${spacing(1)} ${spacing(2)};
  `}
`;

const StyledClaimYourTierIconContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  ${({ theme: { spacing } }) => `
    position: relative;
    margin-right: ${spacing(7)};
  `}
`;
const StyledOverlayedTierIcon = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  ${({ theme: { spacing } }) => `
    position: absolute;
    right: ${spacing(-7)};
  `}
`;
const LeveledMyTierCard = ({ tierLevel, onVerify }: { tierLevel: number; onVerify: () => void }) => {
  const nextTierLevel = tierLevel + 1;
  const TierIcon = ActiveTiersIcons[tierLevel];
  const NextTierIcon = ActiveTiersIcons[nextTierLevel];
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      <StyledClaimYourTierIconContainer>
        <TierIcon size="4.8125rem" sx={{ opacity: 0.4 }} />
        <StyledOverlayedTierIcon>
          <NextTierIcon size="4.8125rem" />
        </StyledOverlayedTierIcon>
      </StyledClaimYourTierIconContainer>
      <ContainerBox gap={1} flexDirection="column" flex={1}>
        <Typography variant="h1Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
          <FormattedMessage
            description="tier-view.current-tier.my-tier.level-up.title"
            defaultMessage="Claim your <span>Tier {tierLevel}</span>"
            values={{
              tierLevel: nextTierLevel,
              span: (chunks) => <StyledTierLevelSpan>{chunks}</StyledTierLevelSpan>,
            }}
          />
        </Typography>
        <ContainerBox gap={1} justifyContent="space-between" alignItems="center">
          <Typography variant="h4Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            <FormattedMessage
              description="tier-view.current-tier.my-tier.level-up.description"
              defaultMessage="Reap all new benefits!"
            />
          </Typography>
          <Button
            variant="text"
            size="small"
            color="primary"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onVerify}
          >
            <FormattedMessage
              description="tier-view.current-tier.my-tier.level-up.button"
              defaultMessage="Upgrade now"
            />
            <AnimatedChevronRightIcon $hovered={hovered} />
          </Button>
        </ContainerBox>
      </ContainerBox>
    </>
  );
};

const NonLeveledMyTierCard = ({ tierLevel, progress }: { tierLevel: number; progress: number }) => {
  const TierIcon = ActiveTiersIcons[tierLevel];

  return (
    <>
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
    </>
  );
};

const MyTier = () => {
  const { tierLevel, progress, walletsToVerify } = useTierLevel();
  const [openVerifyToLevelUpModal, setOpenVerifyToLevelUpModal] = React.useState(false);
  const [isHowToLevelUpModalOpen, setIsHowToLevelUpModalOpen] = React.useState(false);
  const canLevelUp = progress >= 100;
  const needsToVerifyWallets = walletsToVerify.length > 0 && canLevelUp;
  const isEarnMobile = useIsEarnMobile();

  return (
    <>
      <VerifyToLevelUpModal isOpen={openVerifyToLevelUpModal} onClose={() => setOpenVerifyToLevelUpModal(false)} />
      <HowToLevelUpModal
        isOpen={isHowToLevelUpModalOpen}
        onClose={() => setIsHowToLevelUpModalOpen(false)}
        onGoToVerifyWallets={() => setOpenVerifyToLevelUpModal(true)}
      />
      <Grid container spacing={6}>
        {/* current tier */}
        <Grid item xs={12} md={6}>
          <StyledMyTierCard isMobile={isEarnMobile}>
            {needsToVerifyWallets ? (
              <LeveledMyTierCard tierLevel={tierLevel ?? 0} onVerify={() => setOpenVerifyToLevelUpModal(true)} />
            ) : (
              <NonLeveledMyTierCard tierLevel={tierLevel ?? 0} progress={progress} />
            )}
          </StyledMyTierCard>
        </Grid>

        {/* tier progress */}
        <Grid item xs={12} md={6}>
          <StyledTierProgressCard>
            <ContainerBox gap={1} justifyContent="space-between" alignItems="center">
              <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage
                  description="tier-view.current-tier.my-tier.tier-progress.title"
                  defaultMessage="Reach Tier {tierLevel} and unlock all its benefits!"
                  values={{
                    tierLevel: (tierLevel ?? 0) + 1,
                  }}
                />
              </Typography>
              {needsToVerifyWallets && (
                <StyledTierProgressNeedsToVerifyContainer>
                  <InfoCircleIcon
                    sx={({ palette }) => ({
                      color: colors[palette.mode].semantic.informative.primary,
                      transform: 'rotate(180deg)',
                    })}
                  />
                  <Typography variant="bodyExtraSmall" color={({ palette }) => colors[palette.mode].typography.typo2}>
                    <FormattedMessage
                      description="tier-view.current-tier.my-tier.tier-progress.verify-wallets"
                      defaultMessage="Verify wallet(s)"
                    />
                  </Typography>
                </StyledTierProgressNeedsToVerifyContainer>
              )}
            </ContainerBox>
            <ProgressionRequeriments onOpenHowToLevelUp={() => setIsHowToLevelUpModalOpen(true)} />
          </StyledTierProgressCard>
        </Grid>
      </Grid>
    </>
  );
};

export default MyTier;
