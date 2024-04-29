import React from 'react';
import styled from 'styled-components';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, Modal, TextField, Zoom, useSnackbar } from 'ui-library';
import useTrackEvent from '@hooks/useTrackEvent';
import { Wallet } from 'common-types';
import useEditLabel from '@hooks/useEditLabel';
import useStoredLabels from '@hooks/useStoredLabels';

const StyledInputsContainer = styled(ContainerBox)`
  margin: ${({ theme: { spacing } }) => `${spacing(7)} 0`};
`;

interface EditWalletLabelModalProps {
  open: boolean;
  onCancel: () => void;
  walletToEdit?: Wallet;
}

const EditWalletLabelModal = ({ open, onCancel, walletToEdit }: EditWalletLabelModalProps) => {
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const { triggerUpdate } = useEditLabel();
  const storedLabels = useStoredLabels();
  const snackbar = useSnackbar();
  const [userHasModifiedLabel, setUserHasModifiedLabel] = React.useState(false);
  const [walletLabel, setWalletLabel] = React.useState(storedLabels[walletToEdit?.address || '']?.label || '');

  const handleEditLabel = async () => {
    if (!walletToEdit) return;
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
    setUserHasModifiedLabel(false);
    onCancel();
    trackEvent('Home - Edit wallet label');
  };

  const onModifyInput = (newValue: string) => {
    setUserHasModifiedLabel(true);
    setWalletLabel(newValue);
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
          disabled: walletLabel === '' && !userHasModifiedLabel,
        },
      ]}
      actionsAlignment="horizontal"
    >
      <ContainerBox flexDirection="column" fullWidth alignItems="center">
        <StyledInputsContainer flexDirection="column" fullWidth gap={2}>
          <TextField
            value={walletLabel}
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Wallet Name',
                description: 'walletName',
              })
            )}
            onChange={(e) => onModifyInput(e.target.value)}
            fullWidth
          />
          <TextField id="editWalletAddress" disabled value={walletToEdit?.address} fullWidth type="text" />
        </StyledInputsContainer>
      </ContainerBox>
    </Modal>
  );
};
export default EditWalletLabelModal;
