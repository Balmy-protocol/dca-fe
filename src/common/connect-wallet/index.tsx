import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { connecToWallet } from 'utils/web3modal';
import { SetWeb3WalletState, Web3ModalState, SetAccountState } from 'common/wallet-context';

interface ConnectWalletButtonProps {
  setWeb3Wallet: SetWeb3WalletState;
  web3Modal: Web3ModalState;
  setAccount: SetAccountState;
}

const ConnectWalletButton = ({ setWeb3Wallet, web3Modal, setAccount }: ConnectWalletButtonProps) => (
  <Button color="inherit" onClick={() => connecToWallet(setWeb3Wallet, web3Modal, setAccount)}>
    <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
  </Button>
);

export default ConnectWalletButton;
