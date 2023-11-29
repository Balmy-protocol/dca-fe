import React from 'react';
import styled from 'styled-components';
import { Menu, MenuItem, ArrowDropDownIcon, createStyles } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import Button from '@common/components/button';
import Address from '../address';
import { FormattedMessage } from 'react-intl';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
// import useWeb3Service from '@hooks/useWeb3Service';
import { useDisconnect } from 'wagmi';
import useSignInWallet from '@hooks/useSignInWallet';
import usePushToHistory from '@hooks/usePushToHistory';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow:
      0 1px 3px 0 rgba(60, 64, 67, 0.302),
      0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  text-transform: none;
`;

const StyledContainer = styled.div``;

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
      borderRadius: '8px',
    },
  })
);

const ActiveSignSelector = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const signInWallet = useSignInWallet();
  // const web3Service = useWeb3Service();
  const { openConnectModal: openConnectModalRef } = useConnectModal();
  const pushToHistory = usePushToHistory();
  const { disconnect } = useDisconnect({
    onSettled() {
      if (openConnectModalRef) {
        openConnectModalRef();
      }
    },
  });

  const handleOpenClose = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleGoToSettings = () => {
    pushToHistory('/settings');
  };

  return (
    <StyledContainer ref={anchorRef}>
      <StyledButton onClick={handleOpenClose} color="default" variant="outlined" endIcon={<ArrowDropDownIcon />}>
        Signed in with <Address trimAddress address={signInWallet?.address || ''} />
      </StyledButton>
      <StyledMenu
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <>
              <MenuItem
                onClick={() => {
                  disconnect();

                  openConnectModal();

                  handleClose();
                }}
              >
                <FormattedMessage defaultMessage="Sign in with another wallet" description="signInOtherWallet" />
              </MenuItem>
            </>
          )}
        </ConnectButton.Custom>
        <MenuItem onClick={handleGoToSettings}>
          <FormattedMessage defaultMessage="Got to settings" description="goToSettings" />
        </MenuItem>
      </StyledMenu>
    </StyledContainer>
  );
};

export default ActiveSignSelector;
