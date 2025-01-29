import { timeoutPromise } from '@balmy/sdk';
import { trimAddress, formatWalletLabel } from '@common/utils/parsing';
import { ApiErrorKeys } from '@constants';
import { TimeoutPromises } from '@constants/timing';
import useEarnService from '@hooks/earn/useEarnService';
import useAccountService from '@hooks/useAccountService';
import useActiveWallet from '@hooks/useActiveWallet';
import useLabelService from '@hooks/useLabelService';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import usePositionService from '@hooks/usePositionService';
import usePrevious from '@hooks/usePrevious';
import useAnalytics from '@hooks/useAnalytics';
import useTransactionService from '@hooks/useTransactionService';
import useWalletClientService from '@hooks/useWalletClientService';
import useWallets from '@hooks/useWallets';
import { WalletActionType } from '@services/accountService';
import { cleanBalances, fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { useAppDispatch } from '@state/hooks';
import { processConfirmedTransactionsForDca, processConfirmedTransactionsForEarn } from '@state/transactions/actions';
import { Wallet } from 'common-types';
import { find } from 'lodash';
import React from 'react';
import { useIntl, defineMessage } from 'react-intl';
import {
  useSnackbar,
  Zoom,
  OptionsMenuOption,
  AddEmptyWalletIcon,
  OptionsMenuOptionType,
  LogoutIcon,
  EditIcon,
  ContentCopyIcon,
  copyTextToClipboard,
  TrashIcon,
  WalletIcon,
  LightingIcon,
  colors,
  ContainerBox,
  KeyboardArrowRightIcon,
  Typography,
  AddIcon,
  SuccessOutlineIcon,
  InfoCircleIcon,
  PenAddIcon,
  Tooltip,
  KeyIcon,
} from 'ui-library';
import { WalletOptionValues, ALL_WALLETS, WalletSelectorBaseProps } from './types';
import styled from 'styled-components';
import Address from '../address';
import useEarnAccess from '@hooks/useEarnAccess';

const StyledCounter = styled(ContainerBox)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    padding: ${spacing(1)};
    width: ${spacing(4)};
    height: ${spacing(4)};
    background-color: ${colors[mode].background.emphasis};
    border-radius: ${spacing(30)};
    align-items: center;
    justify-content: center;
  `}
`;

const useWalletSelectorState = ({ options, showWalletCounter }: WalletSelectorBaseProps) => {
  const { allowAllWalletsOption, onSelectWalletOption, selectedWalletOption, setSelectionAsActive } = options;
  const intl = useIntl();
  const wallets = useWallets();
  const activeWallet = useActiveWallet();
  const { trackEvent } = useAnalytics();
  const accountService = useAccountService();
  const labelService = useLabelService();
  const dispatch = useAppDispatch();
  const transactionService = useTransactionService();
  const earnService = useEarnService();
  const positionService = usePositionService();
  const prevWallets = usePrevious(wallets);
  const [openUnlinkModal, setOpenUnlinkModal] = React.useState(false);
  const [openEditLabelModal, setOpenEditLabelModal] = React.useState(false);
  const [openVerifyOwnershipModal, setOpenVerifyOwnershipModal] = React.useState(false);
  const snackbar = useSnackbar();
  const [selectedWallet, setSelectedWallet] = React.useState<Wallet | undefined>(undefined);
  const openConnectModal = useOpenConnectModal();
  const walletClientService = useWalletClientService();
  const { hasEarnAccess } = useEarnAccess();

  const selectedOptionValue =
    selectedWalletOption || activeWallet?.address || find(wallets, { isAuth: true })?.address || '';

  const allWalletsVerified = wallets.every((wallet) => wallet.isOwner);
  const isSelectedWalletVerified = wallets.find((wallet) => wallet.address === selectedOptionValue)?.isOwner;

  const onClickWalletItem = (newWallet: WalletOptionValues) => {
    trackEvent('Wallet selector - Changed active wallet');
    if (setSelectionAsActive && newWallet !== ALL_WALLETS) {
      void accountService.setActiveWallet(newWallet);
    }
    if (onSelectWalletOption) {
      onSelectWalletOption(newWallet);
    }
  };

  const onLogOutUser = () => {
    walletClientService
      .disconnect()
      .then(() => {
        accountService.logoutUser();
        dispatch(cleanBalances());
        return;
      })
      .catch((e) => console.error('Error while disconnecting wallets', e))
      .finally(() => trackEvent('Wallet selector - User logged out'));
  };

  const onCloseEditLabelModal = React.useCallback(() => {
    setOpenEditLabelModal(false);
    setSelectedWallet(undefined);
  }, [setOpenEditLabelModal, setSelectedWallet]);

  const onCloseUnlinkModal = React.useCallback(() => {
    setOpenUnlinkModal(false);
    setSelectedWallet(undefined);
  }, [setOpenUnlinkModal, setSelectedWallet]);

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

  const onOpenVerifyOwnershipModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setOpenVerifyOwnershipModal(true);
    trackEvent('Wallet selector - Opened verify ownership modal');
  };

  const onCloseVerifyOwnershipModal = () => {
    setOpenVerifyOwnershipModal(false);
    setSelectedWallet(undefined);
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
        void timeoutPromise(
          transactionService.fetchTransactionsHistory({ isFetchMore: false }),
          TimeoutPromises.COMMON,
          {
            description: ApiErrorKeys.HISTORY,
          }
        );
        void timeoutPromise(positionService.fetchUserHasPositions(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.HISTORY,
        });
        void timeoutPromise(positionService.fetchCurrentPositions(true), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.DCA_POSITIONS,
        }).then(() => void dispatch(processConfirmedTransactionsForDca()));

        if (hasEarnAccess) {
          void timeoutPromise(earnService.fetchUserStrategies(), TimeoutPromises.COMMON, {
            description: ApiErrorKeys.EARN,
          }).then(() => void dispatch(processConfirmedTransactionsForEarn()));
        }

        void timeoutPromise(labelService.fetchManyEns(wallets.map((w) => w.address)), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.ENS,
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

  const onConnectWallet = () => {
    openConnectModal(WalletActionType.connect);
    trackEvent('Wallet selector - Connect wallet');
  };

  const onLinkWallet = () => {
    openConnectModal(WalletActionType.link);
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
        .sort((a) => (a.isAuth ? -1 : 1))
        .map((wallet) => {
          const { address, label, ens } = wallet;
          const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
          const disableRemove =
            wallets.length === 1 || (authWallets.length === 1 && authWallets[0].address === address);

          return {
            label: primaryLabel,
            secondaryLabel: secondaryLabel,
            Icon: WalletIcon,
            control:
              selectedOptionValue !== address ? (
                <ContainerBox gap={1} alignItems="center">
                  {wallet.isOwner ? <SuccessOutlineIcon /> : <InfoCircleIcon sx={{ transform: 'rotate(180deg)' }} />}
                  {wallet.isAuth && (
                    <Tooltip
                      title={intl.formatMessage(
                        defineMessage({
                          defaultMessage: 'This is your main wallet that you use to log in to your account',
                          description: 'wallet-selector.wallet.auth-tooltip',
                        })
                      )}
                      placement="top"
                      arrow
                    >
                      <ContainerBox>
                        <KeyIcon />
                      </ContainerBox>
                    </Tooltip>
                  )}
                  <KeyboardArrowRightIcon />
                </ContainerBox>
              ) : undefined,
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
              ...(!wallet.isOwner
                ? [
                    {
                      label: intl.formatMessage(
                        defineMessage({
                          defaultMessage: 'Ownership',
                          description: 'wallet-selector.ownership',
                        })
                      ),
                      Icon: PenAddIcon,
                      control: (
                        <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].accentPrimary}>
                          {intl.formatMessage(
                            defineMessage({
                              defaultMessage: 'Verify ownership',
                              description: 'wallet-selector.verify-ownership',
                            })
                          )}
                        </Typography>
                      ),
                      onClick: () => onOpenVerifyOwnershipModal(wallet),
                      type: OptionsMenuOptionType.option,
                    },
                  ]
                : []),
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

  const selectedOptionLabel =
    selectedOptionValue === ALL_WALLETS ? (
      <ContainerBox alignItems="center" gap={2}>
        <ContainerBox alignItems="center" gap={1}>
          <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            {intl.formatMessage(
              defineMessage({
                defaultMessage: 'All',
                description: 'allWallets',
              })
            )}
          </Typography>
          {allWalletsVerified ? (
            <SuccessOutlineIcon />
          ) : (
            <InfoCircleIcon
              sx={{ color: ({ palette }) => colors[palette.mode].semantic.warning.darker, transform: 'rotate(180deg)' }}
            />
          )}
        </ContainerBox>
        {showWalletCounter ? (
          <StyledCounter>
            <Typography variant="labelRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
              {wallets.length}
            </Typography>
          </StyledCounter>
        ) : null}
      </ContainerBox>
    ) : (
      <ContainerBox alignItems="center" gap={1}>
        <Address address={selectedOptionValue} trimAddress />
        {isSelectedWalletVerified && <SuccessOutlineIcon />}
      </ContainerBox>
    );

  return React.useMemo(
    () => ({
      selectedWallet,
      openEditLabelModal,
      onCloseEditLabelModal,
      onCloseUnlinkModal,
      onUnlinkWallet,
      openUnlinkModal,
      openVerifyOwnershipModal,
      onCloseVerifyOwnershipModal,
      onOpenVerifyOwnershipModal,
      selectedOptionLabel,
      menuOptions,
      onConnectWallet,
      wallets,
    }),
    [
      selectedWallet,
      openEditLabelModal,
      onCloseEditLabelModal,
      onCloseUnlinkModal,
      onUnlinkWallet,
      openUnlinkModal,
      openVerifyOwnershipModal,
      onCloseVerifyOwnershipModal,
      onOpenVerifyOwnershipModal,
      selectedOptionLabel,
      menuOptions,
      onConnectWallet,
      wallets,
    ]
  );
};

export default useWalletSelectorState;
