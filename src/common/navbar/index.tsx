import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';

const StyledBox = styled(Box)`
  flex: 1;
`;

interface NavBarProps {
  isLoading: Boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => (
  <AppBar position="static">
    <Toolbar>
      <StyledBox>
        <Typography variant="h6" color="inherit">
          Mean Finance
        </Typography>
      </StyledBox>
      <WalletContext.Consumer>
        {({ web3Wallet, setWeb3Wallet, web3Modal, setAccount, account }) =>
          !web3Wallet && !isLoading ? (
            <ConnectWalletButtom setAccount={setAccount} setWeb3Wallet={setWeb3Wallet} web3Modal={web3Modal} />
          ) : (
            <WalletButtom
              isLoading={isLoading}
              setAccount={setAccount}
              account={account}
              web3Wallet={web3Wallet}
              setWeb3Wallet={setWeb3Wallet}
              web3Modal={web3Modal}
            />
          )
        }
      </WalletContext.Consumer>
    </Toolbar>
  </AppBar>
);

export default NavBar;
