import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ConnectWalletButtom from '../connect-wallet';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';

const StyledBox = styled(Box)`
  flex: 1;
`;

const NavBar = () => (
  <AppBar position="static">
    <Toolbar>
      <StyledBox>
        <Typography variant="h6" color="inherit">
          Mean Finance
        </Typography>
      </StyledBox>
      <ConnectWalletButtom />
    </Toolbar>
  </AppBar>
);

export default NavBar;
