import React from 'react';
import { defineMessage } from 'react-intl';
import { DcaInvestIcon, HomeIcon, TransferIcon, RepeatIcon } from 'ui-library';

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
export const HACKS_LIST_ROUTE = {
  label: defineMessage({ description: 'navigation.label.hacks', defaultMessage: 'Hacks' }),
  key: 'hacks',
  icon: <TransferIcon />,
};
export const HACKS_LANDING_ROUTE = {
  label: defineMessage({ description: 'navigation.label.hacks', defaultMessage: 'Hacks' }),
  key: 'hacks/landing',
  icon: <TransferIcon />,
};
