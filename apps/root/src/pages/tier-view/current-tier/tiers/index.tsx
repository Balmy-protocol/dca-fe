import useTierLevel from '@hooks/tiers/useTierLevel';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, Grid, TierPillTabs, Typography } from 'ui-library';
import { TIER_LEVEL_OPTIONS, TIER_REWARDS, TierReward } from '../../constants';

const StyledTierRewardBox = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 6, flex: 1 })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].background.quartery};
    border: 1px solid ${colors[mode].border.border1};
    border-radius: ${spacing(4)};
    padding: ${spacing(4)};
    position: relative;
    height: 100%;
  `}
`;

const StyledTierRewardBoxBadge = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].background.tertiary};
    border: 1px solid ${colors[mode].accent.primary};
    border-radius: ${spacing(2)};
    padding: ${spacing(0.5)} ${spacing(2)};
  `}
`;

const StyledComingSoonFlagContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  alignItems: 'flex-start',
})`
  ${({ theme: { spacing } }) => `
    position: absolute;
    right: -${spacing(2.25)}; // For cards, we need to take border into account
    top: ${spacing(5)};
  `}
`;

const StyledComingSoonFlag = styled(ContainerBox).attrs({
  gap: 1,
  alignItems: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    background-color: ${colors[palette.mode].accentPrimary};
    padding: ${spacing(1)} ${spacing(2)};
    border-radius: ${spacing(0.5)} ${spacing(0.5)} 0 0;
  `}
`;

const TriangleBehindFlag = styled.div`
  ${({ theme: { spacing, palette } }) => `
    width: 0;
    align-self: flex-end;
    height: 0;
    border-bottom: ${spacing(1)} solid transparent;
    border-right: ${spacing(1)} solid transparent;
    border-top: ${spacing(1)} solid ${colors[palette.mode].accentPrimary};
    border-left: ${spacing(1)} solid ${colors[palette.mode].accentPrimary};
  `}
`;

const ComingSoonFlag = () => (
  <StyledComingSoonFlagContainer>
    <StyledComingSoonFlag>
      <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].background.tertiary}>
        <FormattedMessage description="tier-view.current-tier.tiers.coming-soon" defaultMessage="Coming soon" />
      </Typography>
    </StyledComingSoonFlag>
    <TriangleBehindFlag />
  </StyledComingSoonFlagContainer>
);

const TierRewardBox = ({ reward: { title, description, icon, badge, comingSoon } }: { reward: TierReward }) => {
  const intl = useIntl();
  return (
    <StyledTierRewardBox>
      <ContainerBox justifyContent="space-between">
        {icon}
        {badge && (
          <StyledTierRewardBoxBadge>
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
              {intl.formatMessage(badge)}
            </Typography>
          </StyledTierRewardBoxBadge>
        )}
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="h5Bold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          {intl.formatMessage(title)}
        </Typography>
        <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          {intl.formatMessage(description)}
        </Typography>
      </ContainerBox>
      {comingSoon && <ComingSoonFlag />}
    </StyledTierRewardBox>
  );
};
const Tiers = () => {
  const intl = useIntl();
  const { tierLevel } = useTierLevel();
  const [tierLevelView, setTierLevelView] = React.useState<number>(tierLevel ?? 0);

  return (
    <ContainerBox gap={6} flexDirection="column">
      <ContainerBox gap={6} justifyContent="space-between" flexWrap="wrap">
        <Typography variant="h2Bold">
          <FormattedMessage
            description="tier-view.current-tier.tiers.title"
            defaultMessage="Discover the benefits of your tier"
          />
        </Typography>
        <TierPillTabs
          options={TIER_LEVEL_OPTIONS.map(({ title, key }) => ({
            key,
            label: intl.formatMessage(title),
            isCurrent: key === tierLevel,
          }))}
          selected={tierLevelView}
          onChange={(key) => setTierLevelView(Number(key))}
        />
      </ContainerBox>
      <Grid container rowSpacing={6} columnSpacing={6}>
        {TIER_REWARDS[tierLevelView ?? 0].map((reward, index) => (
          <Grid item xs={12} sm={6} md={3} key={`${index}-${tierLevelView}`}>
            <TierRewardBox reward={reward} />
          </Grid>
        ))}
      </Grid>
    </ContainerBox>
  );
};

export default Tiers;
