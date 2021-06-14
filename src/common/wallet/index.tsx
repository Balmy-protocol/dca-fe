import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  setWeb3WalletState,
  web3ModalState,
  setAccountState,
  web3WalletState,
  accountState,
} from 'common/wallet-context';
import { FormattedMessage } from 'react-intl';
import { disconnecWallet } from 'utils/web3modal';
import FloatingMenu from '../floating-menu';

interface ConnectWalletButtonProps {
  setWeb3Wallet: setWeb3WalletState;
  web3Modal: web3ModalState;
  setAccount: setAccountState;
  web3Wallet: web3WalletState;
  account: accountState;
  isLoading: Boolean;
}

const WalletButton = ({
  web3Wallet,
  web3Modal,
  setWeb3Wallet,
  account,
  setAccount,
  isLoading,
}: ConnectWalletButtonProps) => {
  const buttonContent = isLoading ? (
    <CircularProgress color="secondary" />
  ) : (
    <Typography noWrap={true}>{account}</Typography>
  );
  return (
    <div>
      <FloatingMenu buttonContent={buttonContent} buttonStyles={{ maxWidth: '200px', textTransform: 'none' }}>
        <MenuItem onClick={() => disconnecWallet(web3Wallet, web3Modal, setWeb3Wallet, setAccount)}>
          <ListItemIcon>
            <LinkOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage description="Disconnect" defaultMessage="Disconnect" />
          </ListItemText>
        </MenuItem>
      </FloatingMenu>
    </div>
  );
};

export default WalletButton;
