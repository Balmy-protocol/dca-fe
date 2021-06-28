import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';

const StyledBox = styled(Box)`
  flex: 1;
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => (
  <AppBar position="fixed">
    <Toolbar>
      <StyledBox>
        <Typography variant="h6" color="inherit">
          Mean Finance
        </Typography>
      </StyledBox>
      <WalletContext.Consumer>
        {({ web3Service }) =>
          !web3Service.getAccount() && !isLoading ? (
            <ConnectWalletButtom web3Service={web3Service} />
          ) : (
            <WalletButtom isLoading={isLoading} web3Service={web3Service} />
          )
        }
      </WalletContext.Consumer>
    </Toolbar>
  </AppBar>
);

export default NavBar;
