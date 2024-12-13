import React, { createElement } from 'react';
import useTierLevel from '@hooks/tiers/useTierLevel';
import useEarnAccess from '@hooks/useEarnAccess';
import styled from 'styled-components';
import { ActiveTiersIcons, AnimatedChevronRightIcon, colors, ContainerBox, Typography } from 'ui-library';
import { TIER_LEVEL_OPTIONS } from '@pages/tier-view/constants';
import { useIntl } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledTierPill = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].background.secondary};
    border-radius: ${spacing(2)};
    padding: ${spacing(1.5)} ${spacing(2)};
    border: 1px solid ${colors[mode].border.border2};
    cursor: pointer;
  `}
`;

const TierPill = () => {
  const { tierLevel } = useTierLevel();
  const { hasEarnAccess } = useEarnAccess();
  const intl = useIntl();
  const [hovered, setHovered] = React.useState(false);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();

  if (!hasEarnAccess) {
    return null;
  }

  const onClick = () => {
    trackEvent('Navigation - Tier Pill Clicked');
    pushToHistory('/tier-view');
  };

  return (
    <StyledTierPill onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {createElement(ActiveTiersIcons[tierLevel], { size: '1rem' })}
      <Typography variant="bodySmallSemibold" sx={({ palette }) => ({ color: colors[palette.mode].accent.primary })}>
        {intl.formatMessage(TIER_LEVEL_OPTIONS[tierLevel].title)}
      </Typography>
      <AnimatedChevronRightIcon
        $hovered={hovered}
        sx={({ palette }) => ({ color: colors[palette.mode].accent.primary })}
      />
    </StyledTierPill>
  );
};

export default TierPill;
