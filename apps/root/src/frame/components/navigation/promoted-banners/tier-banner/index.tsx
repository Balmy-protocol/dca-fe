import React from 'react';
import styled from 'styled-components';
import { colors, ContainerBox, Typography, AnimatedArrowRightIcon } from 'ui-library';
import BackgroundGrid from './background';
import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { changeRoute } from '@state/tabs/actions';
import { TIER_VIEW_ROUTE } from '@constants/routes';
import { useAppDispatch } from '@state/hooks';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import useUser from '@hooks/useUser';

const StyledPromotedBanner = styled(ContainerBox).attrs({ flex: 1, gap: 1, flexDirection: 'column' })`
  ${({
    theme: {
      palette: { mode, gradient },
      spacing,
    },
  }) => `
  // width: 208px;
  // height: 122px;
  padding: ${spacing(3)};
  cursor: pointer;
  position: relative;

  border-radius: ${spacing(3)};
  border: 1px solid ${colors[mode].accent.primary};
  background: ${gradient.earnWizard};

  /* dropshadow/100 */
    box-shadow: ${colors[mode].dropShadow.dropShadow100};
  `}
`;

const StyledGridBg = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
`;

const StyledStarBg = styled.div`
  position: absolute;
  top: -13px;
  right: -6px;
  width: 34px;
  height: 34px;
`;

const StlyedDarkStar = styled(StyledStarBg)`
  background: url('https://ipfs.io/ipfs/bafkreicxqwgktunpqzqsa5y42w4rrkpun3cd7meqsbxnks6yckncgnvmje') 50% / contain
    no-repeat;
`;
const StlyedLightStar = styled(StyledStarBg)`
  background: url('https://ipfs.io/ipfs/bafkreih4anauqa24gjlakcpx2mq5ltqiuoqmjts7xcfrpi4b7e4monfzeq') 50% / contain
    no-repeat;
`;

const StyledTierPillChevronContainer = styled(ContainerBox).attrs({ alignSelf: 'flex-end' })`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    color: ${colors[mode].accent.primary};
  `}
`;

const PromotedTierBanner = () => {
  const [hovered, setHovered] = React.useState(false);
  const mode = useThemeMode();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();
  const user = useUser();

  const onClick = () => {
    dispatch(changeRoute(TIER_VIEW_ROUTE.key));
    pushToHistory(`/${TIER_VIEW_ROUTE.key}`);
    trackEvent('Tier Promoted banner - Go to tier view');
  };

  if (!user) return null;

  return (
    <StyledPromotedBanner
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Typography
        variant="labelSemiBold"
        color={mode === 'light' ? colors[mode].accent.accent600 : colors[mode].typography.white}
      >
        <FormattedMessage description="navigation.tier-promoted-banner.title" defaultMessage="Refer friends!" />
      </Typography>
      <Typography
        variant="labelRegular"
        color={mode === 'light' ? colors[mode].accent.accent600 : colors[mode].typography.white}
      >
        <FormattedMessage
          description="navigation.tier-promoted-banner.description"
          defaultMessage="Refer friends and upgrade your tier level"
        />
      </Typography>
      {mode === 'light' ? <StlyedLightStar /> : <StlyedDarkStar />}
      <StyledTierPillChevronContainer>
        <AnimatedArrowRightIcon $hovered={hovered} fontSize="large" />
      </StyledTierPillChevronContainer>
      <StyledGridBg>
        <BackgroundGrid />
      </StyledGridBg>
    </StyledPromotedBanner>
  );
};

export default PromotedTierBanner;
