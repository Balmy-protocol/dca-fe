import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import styled from 'styled-components';
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

interface ConnectWalletButtonProps {
  setWeb3Wallet: setWeb3WalletState;
  web3Modal: web3ModalState;
  setAccount: setAccountState;
  web3Wallet: web3WalletState;
  account: accountState;
  isLoading: Boolean;
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const StyledButton = styled(Button)`
  max-width: 200px;
  text-transform: none;
`;

const WalletButton = ({
  web3Wallet,
  web3Modal,
  setWeb3Wallet,
  account,
  setAccount,
  isLoading,
}: ConnectWalletButtonProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  debugger;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const

  return (
    <div>
      <StyledButton
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        {isLoading ? <CircularProgress color="secondary" /> : <Typography noWrap={true}>{account}</Typography>}
      </StyledButton>
      <StyledMenu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => disconnecWallet(web3Wallet, web3Modal, setWeb3Wallet, setAccount)}>
          <ListItemIcon>
            <LinkOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <FormattedMessage description="Disconnect" defaultMessage="Disconnect" />
          </ListItemText>
        </MenuItem>
      </StyledMenu>
    </div>
  );
};

export default WalletButton;
