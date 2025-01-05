import React from 'react';
import { WalletStatus } from 'common-types';
import { Modal, useSnackbar } from 'ui-library';
import { defineMessage, useIntl } from 'react-intl';
import { getDisplayWallet } from '@common/utils/parsing';
import useAccountService from '@hooks/useAccountService';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useAnalytics from '@hooks/useAnalytics';
import { WalletActionType } from '@services/accountService';
import useWallet from '@hooks/useWallet';
import { Address } from 'viem';

interface VerifyWalletModalProps {
  open: boolean;
  onClose: () => void;
  walletAddress?: Address;
}

export const VerifyWalletModal = ({ open, onClose, walletAddress }: VerifyWalletModalProps) => {
  const intl = useIntl();
  const walletObject = useWallet(walletAddress || '');
  const walletDisplay = getDisplayWallet(walletObject);

  const { trackEvent } = useAnalytics();
  const accountService = useAccountService();
  const { enqueueSnackbar } = useSnackbar();

  const openConnectModal = useOpenConnectModal();

  const onVerifyOwnership = async () => {
    if (!walletAddress) return;
    try {
      onClose();
      await accountService.verifyWalletOwnership(walletAddress);
      enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ defaultMessage: 'Wallet verified', description: 'verify-ownership-modal.success' })
        ),
        { variant: 'success' }
      );
    } catch (e) {
      console.error(e);
      enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ defaultMessage: 'Failed to verify wallet', description: 'verify-ownership-modal.error' })
        ),
        { variant: 'error' }
      );
    }
  };

  const onSwitchWallet = () => {
    trackEvent('Verify wallet modal - Switch wallet');

    openConnectModal(WalletActionType.reconnect);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseIcon
      closeOnBackdrop
      showCloseButton
      maxWidth="sm"
      title={intl.formatMessage(
        defineMessage({
          defaultMessage: 'Verify ownership',
          description: 'verify-ownership-modal.title',
        })
      )}
      subtitle={intl.formatMessage(
        defineMessage({
          defaultMessage:
            'To confirm that <b>{wallet}</b> belongs to you, please connect and sign with your wallet. This step ensures secure verification and allows you to unlock all associated features.',
          description: 'verify-ownership-modal.subtitle',
        }),
        {
          wallet: walletDisplay,
          b: (chunks: React.ReactNode) => <b>{chunks}</b>,
        }
      )}
      actions={
        !walletObject || walletObject.status === WalletStatus.connected
          ? [
              {
                label: intl.formatMessage(
                  defineMessage({ defaultMessage: 'Verify', description: 'verify-ownership-modal.verify' })
                ),
                onClick: onVerifyOwnership,
                variant: 'contained',
                disabled: !walletObject,
              },
            ]
          : [
              {
                label: intl.formatMessage(
                  defineMessage({
                    defaultMessage: "Switch to {wallet}'s wallet",
                    description: 'verify-ownership-modal.switch-wallet',
                  }),
                  {
                    wallet: walletDisplay,
                  }
                ),
                onClick: onSwitchWallet,
                variant: 'contained',
              },
            ]
      }
      actionsAlignment="horizontal"
    />
  );
};
