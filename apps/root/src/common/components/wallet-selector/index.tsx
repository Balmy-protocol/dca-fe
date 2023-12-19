import React from 'react';
import {
  IconMenu,
  WalletIcon,
  EditIcon,
  ContentCopyIcon,
  IconMenuOption,
  AddIcon,
  Typography,
  EmptyWalletIcon,
  useTheme,
  colors,
  KeyboardArrowRightIcon,
} from 'ui-library';
import useUser from '@hooks/useUser';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { defineMessage, useIntl } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { trimAddress } from '@common/utils/parsing';
import useStoredLabels from '@hooks/useStoredLabels';
import { copyTextToClipboard } from '@common/utils/clipboard';

type WithAllWalletsOption = {
  allowAllWalletsOption: true;
  setSelectionAsActive?: never;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type WithSetActiveWalletTrue = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: true;
  onSelectWalletOption?: never;
  selectedWalletOption?: never;
};

type WithSetActiveWalletFalse = {
  allowAllWalletsOption?: never;
  setSelectionAsActive: false;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type StatePropsDefined = {
  allowAllWalletsOption?: boolean;
  setSelectionAsActive?: boolean;
  onSelectWalletOption: (newWallet: string) => void;
  selectedWalletOption: string;
};

type WalletSelectorProps = {
  options: WithAllWalletsOption | WithSetActiveWalletTrue | WithSetActiveWalletFalse | StatePropsDefined;
};

export const ALL_WALLETS = 'allWallets';

const WalletSelector = ({ options }: WalletSelectorProps) => {
  const { allowAllWalletsOption, onSelectWalletOption, selectedWalletOption, setSelectionAsActive } = options;
  const intl = useIntl();
  const user = useUser();
  const activeWallet = useActiveWallet();
  const {
    palette: { mode },
  } = useTheme();
  const accountService = useAccountService();
  const labels = useStoredLabels();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModal) {
        openConnectModal();
      }
    },
  });
  const [enableEditLabel, setEnableEditLabel] = React.useState(false);

  const selectedOptionValue = selectedWalletOption || activeWallet?.address || '';
  const allWalletsLabel = intl.formatMessage(
    defineMessage({
      defaultMessage: 'All',
      description: 'allWallets',
    })
  );

  const onClickWalletItem = (newWallet: string) => {
    if (setSelectionAsActive) {
      void accountService.setActiveWallet(newWallet);
    }
    if (onSelectWalletOption) {
      onSelectWalletOption(newWallet);
    }
  };

  const onConnectWallet = () => {
    disconnect();

    if (openConnectModal) {
      openConnectModal();
    }
  };

  const menuOptions: IconMenuOption[] = [
    /* SELECTED WALLET ACTIONS */
    ...(selectedWalletOption !== ALL_WALLETS
      ? [
          {
            label: intl.formatMessage(
              defineMessage({
                defaultMessage: 'Rename Wallet',
                description: 'renameWallet',
              })
            ),
            icon: <EditIcon />,
            control: <KeyboardArrowRightIcon />,
            onClick: () => setEnableEditLabel(true),
          },
          {
            label: intl.formatMessage(
              defineMessage({
                defaultMessage: 'Copy Address',
                description: 'copyAddress',
              })
            ),
            secondaryLabel: trimAddress(selectedOptionValue || '', 4),
            icon: <ContentCopyIcon />,
            onClick: () => copyTextToClipboard(selectedOptionValue),
            bottomDivider: true,
          },
        ]
      : []),
    /* WALLET OPTIONS */
    ...(allowAllWalletsOption
      ? [
          {
            label: allWalletsLabel,
            icon: <WalletIcon />,
            onClick: () => onClickWalletItem(ALL_WALLETS),
            control: selectedOptionValue !== ALL_WALLETS ? <KeyboardArrowRightIcon /> : undefined,
          },
        ]
      : []),
    ...(user?.wallets
      ? user.wallets.map(({ address }, index) => ({
          label: <Address trimAddress address={address} />,
          secondaryLabel:
            labels[selectedOptionValue] && selectedWalletOption !== ALL_WALLETS
              ? trimAddress(address || '', 4)
              : undefined,
          icon: <WalletIcon />,
          onClick: () => onClickWalletItem(address),
          control: selectedOptionValue !== address ? <KeyboardArrowRightIcon /> : undefined,
          bottomDivider: index === user.wallets.length - 1,
        }))
      : []),
    /* CONNECT WALLET */
    {
      label: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Add Wallet',
          description: 'addWallet',
        })
      ),
      icon: <EmptyWalletIcon />,
      onClick: onConnectWallet,
      control: <AddIcon color="success" />,
      color: colors[mode].semantic.success,
    },
  ];

  const selectedOptionLabel = !!user?.wallets.length ? (
    selectedOptionValue === ALL_WALLETS ? (
      allWalletsLabel
    ) : (
      <Address address={selectedOptionValue} trimAddress editable={enableEditLabel} onEnableEdit={setEnableEditLabel} />
    )
  ) : (
    intl.formatMessage(
      defineMessage({
        defaultMessage: 'Connect your wallet',
        description: 'connectWallet',
      })
    )
  );

  return (
    <IconMenu
      options={menuOptions}
      icon={<Typography>{selectedOptionLabel}</Typography>}
      blockMenuOpen={enableEditLabel}
    />
  );
};

export default WalletSelector;
