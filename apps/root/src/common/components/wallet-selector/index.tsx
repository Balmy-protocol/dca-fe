import React from 'react';
import {
  OptionsMenu,
  WalletIcon,
  EditIcon,
  ContentCopyIcon,
  OptionsMenuOption,
  AddIcon,
  EmptyWalletIcon,
  KeyboardArrowRightIcon,
  OptionsMenuOptionType,
} from 'ui-library';
import useUser from '@hooks/useUser';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { defineMessage, useIntl } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { formatWalletLabel, trimAddress } from '@common/utils/parsing';
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
  const accountService = useAccountService();
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

  const connectWalletOption: OptionsMenuOption = {
    label: intl.formatMessage(
      defineMessage({
        defaultMessage: 'Add Wallet',
        description: 'addWallet',
      })
    ),
    icon: <EmptyWalletIcon color="success" />,
    onClick: onConnectWallet,
    control: <AddIcon color="success" />,
    color: 'success',
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
              icon: <EditIcon />,
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
              icon: <ContentCopyIcon />,
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
              icon: <WalletIcon />,
              onClick: () => onClickWalletItem(ALL_WALLETS),
              control: selectedOptionValue !== ALL_WALLETS ? <KeyboardArrowRightIcon /> : undefined,
              type: OptionsMenuOptionType.option,
            },
          ]
        : []),
      ...(user?.wallets.map(({ address, label, ens }) => {
        const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
        return {
          label: primaryLabel,
          secondaryLabel: secondaryLabel,
          icon: <WalletIcon />,
          onClick: () => onClickWalletItem(address),
          control: selectedOptionValue !== address ? <KeyboardArrowRightIcon /> : undefined,
          type: OptionsMenuOptionType.option,
        };
      }) || []),
      { type: OptionsMenuOptionType.divider },
    ];

    return [...selectedWalletActions, ...walletOptions, connectWalletOption];
  }, [selectedOptionValue, user]);

  if (!user || !user.wallets.length) {
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
      <Address address={selectedOptionValue} trimAddress editable={enableEditLabel} onEnableEdit={setEnableEditLabel} />
    );

  return <OptionsMenu options={menuOptions} mainDisplay={selectedOptionLabel} blockMenuOpen={enableEditLabel} />;
};

export default WalletSelector;
