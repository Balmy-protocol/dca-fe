import React from 'react';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

const NavBar = () => {
  const web3React = useWeb3React();

  console.log(web3React);
  return (
    <div
      onClick={() => {
        alert('clicked');
      }}
    >
      <Button
        color="inherit"
        onClick={() => {
          alert('clicked');
        }}
      >
        <FormattedMessage description="Connect wallet" defaultMessage="Connect Wallet" />
      </Button>
    </div>
  );
};

export default NavBar;
