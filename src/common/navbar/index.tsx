import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const NavBar: React.FunctionComponent<null> = () => (
  <AppBar position="static">
    <Toolbar variant="dense">
      <Typography variant="h6" color="inherit">
        Mean Finance
      </Typography>
    </Toolbar>
  </AppBar>
);

export default NavBar;
