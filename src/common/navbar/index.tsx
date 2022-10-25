import React from 'react';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import NetworkLabel from 'common/network-label';
import WhaveLogoDark from 'assets/logo/wave_logo_dark';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useAppDispatch } from 'state/hooks';
import { useMainTab } from 'state/tabs/hooks';
import { changeMainTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';

const StyledNavbarWrapper = styled.div`
  width: 100%;
  background: rgba(5, 3, 13, 0.1);
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  padding: 10px;
  position: sticky;
  top: 0;
  background: #121212;
  z-index: 90;
`;

const StyledNavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1500px;
  margin: 0 auto;
  width: 100%;
`;

const StyledNavbarMainContent = styled.div`
  display: flex;
  flex: 1;
`;

const StyledNavbarEndContent = styled.div`
  display: flex;
`;

const StyledButtonContainer = styled.div<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.breakpoint === 'xs' ? 'center' : 'flex-end')};
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  padding: 5px 10px;
`;

const RawTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
)(Tabs);

const StyledTabs = styled(RawTabs)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  margin-left: ${({ breakpoint }) => (breakpoint !== 'xl' ? '50px' : '145px')};
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  const currentNetwork = useCurrentNetwork();
  const history = useHistory();
  const tabIndex = useMainTab();
  const dispatch = useAppDispatch();
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/positions') {
      dispatch(changeMainTab(1));
      history.push(`/positions`);
    } else if (location.pathname === '/' || location.pathname === '/create') {
      dispatch(changeMainTab(0));
      history.push(`/create`);
    }
  }, []);

  const handleTabChange = (tabValue: { index: number; url: string }) => {
    dispatch(changeMainTab(tabValue.index));
    history.push(`/${tabValue.url}`);
  };

  return (
    <StyledNavbarWrapper>
      <StyledNavbarContainer>
        <StyledNavbarMainContent>
          <WhaveLogoDark size="45px" />
          <StyledTabs
            breakpoint={currentBreakPoint}
            TabIndicatorProps={{ style: { bottom: '-10px' } }}
            value={tabIndex}
          >
            <StyledTab
              onClick={() => handleTabChange({ index: 0, url: 'create' })}
              label={<FormattedMessage description="create" defaultMessage="Create" />}
            />
            <StyledTab
              onClick={() => handleTabChange({ index: 1, url: 'positions' })}
              label={<FormattedMessage description="positions" defaultMessage="Positions" />}
            />
            <StyledTab
              onClick={() => handleTabChange({ index: 2, url: 'swap' })}
              label={<FormattedMessage description="swap" defaultMessage="Swap" />}
            />
          </StyledTabs>
        </StyledNavbarMainContent>
        <StyledNavbarEndContent>
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
          </StyledButtonContainer>
        </StyledNavbarEndContent>
      </StyledNavbarContainer>
    </StyledNavbarWrapper>
  );
};

export default NavBar;
