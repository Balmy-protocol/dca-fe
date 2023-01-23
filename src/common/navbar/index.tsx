import React from 'react';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import IconButton from '@mui/material/IconButton';
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from 'assets/svg/atom/discord';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import NetworkLabel from 'common/network-label';
import WhaveLogoDark from 'assets/logo/wave_logo_dark';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useAppDispatch } from 'state/hooks';
import { useMainTab, useSubTab } from 'state/tabs/hooks';
import { changeMainTab, changeSubTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Collapse from '@mui/material/Collapse';
import { useHistory, useLocation } from 'react-router-dom';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import AppBar from '@mui/material/AppBar';
import ListItemText from '@mui/material/ListItemText';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';

const StyledNavbarWrapper = styled.div`
  width: 100%;
  background: rgba(5, 3, 13, 0.1);
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  padding: 10px 0px;
  position: sticky;
  top: 0;
  // background: #121212;
  z-index: 90;
  backdrop-filter: blur(15px);
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
  align-items: center;
  gap: 10px;
`;

const StyledSubContent = styled.div`
  display: flex;
  flex: 1;
  margin-left: 45px;
`;

const StyledInsetSeparator = styled.div`
  display: flex;
  flex: 1;
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  height: 1px;
`;

const StyledTabLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledNavbarEndContent = styled.div<{ small: boolean }>`
  display: flex;
  ${({ small }) => (small ? 'flex: 1;' : '')}
  ${({ small }) => (small ? 'padding: 0 10px;' : '')}
  ${({ small }) => (small ? 'justify-content: space-between;' : '')}
`;

const StyledButtonContainer = styled.div<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.breakpoint === 'xs' ? 'space-between' : 'flex-end')};
  ${(props) => (props.breakpoint === 'xs' ? 'flex: 1;' : '')}
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  padding: 5px 10px;
`;

const StyledAppbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 10px;
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

const StyledTabs = styled(RawTabs)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint>; noMargin?: boolean }>`
  margin-left: ${({ breakpoint }) => (breakpoint !== 'xl' ? '50px' : '145px')};
  ${({ noMargin }) => (noMargin ? 'margin-left: 0px;' : '')}
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  const currentNetwork = useCurrentNetwork();
  const history = useHistory();
  const tabIndex = useMainTab();
  const subTabIndex = useSubTab();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [openFirstSubTab, setOpenFirstSubtab] = React.useState(tabIndex === 0);

  React.useEffect(() => {
    if (location.pathname === '/positions') {
      dispatch(changeMainTab(0));
      dispatch(changeSubTab(1));
      setOpenFirstSubtab(true);
      history.push(`/positions`);
    } else if (location.pathname === '/swap') {
      setOpenFirstSubtab(false);
      dispatch(changeMainTab(2));
      history.push(`/swap`);
    } else if (location.pathname === '/' || location.pathname === '/create') {
      dispatch(changeMainTab(0));
      dispatch(changeSubTab(0));
      setOpenFirstSubtab(true);
      history.push(`/create`);
    }
  }, []);

  React.useEffect(() => {
    setOpenFirstSubtab(tabIndex === 0);
  }, [tabIndex]);

  const handleTabChange = (tabValue: { index: number; url: string }, isMainTab = true) => {
    if (isMainTab) {
      dispatch(changeMainTab(tabValue.index));
      dispatch(changeSubTab(0));
      setOpenDrawer(false);
      setOpenFirstSubtab(false);
      history.push(`/${tabValue.url}`);
    } else {
      setOpenFirstSubtab(!openFirstSubTab);
    }
  };

  const handleSubTabChange = (tabValue: { index: number; mainIndex: number; url: string }) => {
    dispatch(changeMainTab(tabValue.index));
    dispatch(changeSubTab(tabValue.index));
    setOpenDrawer(false);
    history.push(`/${tabValue.url}`);
  };

  const onFaqClick = () => {
    history.push('/faq');
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      {currentBreakPoint === 'xs' && (
        <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
          <StyledAppbarContainer>
            <WhaveLogoDark size="45px" onClick={() => handleSubTabChange({ index: 0, mainIndex: 0, url: 'create' })} />
            <StyledTabs
              breakpoint={currentBreakPoint}
              TabIndicatorProps={{ style: { bottom: '-10px' } }}
              value={tabIndex}
              noMargin
            >
              <StyledTab
                onClick={() => handleTabChange({ index: 0, url: 'create' })}
                label={<FormattedMessage description="invest" defaultMessage="Invest" />}
                value={1000}
                sx={{ ...(tabIndex === 0 ? { color: '#90caf9' } : {}) }}
              />
              <StyledTab
                onClick={() => handleTabChange({ index: 2, url: 'swap' })}
                label={<FormattedMessage description="swap" defaultMessage="Swap" />}
                value={2}
              />
            </StyledTabs>
            <IconButton onClick={() => setOpenDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </StyledAppbarContainer>
        </AppBar>
      )}
      <StyledNavbarWrapper>
        <Drawer anchor="bottom" open={openDrawer} onClose={() => setOpenDrawer(false)}>
          <List>
            <ListItemButton onClick={() => handleTabChange({ index: 0, url: 'create' }, false)}>
              <ListItemIcon>
                <InsightsIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="invest" defaultMessage="Invest" />} />
              {openFirstSubTab ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openFirstSubTab} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleSubTabChange({ index: 0, mainIndex: 0, url: 'create' })}
                >
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary={<FormattedMessage description="create" defaultMessage="Create" />} />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleSubTabChange({ index: 1, mainIndex: 0, url: 'positions' })}
                >
                  <ListItemIcon>
                    <ViewListIcon />
                  </ListItemIcon>
                  <ListItemText primary={<FormattedMessage description="positions" defaultMessage="Positions" />} />
                </ListItemButton>
              </List>
            </Collapse>
            <ListItemButton onClick={() => handleTabChange({ index: 2, url: 'swap' })}>
              <ListItemIcon>
                <CurrencyExchangeIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="swap" defaultMessage="Swap" />} />
            </ListItemButton>
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={() => openExternalLink('https://github.com/Mean-Finance')}>
              <ListItemIcon>
                <GitHubIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="github" defaultMessage="Github" />} />
            </ListItemButton>
            <ListItemButton onClick={() => openExternalLink('https://twitter.com/mean_fi')}>
              <ListItemIcon>
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="docs" defaultMessage="Twitter" />} />
            </ListItemButton>
            <ListItemButton onClick={() => openExternalLink('http://discord.mean.finance')}>
              <ListItemIcon>
                <DiscordIcon size="24px" />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="discord" defaultMessage="Discord" />} />
            </ListItemButton>
            <ListItemButton onClick={() => openExternalLink('https://docs.mean.finance')}>
              <ListItemIcon>
                <DescriptionOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="docs" defaultMessage="Docs" />} />
            </ListItemButton>
            <ListItemButton onClick={onFaqClick}>
              <ListItemIcon>
                <HelpOutlineOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={<FormattedMessage description="faq" defaultMessage="FAQ" />} />
            </ListItemButton>
          </List>
        </Drawer>
        <StyledNavbarContainer>
          {currentBreakPoint !== 'xs' && (
            <StyledNavbarMainContent>
              <WhaveLogoDark
                size="45px"
                onClick={() => handleSubTabChange({ index: 0, mainIndex: 0, url: 'create' })}
              />
              <StyledTabs
                breakpoint={currentBreakPoint}
                TabIndicatorProps={{ style: { bottom: openFirstSubTab ? '0px' : '-10px' } }}
                value={tabIndex}
              >
                <StyledTab
                  onClick={() => handleTabChange({ index: 0, url: 'create' }, false)}
                  label={
                    <StyledTabLabel>
                      <FormattedMessage description="invest" defaultMessage="Invest" />
                      <ArrowDropDownIcon fontSize="inherit" />
                    </StyledTabLabel>
                  }
                  value={1000}
                  sx={{ ...(tabIndex === 0 ? { color: '#90caf9' } : {}) }}
                />
                <StyledTab
                  onClick={() => handleTabChange({ index: 2, url: 'swap' })}
                  label={<FormattedMessage description="swap" defaultMessage="Swap" />}
                  value={2}
                />
              </StyledTabs>
            </StyledNavbarMainContent>
          )}
          <StyledNavbarEndContent small={currentBreakPoint === 'xs'}>
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
        {currentBreakPoint !== 'xs' && (
          <Collapse in={openFirstSubTab}>
            <StyledInsetSeparator />
            <StyledNavbarContainer>
              <StyledSubContent>
                <StyledTabs
                  breakpoint={currentBreakPoint}
                  TabIndicatorProps={{ style: { bottom: '-10px' } }}
                  value={tabIndex === 0 ? subTabIndex : 1000}
                >
                  <StyledTab
                    onClick={() => handleSubTabChange({ index: 0, mainIndex: 0, url: 'create' })}
                    label={<FormattedMessage description="create" defaultMessage="Create" />}
                  />
                  <StyledTab
                    onClick={() => handleSubTabChange({ index: 1, mainIndex: 0, url: 'positions' })}
                    label={<FormattedMessage description="positions" defaultMessage="Positions" />}
                  />
                </StyledTabs>
              </StyledSubContent>
            </StyledNavbarContainer>
          </Collapse>
        )}
      </StyledNavbarWrapper>
    </>
  );
};

export default NavBar;
