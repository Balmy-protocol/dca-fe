import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Web3Service } from 'types';
import { FormattedMessage } from 'react-intl';
import FloatingMenu from '../floating-menu';

interface ConnectWalletButtonProps {
  web3Service: Web3Service;
  isLoading: boolean;
}

const WalletButton = ({ web3Service, isLoading }: ConnectWalletButtonProps) => {
  const buttonContent = isLoading ? (
    <CircularProgress color="secondary" />
  ) : (
    <Typography noWrap>{web3Service.getAccount()}</Typography>
  );
  return (
    <div>
      <FloatingMenu
        buttonContent={buttonContent}
        buttonStyles={{ maxWidth: '200px', textTransform: 'none' }}
        isIcon={false}
      >
        <MenuItem onClick={() => web3Service.disconnect()}>
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
