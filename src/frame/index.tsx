import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from 'common/navbar';
import Home from 'home';

const AppFrame = () => (
  <Router>
    <CssBaseline />
    <div>
      <NavBar />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  </Router>
);
export default AppFrame;
