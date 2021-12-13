import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import Link from '@material-ui/core/Link';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import NetworkLabel from 'common/network-label';
import MeanLogo from 'common/mean-logo';
import Brightness3Icon from '@material-ui/icons/Brightness3';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import { useThemeMode } from 'state/config/hooks';
import IconButton from '@material-ui/core/IconButton';
import { toggleTheme } from 'state/config/actions';
import { useAppDispatch } from 'hooks/state';
import WalletButtom from '../wallet';
import ConnectWalletButtom from '../connect-wallet';

const StyledBox = styled(Box)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  flex: 1;
  display: flex;
  ${(props) =>
    props.breakpoint === 'xs'
      ? `
    justify-content: center;
    margin-bottom: 30px;
  `
      : ''}
`;

const StyledNavbarContainer = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledButtonContainer = styled.div<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.breakpoint === 'xs' ? 'center' : 'flex-end')};
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  const currentNetwork = useCurrentNetwork(true);
  const theme = useThemeMode();
  const dispatch = useAppDispatch();

  return (
    <StyledNavbarContainer container>
      <Grid item xs={12} sm={6}>
        <StyledBox breakpoint={currentBreakPoint}>
          <Link href="https://beta.mean.finance">
            <MeanLogo theme={theme} />
          </Link>
        </StyledBox>
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledButtonContainer breakpoint={currentBreakPoint}>
          <NetworkLabel network={currentNetwork} />
          <WalletContext.Consumer>
            {({ web3Service }) =>
              !web3Service.getAccount() && !isLoading ? (
                <ConnectWalletButtom web3Service={web3Service} />
              ) : (
                <WalletButtom isLoading={isLoading} web3Service={web3Service} />
              )
            }
          </WalletContext.Consumer>
          <IconButton onClick={() => dispatch(toggleTheme())} color="inherit">
            {theme === 'dark' ? <WbSunnyIcon /> : <Brightness3Icon />}
          </IconButton>
        </StyledButtonContainer>
      </Grid>
    </StyledNavbarContainer>
  );
};

export default NavBar;
