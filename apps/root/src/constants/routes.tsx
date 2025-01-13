import React from 'react';
import {
  DcaInvestIcon,
  HomeIcon,
  TransferIcon,
  RepeatIcon,
  MoneyAddIcon,
  WalletMoneyIcon,
  ShieldSearchIcon,
  colors,
  ContainerBox,
} from 'ui-library';
import { defineMessage, FormattedMessage } from 'react-intl';
import styled from 'styled-components';

export const HOME_ROUTES = ['/', '/home', '/dashboard'];

export const DASHBOARD_ROUTE = {
  label: defineMessage({ description: 'dashboard', defaultMessage: 'Dashboard' }),
  key: 'home',
  icon: <HomeIcon />,
};
export const DCA_ROUTE = {
  label: defineMessage({ description: 'invest', defaultMessage: 'Invest (DCA)' }),
  key: 'invest/positions',
  icon: <DcaInvestIcon />,
};
export const DCA_CREATE_ROUTE = {
  label: defineMessage({ description: 'create', defaultMessage: 'Create' }),
  key: 'invest/create',
  icon: <DcaInvestIcon />,
};
export const SWAP_ROUTE = {
  label: defineMessage({ description: 'swap', defaultMessage: 'Swap' }),
  key: 'swap',
  icon: <RepeatIcon />,
};
export const TRANSFER_ROUTE = {
  label: defineMessage({ description: 'transfer', defaultMessage: 'Transfer' }),
  key: 'transfer',
  icon: <TransferIcon />,
};

export const EARN_GROUP = {
  label: defineMessage({ description: 'earn', defaultMessage: 'Earn' }),
  key: 'earn-group',
  icon: <MoneyAddIcon />,
};

export const EARN_ROUTE = {
  label: defineMessage({ description: 'navigation.routes.drawer.earn.discover', defaultMessage: 'Discover' }),
  key: 'earn',
  icon: <ShieldSearchIcon />,
};

export const EARN_PORTFOLIO = {
  label: defineMessage({ description: 'navigation.routes.drawer.earn.portfolio', defaultMessage: 'Portfolio' }),
  key: 'earn/portfolio',
  icon: <WalletMoneyIcon />,
};

export const TOKEN_PROFILE_ROUTE = {
  key: 'token',
};

export const HISTORY_ROUTE = {
  key: 'history',
};

export const TIER_VIEW_ROUTE = {
  key: 'tier-view',
};

const StyledComingSoonContainer = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    color: ${colors[mode].accent.accent100};
    background-color: ${colors[mode].accent.primary};
    padding: ${spacing(1)} ${spacing(2)};
  `}
  font-family: Inter;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.21;
  border-radius: 100px;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ComingSoon = () => (
  <StyledComingSoonContainer>
    <FormattedMessage defaultMessage="Soon!" description="navigation.earn.coming-soon" />
  </StyledComingSoonContainer>
);

export const EARN_SUBSCRIBE_ROUTE = {
  label: defineMessage({ description: 'earn', defaultMessage: 'Earn' }),
  key: 'earn-group',
  icon: <MoneyAddIcon />,
  endContent: <ComingSoon />,
};

export const NON_NAVIGABLE_EARN_ROUTES: string[] = [EARN_GROUP.key, EARN_ROUTE.key, EARN_PORTFOLIO.key];

export const EARN_ACCESS_NOW_ROUTE = {
  key: 'earn/access-now',
};
