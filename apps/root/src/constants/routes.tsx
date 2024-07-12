import React from 'react';
import { defineMessage } from 'react-intl';
import { DcaInvestIcon, HomeIcon, TransferIcon, RepeatIcon, MoneyAddIcon, WalletMoneyIcon } from 'ui-library';

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
export const EARN_ROUTE = {
  label: defineMessage({ description: 'earn', defaultMessage: 'Earn' }),
  key: 'earn',
  icon: <MoneyAddIcon />,
};
export const EARN_PORTFOLIO = {
  label: defineMessage({ description: 'navigation.earn.portfolio', defaultMessage: 'Portfolio' }),
  key: 'earn-portfolio',
  icon: <WalletMoneyIcon />,
};
