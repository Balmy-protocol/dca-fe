import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, ContainerBox, colors, Modal } from 'ui-library';
import useTrackEvent from '@hooks/useTrackEvent';
import { Wallet } from 'common-types';

const StyledContactItem = styled(ContainerBox).attrs(() => ({ justifyContent: 'space-between', alignItems: 'center' }))`
  ${({ theme: { palette, spacing } }) => `
  border: 1px solid ${colors[palette.mode].border.border1};
  border-radius: ${spacing(2)};
  background-color: ${colors[palette.mode].background.secondary};
  transition: background 200ms ease-in-out;
  padding: ${spacing(2.25)} ${spacing(4)};
  cursor: pointer;
  text-align: center;
`}
`;

const StyledUnlinkWalletContainer = styled(ContainerBox).attrs(() => ({
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 2,
}))`
  text-align: center;
`;

interface UnlinkWalletModalProps {
  open: boolean;
  onCancel: () => void;
  onUnlinkWallet: () => void;
  walletToRemove?: Wallet;
}

const UnlinkWalletModal = ({ onUnlinkWallet, open, onCancel, walletToRemove }: UnlinkWalletModalProps) => {
  const trackEvent = useTrackEvent();
  const handleUnlinkWallet = () => {
    onUnlinkWallet();
    trackEvent('Home - Unlink wallet');
  };

  let removeWalletMessage;

  if (walletToRemove?.label) {
    removeWalletMessage = (
      <FormattedMessage
        description="removeWalletAliasMessage"
        defaultMessage="Are you sure you want to remove <b>{walletLabel}</b>?"
        values={{ walletLabel: walletToRemove.label, b: (chunks) => <b>{chunks}</b> }}
      />
    );
  } else {
    removeWalletMessage = (
      <FormattedMessage
        description="removeWalletNoAliasMessage"
        defaultMessage="Are you sure you want to remove this wallet?"
      />
    );
  }

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={onCancel}
      maxWidth="sm"
      title={<FormattedMessage description="removeWallet title" defaultMessage="Remove wallet" />}
      actions={[
        {
          label: <FormattedMessage description="removeWallet Remove" defaultMessage="Remove" />,
          color: 'primary',
          variant: 'contained',
          onClick: handleUnlinkWallet,
        },
      ]}
      actionsAlignment="horizontal"
    >
      <StyledUnlinkWalletContainer>
        <Typography variant="h5Bold">{removeWalletMessage}</Typography>
        <StyledContactItem>
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodyBold" noWrap>
              {walletToRemove?.address}
            </Typography>
          </ContainerBox>
        </StyledContactItem>
      </StyledUnlinkWalletContainer>
    </Modal>
  );
};
export default UnlinkWalletModal;
