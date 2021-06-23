import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import Web3Service from 'services/web3Service';

interface ConnectWalletButtonProps {
  web3Service: Web3Service;
}

const ConnectWalletButton = ({ web3Service }: ConnectWalletButtonProps) => (
  <Button color="inherit" onClick={() => web3Service.connect()}>
    <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
  </Button>
);

export default ConnectWalletButton;
