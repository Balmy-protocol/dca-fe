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
import { useDisconnect } from 'wagmi';
import { formatWalletLabel, trimAddress } from '@common/utils/parsing';
import { Address as AddressType, Wallet } from 'common-types';
import useWallets from '@hooks/useWallets';
import { LogoutIcon, TrashIcon } from 'ui-library/src/icons';
import { useAppDispatch } from '@state/hooks';
import { cleanBalances, fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { timeoutPromise } from '@mean-finance/sdk';
import { TimeoutPromises } from '@constants/timing';
import useTransactionService from '@hooks/useTransactionService';
import usePositionService from '@hooks/usePositionService';
import useTokenListByChainId from '@hooks/useTokenListByChainId';
import usePrevious from '@hooks/usePrevious';
import { ApiErrorKeys } from '@constants';
import { processConfirmedTransactions } from '@state/transactions/actions';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import UnlinkWalletModal from '../unlink-wallet-modal';

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
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const tokenListByChainId = useTokenListByChainId();
  const prevWallets = usePrevious(wallets);
  const openConnectModal = useOpenConnectModal();
  const [openUnlinkModal, setOpenUnlinkModal] = React.useState(false);
  const [walletToRemove, setWalletToRemove] = React.useState<Wallet | undefined>(undefined);
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModal) {
        openConnectModal();
      }
    },
  });

  const [enableEditLabel, setEnableEditLabel] = React.useState(false);

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

  const onOpenUnlinkWalletModal = (wallet: Wallet) => {
    setWalletToRemove(wallet);
    setOpenUnlinkModal(true);
  };

  const onUnlinkWallet = async () => {
    if (!walletToRemove) return;
    setOpenUnlinkModal(false);
    await accountService.unlinkWallet(walletToRemove.address);
    dispatch(cleanBalances());
  };

  React.useEffect(() => {
    const reFetchWalletsData = async () => {
      try {
        void timeoutPromise(transactionService.fetchTransactionsHistory(undefined, true), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.HISTORY,
        });
        void timeoutPromise(positionService.fetchUserHasPositions(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.HISTORY,
        });
        void timeoutPromise(positionService.fetchCurrentPositions(true), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.DCA_POSITIONS,
        }).then(() => void dispatch(processConfirmedTransactions()));

        await timeoutPromise(dispatch(fetchInitialBalances({ tokenListByChainId })).unwrap(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.BALANCES,
        });
        void timeoutPromise(dispatch(fetchPricesForAllChains()), TimeoutPromises.COMMON);
      } catch (e) {
        console.error(e);
      }
    };

    if (prevWallets && prevWallets.length > 0 && wallets.length !== prevWallets.length) {
      void reFetchWalletsData();
    }
  }, [wallets, prevWallets]);

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
    Icon: LogoutIcon,
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
      ...(allowAllWalletsOption && selectedOptionValue !== ALL_WALLETS
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
              type: OptionsMenuOptionType.option,
            },
          ]
        : []),
      ...(wallets.map((wallet) => {
        const { address, label, ens } = wallet;
        const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
        return {
          label: primaryLabel,
          secondaryLabel: secondaryLabel,
          Icon: WalletIcon,
          control: selectedOptionValue !== address ? <KeyboardArrowRightIcon /> : undefined,
          type: OptionsMenuOptionType.option,
          options: [
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Set as active',
                  description: 'setAsActive',
                })
              ),
              Icon: ContentCopyIcon,
              onClick: () => onClickWalletItem(address),
              type: OptionsMenuOptionType.option,
            },
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Copy Address',
                  description: 'copyAddress',
                })
              ),
              Icon: ContentCopyIcon,
              onClick: () => copyTextToClipboard(address),
              type: OptionsMenuOptionType.option,
            },
            {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Delete wallet',
                  description: 'deleteWallet',
                })
              ),
              Icon: TrashIcon,
              onClick: () => onOpenUnlinkWalletModal(wallet),
              // color: 'error',
              type: OptionsMenuOptionType.option,
            },
            // {
            //   type: OptionsMenuOptionType.divider,
            // },
            //   label: intl.formatMessage(
            //     defineMessage({
            //       defaultMessage: 'Delete wallet',
            //       description: 'deleteWallet',
            //     })
            //   ),
            //   Icon: TrashIcon,
            //   color: 'error',
            //   onClick: () => onUnlinkWallet(address),
            //   type: OptionsMenuOptionType.option,
            // }
          ],
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
    <>
      <UnlinkWalletModal
        walletToRemove={walletToRemove}
        open={openUnlinkModal}
        onUnlinkWallet={onUnlinkWallet}
        onCancel={() => {
          setOpenUnlinkModal(false);
          setWalletToRemove(undefined);
        }}
      />
      <OptionsMenu
        options={menuOptions}
        mainDisplay={selectedOptionLabel}
        blockMenuOpen={enableEditLabel}
        size={size}
      />
    </>
  );
};

export default WalletSelector;
