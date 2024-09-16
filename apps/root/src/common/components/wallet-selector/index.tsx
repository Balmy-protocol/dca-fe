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
  LightingIcon,
  LogoutIcon,
  TrashIcon,
  useSnackbar,
  Zoom,
} from 'ui-library';
import Address from '../address';
import useActiveWallet from '@hooks/useActiveWallet';
import { defineMessage, useIntl } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import { formatWalletLabel, trimAddress } from '@common/utils/parsing';
import { Address as AddressType, Wallet } from 'common-types';
import useWallets from '@hooks/useWallets';
import { useAppDispatch } from '@state/hooks';
import { cleanBalances, fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { timeoutPromise } from '@balmy/sdk';
import { TimeoutPromises } from '@constants/timing';
import useTransactionService from '@hooks/useTransactionService';
import usePositionService from '@hooks/usePositionService';
import usePrevious from '@hooks/usePrevious';
import { ApiErrorKeys } from '@constants';
import { processConfirmedTransactions } from '@state/transactions/actions';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import UnlinkWalletModal from '../unlink-wallet-modal';
import EditWalletLabelModal from '../edit-label-modal';
import { find } from 'lodash';
import useTrackEvent from '@hooks/useTrackEvent';
import useLabelService from '@hooks/useLabelService';
import useEarnService from '@hooks/earn/useEarnService';

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
  const trackEvent = useTrackEvent();
  const accountService = useAccountService();
  const labelService = useLabelService();
  const dispatch = useAppDispatch();
  const transactionService = useTransactionService();
  const earnService = useEarnService();
  const positionService = usePositionService();
  const prevWallets = usePrevious(wallets);
  const [openUnlinkModal, setOpenUnlinkModal] = React.useState(false);
  const [openEditLabelModal, setOpenEditLabelModal] = React.useState(false);
  const snackbar = useSnackbar();
  const [selectedWallet, setSelectedWallet] = React.useState<Wallet | undefined>(undefined);
  const { disconnect, openConnectModal } = useOpenConnectModal();

  const selectedOptionValue =
    selectedWalletOption || activeWallet?.address || find(wallets, { isAuth: true })?.address || '';

  const onClickWalletItem = (newWallet: WalletOptionValues) => {
    if (setSelectionAsActive && newWallet !== ALL_WALLETS) {
      trackEvent('Wallet selector - Changed active wallet');
      void accountService.setActiveWallet(newWallet);
    } else {
      trackEvent('Wallet selector - Changed view wallet');
    }

    if (onSelectWalletOption) {
      onSelectWalletOption(newWallet);
    }
  };

  const onLogOutUser = () => {
    disconnect();

    accountService.logoutUser();
    dispatch(cleanBalances());
    trackEvent('Wallet selector - User logged out');
  };

  const onOpenUnlinkWalletModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setOpenUnlinkModal(true);
    trackEvent('Wallet selector - Opened unlink wallet modal');
  };

  const onOpenEditWalletLabelModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setOpenEditLabelModal(true);
    trackEvent('Wallet selector - Edited wallet label');
  };

  const onUnlinkWallet = async () => {
    if (!selectedWallet) return;
    setOpenUnlinkModal(false);
    const otherWallets = wallets.filter(({ address }) => selectedWallet.address !== address);

    if (selectedOptionValue === selectedWallet.address)
      onClickWalletItem(allowAllWalletsOption ? ALL_WALLETS : otherWallets[0].address);
    try {
      await accountService.unlinkWallet(selectedWallet.address);
      void labelService.deleteLabel(selectedWallet.address);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'walletUnlinkedSuccessfully',
            defaultMessage: 'Your wallet was removed successfully',
          })
        ),
        {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          TransitionComponent: Zoom,
        }
      );
      dispatch(cleanBalances());
    } catch (e) {
      console.error(e);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'walletUnlinkedError',
            defaultMessage: "We weren't able to remove your wallet. Please try again later",
          })
        ),
        {
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          TransitionComponent: Zoom,
        }
      );
    }
    trackEvent('Wallet selector - Unlinked wallet modal');
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

        void timeoutPromise(earnService.fetchUserStrategies(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.EARN,
        });

        await timeoutPromise(dispatch(fetchInitialBalances()).unwrap(), TimeoutPromises.COMMON, {
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

  const onLinkWallet = () => {
    openConnectModal();
    trackEvent('Wallet selector - Linking new wallet');
  };

  const connectWalletOption: OptionsMenuOption = {
    label: intl.formatMessage(
      defineMessage({
        defaultMessage: 'Add Wallet',
        description: 'addWallet',
      })
    ),
    Icon: AddEmptyWalletIcon,
    onClick: onLinkWallet,
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
    const authWallets = wallets.filter(({ isAuth }) => isAuth);
    const isRemoveDisabled =
      wallets.length === 1 || (authWallets.length === 1 && authWallets[0].address === selectedOptionValue);
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
              onClick: () =>
                onOpenEditWalletLabelModal(wallets.find(({ address }) => address === selectedOptionValue)!),
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
            ...(isRemoveDisabled
              ? []
              : [
                  {
                    label: intl.formatMessage(
                      defineMessage({
                        defaultMessage: 'Delete wallet',
                        description: 'deleteWallet',
                      })
                    ),
                    Icon: TrashIcon,
                    onClick: () =>
                      onOpenUnlinkWalletModal(wallets.find(({ address }) => address === selectedOptionValue)!),
                    type: OptionsMenuOptionType.option,
                    color: 'error',
                  } as OptionsMenuOption,
                ]),
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
      ...(wallets
        .filter(({ address }) => selectedOptionValue !== address)
        .map((wallet) => {
          const { address, label, ens } = wallet;
          const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
          const disableRemove =
            wallets.length === 1 || (authWallets.length === 1 && authWallets[0].address === address);

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
                Icon: LightingIcon,
                onClick: () => onClickWalletItem(address),
                type: OptionsMenuOptionType.option,
              },
              {
                label: intl.formatMessage(
                  defineMessage({
                    defaultMessage: 'Rename Wallet',
                    description: 'renameWallet',
                  })
                ),
                Icon: EditIcon,
                onClick: () => onOpenEditWalletLabelModal(wallet),
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
              ...(disableRemove
                ? []
                : [
                    {
                      label: intl.formatMessage(
                        defineMessage({
                          defaultMessage: 'Delete wallet',
                          description: 'deleteWallet',
                        })
                      ),
                      Icon: TrashIcon,
                      onClick: () => onOpenUnlinkWalletModal(wallet),
                      type: OptionsMenuOptionType.option,
                      color: 'error',
                    } as OptionsMenuOption,
                  ]),
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
      <Address address={selectedOptionValue} trimAddress />
    );

  return (
    <>
      <EditWalletLabelModal
        walletToEdit={selectedWallet}
        open={openEditLabelModal}
        onCancel={() => {
          setOpenEditLabelModal(false);
          setSelectedWallet(undefined);
        }}
      />
      <UnlinkWalletModal
        walletToRemove={selectedWallet}
        open={openUnlinkModal}
        onUnlinkWallet={onUnlinkWallet}
        onCancel={() => {
          setOpenUnlinkModal(false);
          setSelectedWallet(undefined);
        }}
      />
      <OptionsMenu options={menuOptions} mainDisplay={selectedOptionLabel} alwaysUseTypography size={size} />
    </>
  );
};

export default WalletSelector;
