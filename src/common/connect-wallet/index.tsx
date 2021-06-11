import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { connecToWallet } from 'utils/web3modal';
import { setWeb3WalletState, web3ModalState, setAccountState } from 'common/wallet-context';

interface ConnectWalletButtonProps {
  setWeb3Wallet: setWeb3WalletState;
  web3Modal: web3ModalState;
  setAccount: setAccountState;
}

const ConnectWalletButton = ({ setWeb3Wallet, web3Modal, setAccount }: ConnectWalletButtonProps) => (
  <Button color="inherit" onClick={() => connecToWallet(setWeb3Wallet, web3Modal, setAccount)}>
    <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
  </Button>
);

export default ConnectWalletButton;
