import React from 'react';
import { Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
// import ConnectWalletOptionModal from '../connect-wallet-option-modal';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  text-transform: none;
`;

const ConnectWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <>
          <StyledButton variant="outlined" onClick={openConnectModal}>
            <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
          </StyledButton>
        </>
      )}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
