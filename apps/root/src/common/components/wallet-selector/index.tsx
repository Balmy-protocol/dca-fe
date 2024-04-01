import React from 'react';
import {
  OptionsMenu,
  WalletIcon,
  EditIcon,
  ContentCopyIcon,
  OptionsMenuOption,
  AddIcon,
  AddEmptyWalletIcon,
  KeyboardArrowRightIcon,
  OptionsMenuOptionType,
  ButtonProps,
  copyTextToClipboard,
} from 'ui-library';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { defineMessage, useIntl } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { formatWalletLabel, trimAddress } from '@common/utils/parsing';
import { Address as AddressType } from 'common-types';
import useWallets from '@hooks/useWallets';
import { LogoutIcon } from 'ui-library/src/icons';
import { useAppDispatch } from '@state/hooks';
import { cleanBalances } from '@state/balances/actions';

export const ALL_WALLETS = 'allWallets';
export type WalletOptionValues = AddressType | typeof ALL_WALLETS;

type WithAllWalletsOption = {
  allowAllWalletsOption: true;
  setSelectionAsActive?: never;
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
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
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
};

type StatePropsDefined = {
  allowAllWalletsOption?: boolean;
  setSelectionAsActive?: boolean;
  onSelectWalletOption: (newWallet: WalletOptionValues) => void;
  selectedWalletOption: WalletOptionValues;
};

export type WalletSelectorProps = {
  options: WithAllWalletsOption | WithSetActiveWalletTrue | WithSetActiveWalletFalse | StatePropsDefined;
  size?: ButtonProps['size'];
};

const WalletSelector = ({ options, size = 'small' }: WalletSelectorProps) => {
  const { allowAllWalletsOption, onSelectWalletOption, selectedWalletOption, setSelectionAsActive } = options;
  const intl = useIntl();
  const wallets = useWallets();
  const activeWallet = useActiveWallet();
  const accountService = useAccountService();
  const dispatch = useAppDispatch();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModal) {
        openConnectModal();
      }
    },
  });

  const [enableEditLabel, setEnableEditLabel] = React.useState(false);

  console.log(selectedWalletOption, activeWallet?.address);
  const selectedOptionValue = selectedWalletOption || activeWallet?.address || '';

  const onClickWalletItem = (newWallet: WalletOptionValues) => {
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

  const onLogOutUser = () => {
    disconnect();

    accountService.logoutUser();
    dispatch(cleanBalances());
  };

  const connectWalletOption: OptionsMenuOption = {
    label: intl.formatMessage(
      defineMessage({
        defaultMessage: 'Add Wallet',
        description: 'addWallet',
      })
    ),
    Icon: AddEmptyWalletIcon,
    onClick: onConnectWallet,
    control: <AddIcon color="success" />,
    color: 'success',
    type: OptionsMenuOptionType.option,
  };

  const logOutOption: OptionsMenuOption = {
    label: intl.formatMessage(
      defineMessage({
        defaultMessage: 'Log out',
        description: 'logOut',
      })
    ),
    icon: <LogoutIcon color="error" />,
    onClick: onLogOutUser,
    color: 'error',
    type: OptionsMenuOptionType.option,
  };

  const menuOptions = React.useMemo<OptionsMenuOption[]>(() => {
    const selectedWalletActions: OptionsMenuOption[] =
      selectedOptionValue !== ALL_WALLETS
        ? [
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Rename Wallet',
                  description: 'renameWallet',
                })
              ),
              Icon: EditIcon,
              control: <KeyboardArrowRightIcon />,
              onClick: () => setEnableEditLabel(true),
              type: OptionsMenuOptionType.option,
            },
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Copy Address',
                  description: 'copyAddress',
                })
              ),
              secondaryLabel: trimAddress(selectedOptionValue || '', 4),
              Icon: ContentCopyIcon,
              onClick: () => copyTextToClipboard(selectedOptionValue),
              type: OptionsMenuOptionType.option,
            },
            {
              type: OptionsMenuOptionType.divider,
            },
          ]
        : [];

    const walletOptions: OptionsMenuOption[] = [
      ...(allowAllWalletsOption
        ? [
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'All',
                  description: 'allWallets',
                })
              ),
              Icon: WalletIcon,
              onClick: () => onClickWalletItem(ALL_WALLETS),
              control: selectedOptionValue !== ALL_WALLETS ? <KeyboardArrowRightIcon /> : undefined,
              type: OptionsMenuOptionType.option,
            },
          ]
        : []),
      ...(wallets.map(({ address, label, ens }) => {
        const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
        return {
          label: primaryLabel,
          secondaryLabel: secondaryLabel,
          Icon: WalletIcon,
          onClick: () => onClickWalletItem(address),
          control: selectedOptionValue !== address ? <KeyboardArrowRightIcon /> : undefined,
          type: OptionsMenuOptionType.option,
        };
      }) || []),
      { type: OptionsMenuOptionType.divider },
    ];

    return [
      ...selectedWalletActions,
      ...walletOptions,
      connectWalletOption,
      { type: OptionsMenuOptionType.divider },
      logOutOption,
    ];
  }, [selectedOptionValue, wallets]);

  if (!wallets.length) {
    return (
      <OptionsMenu
        options={[connectWalletOption]}
        mainDisplay={intl.formatMessage(
          defineMessage({
            defaultMessage: 'Connect your wallet',
            description: 'connectWallet',
          })
        )}
      />
    );
  }

  const selectedOptionLabel =
    selectedOptionValue === ALL_WALLETS ? (
      intl.formatMessage(
        defineMessage({
          defaultMessage: 'All',
          description: 'allWallets',
        })
      )
    ) : (
      <Address
        address={selectedOptionValue}
        trimAddress
        editable={enableEditLabel}
        disableLabelEdition={() => setEnableEditLabel(false)}
      />
    );

  return (
    <OptionsMenu options={menuOptions} mainDisplay={selectedOptionLabel} blockMenuOpen={enableEditLabel} size={size} />
  );
};

export default WalletSelector;
