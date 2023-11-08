import React from 'react';
import { Paper, Typography, WalletIcon } from 'ui-library';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLogin } from '@privy-io/react-auth';
import PrivyLogo from '@assets/logo/privy_logo';

const StyledWalletOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex: 1;
`;

const StyledOptionContainer = styled(Paper)`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fafafa;
  flex-direction: column;
  cursor: pointer;
  flex: 1;
`;

interface ConnectWalletOptionModalProps {
  open: boolean;
  onClose: () => void;
}

const ConnectWalletOptionModal = ({ open, onClose }: ConnectWalletOptionModalProps) => {
  const { login } = useLogin();

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseIcon
      maxWidth="sm"
      title={<FormattedMessage description="loginOptions" defaultMessage="Login options" />}
    >
      <StyledWalletOptionsContainer>
        <StyledOptionContainer onClick={login}>
          <Typography variant="h6">
            <FormattedMessage description="loginOptionPrivyTitle" defaultMessage="Log in with privy" />
          </Typography>
          <Typography variant="h6">
            <PrivyLogo size="inherit" />
          </Typography>
          <Typography variant="body1">
            <FormattedMessage
              description="loginOptionPrivyDesc"
              defaultMessage="Wow such benefits, mmm multiaccount so good"
            />
          </Typography>
        </StyledOptionContainer>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <>
              <StyledOptionContainer onClick={openConnectModal}>
                <Typography variant="h6">
                  <FormattedMessage
                    description="loginOptionWalletTitle"
                    defaultMessage="Directly connect your wallet"
                  />
                </Typography>
                <WalletIcon fontSize="inherit" />
                <Typography variant="body1">
                  <FormattedMessage
                    description="loginOptionPrivyDesc"
                    defaultMessage="You wont get the amazing benefits of multi-wallet but its not privy :shrug:"
                  />
                </Typography>
              </StyledOptionContainer>
            </>
          )}
        </ConnectButton.Custom>
      </StyledWalletOptionsContainer>
    </Modal>
  );
};

export default ConnectWalletOptionModal;
