import React from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { DcaInvestIcon, HomeIcon, TransferIcon, RepeatIcon, MoneyAddIcon, colors, ContainerBox } from 'ui-library';

export const HOME_ROUTES = ['/', '/home', '/dashboard'];

export const DASHBOARD_ROUTE = {
  label: defineMessage({ description: 'dashboard', defaultMessage: 'Dashboard' }),
  key: 'home',
  icon: <HomeIcon />,
};
export const DCA_ROUTE = {
  label: defineMessage({ description: 'invest', defaultMessage: 'Invest (DCA)' }),
  key: 'positions',
  icon: <DcaInvestIcon />,
};
export const DCA_CREATE_ROUTE = {
  label: defineMessage({ description: 'create', defaultMessage: 'Create' }),
  key: 'create',
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

export const TOKEN_PROFILE_ROUTE = {
  key: 'token',
};
export const HISTORY_ROUTE = {
  key: 'history',
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

const ComingSoon = () => (
  <StyledComingSoonContainer>
    <FormattedMessage defaultMessage="Join Beta" description="navigation.earn.coming-soon" />
  </StyledComingSoonContainer>
);

export const EARN_ROUTE = {
  label: defineMessage({ description: 'earn', defaultMessage: 'Earn' }),
  key: 'earn-group',
  icon: <MoneyAddIcon />,
  endContent: <ComingSoon />,
};

export const NON_NAVIGABLE_ROUTES = [EARN_ROUTE.key];
