import React, { useState } from 'react';
import { TextField, Typography } from 'ui-library';
import Modal from '@common/components/modal';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import useAccountService from '@hooks/useAccountService';

const StyledWalletOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

interface NewAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const NewAccountModal = ({ open, onClose }: NewAccountModalProps) => {
  const [username, setUserName] = useState('');
  const intl = useIntl();
  const accountService = useAccountService();
  const onCreateUser = async () => {
    await accountService.createUser({ label: username });
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="loginOptions" defaultMessage="Login options" />}
      actions={[
        {
          label: <FormattedMessage description="createAccount" defaultMessage="Create account" />,
          onClick: onCreateUser,
        },
      ]}
    >
      <StyledWalletOptionsContainer>
        <Typography variant="body1">
          <FormattedMessage description="setNameUser" defaultMessage="Set a name for your user" />
        </Typography>
        <TextField
          id="username"
          value={username}
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Set your new username',
              description: 'setNewUsernameHelp',
            })
          )}
          autoComplete="off"
          autoCorrect="off"
          fullWidth
          type="text"
          margin="normal"
          spellCheck="false"
          onChange={(evt) => setUserName(evt.target.value)}
        />
      </StyledWalletOptionsContainer>
    </Modal>
  );
};

export default NewAccountModal;
