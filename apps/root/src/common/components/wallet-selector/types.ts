import { ButtonProps } from 'ui-library';
import { Address } from 'viem';

export const ALL_WALLETS = 'allWallets';
export type WalletOptionValues = Address | typeof ALL_WALLETS;

export type WithAllWalletsOption = {
  allowAllWalletsOption: true;
  setSelectionAsActive?: never;
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
};

export type WithSetActiveWalletTrue = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: true;
  onSelectWalletOption?: never;
  selectedWalletOption?: never;
};

export type WithSetActiveWalletFalse = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: false;
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
};

export type StatePropsDefined = {
  allowAllWalletsOption?: boolean;
  setSelectionAsActive?: boolean;
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
};

export enum WalletSelectorVariants {
  main = 'main',
  nav = 'nav',
}

export type WalletSelectorBaseProps = {
  options: WithAllWalletsOption | WithSetActiveWalletTrue | WithSetActiveWalletFalse | StatePropsDefined;
  size?: ButtonProps['size'];
  showWalletCounter?: boolean;
};
export type WalletSelectorNavProps = WalletSelectorBaseProps & {
  variant: WalletSelectorVariants.nav;
  // Nav variant props
  isLoadingSomePrices: boolean;
  isLoggingUser: boolean;
  totalAssetValue: number;
  onToggleShowBalances: () => void;
  showBalances: boolean;
};

export type WalletSelectorMainProps = WalletSelectorBaseProps & {
  variant: WalletSelectorVariants.main;
};

export type WalletSelectorProps = WalletSelectorMainProps | WalletSelectorNavProps;
