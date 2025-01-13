import React from 'react';
import styled from 'styled-components';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, Modal, TextField, Zoom, useSnackbar } from 'ui-library';
import useAnalytics from '@hooks/useAnalytics';
import { Wallet } from 'common-types';
import useEditLabel from '@hooks/useEditLabel';

const StyledInputsContainer = styled(ContainerBox)``;

interface EditWalletLabelModalProps {
  open: boolean;
  onCancel: () => void;
  walletToEdit?: Wallet;
}

const EditWalletLabelModal = ({ open, onCancel, walletToEdit }: EditWalletLabelModalProps) => {
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const { triggerUpdate } = useEditLabel();
  const snackbar = useSnackbar();
  const [walletLabel, setWalletLabel] = React.useState(walletToEdit?.label || '');

  React.useEffect(() => {
    if (open) {
      setWalletLabel(walletToEdit?.label || '');
    } else {
      setWalletLabel('');
    }
  }, [open]);

  const handleEditLabel = async () => {
    if (!walletToEdit) return;
    onCancel();
    try {
      await triggerUpdate(walletLabel, walletToEdit.address);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'walletRenamedSuccessfully',
            defaultMessage: 'Your wallet has been renamed to {walletLabel}',
          }),
          { walletLabel }
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
    } catch (e) {
      console.error(e);
      snackbar.enqueueSnackbar(
        intl.formatMessage(
          defineMessage({
            description: 'walletRenamedError',
            defaultMessage: "We weren't able to rename your wallet. Please try again later",
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
    trackEvent('Home - Edit wallet label');
  };

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={onCancel}
      maxWidth="sm"
      title={<FormattedMessage description="renameWallet title" defaultMessage="Rename your wallet" />}
      actions={[
        {
          label: <FormattedMessage description="renameWallet Save" defaultMessage="Save" />,
          color: 'primary',
          variant: 'contained',
          onClick: handleEditLabel,
          disabled: walletLabel === (walletToEdit?.label || ''),
        },
      ]}
      actionsAlignment="horizontal"
    >
      <StyledInputsContainer flexDirection="column" fullWidth gap={2}>
        <TextField
          value={walletLabel}
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Wallet Name',
              description: 'walletName',
            })
          )}
          onChange={(e) => setWalletLabel(e.target.value)}
          fullWidth
        />
        <TextField id="editWalletAddress" disabled value={walletToEdit?.address} fullWidth type="text" />
      </StyledInputsContainer>
    </Modal>
  );
};
export default EditWalletLabelModal;
