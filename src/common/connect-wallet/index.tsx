import React from 'react';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import { Web3Service } from 'types';
import styled from 'styled-components';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  text-transform: none;
`;

interface ConnectWalletButtonProps {
  web3Service: Web3Service;
}

const ConnectWalletButton = ({ web3Service }: ConnectWalletButtonProps) => {
  const currentNetwork = useCurrentNetwork();
  return (
    <StyledButton color="primary" onClick={() => web3Service.connect(currentNetwork.chainId)}>
      <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
    </StyledButton>
  );
};

export default ConnectWalletButton;
