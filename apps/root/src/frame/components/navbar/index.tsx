import React from 'react';
import styled from 'styled-components';
import WalletContext from '@common/components/wallet-context';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Divider,
  ListItemText,
  Container,
  Tabs,
  Tab,
  Drawer,
  AppBar,
  Collapse,
  TwitterIcon,
  HelpOutlineOutlinedIcon,
  DescriptionOutlinedIcon,
  GitHubIcon,
  MenuIcon,
  ArrowDropDownIcon,
  InsightsIcon,
  AddIcon,
  CurrencyExchangeIcon,
  ViewListIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
  createStyles,
} from 'ui-library';
import DiscordIcon from '@assets/svg/atom/discord';
import WhaveLogoDark from '@assets/logo/wave_logo_dark';
import { useAppDispatch } from '@state/hooks';
import { useMainTab, useSubTab } from '@state/tabs/hooks';
import { changeMainTab, changeSubTab } from '@state/tabs/actions';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import usePushToHistory from '@hooks/usePushToHistory';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';
import LanguageLabel from '../footer/components/lang-label';

const StyledNavbarWrapper = styled.div`
  width: 100%;
  background: rgba(5, 3, 13, 0.1);
  box-shadow: inset 0px -1px 0px rgba(255, 255, 255, 0.1);
  // padding: 10px 0px;
  padding-top: 10px;
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
  margin-left: 60px;
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
  align-items: center;
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

const RawTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
);

const StyledTabs = styled(RawTabs)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint>; noMargin?: boolean }>`
  ${({ noMargin }) => (noMargin ? 'margin-left: 0px;' : '')}
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  const tabIndex = useMainTab();
  const subTabIndex = useSubTab();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pushToHistory = usePushToHistory();
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [openFirstSubTab, setOpenFirstSubtab] = React.useState(tabIndex === 0);

  React.useEffect(() => {
    if (location.pathname === '/positions') {
      dispatch(changeMainTab(0));
      dispatch(changeSubTab(1));
      setOpenFirstSubtab(true);
      pushToHistory('/positions');
    } else if (location.pathname === '/swap') {
      setOpenFirstSubtab(false);
      dispatch(changeMainTab(2));
      pushToHistory('/swap');
    } else if (location.pathname === '/' || location.pathname === '/create') {
      dispatch(changeMainTab(0));
      dispatch(changeSubTab(0));
      setOpenFirstSubtab(true);
      pushToHistory('/create');
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
      pushToHistory(`/${tabValue.url}`);
    } else {
      setOpenFirstSubtab(!openFirstSubTab);
    }
  };

  const handleSubTabChange = (tabValue: { index: number; mainIndex: number; url: string }) => {
    dispatch(changeMainTab(tabValue.index));
    dispatch(changeSubTab(tabValue.index));
    setOpenDrawer(false);
    pushToHistory(`/${tabValue.url}`);
  };

  const onFaqClick = () => {
    pushToHistory('/faq');
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
                label={<FormattedMessage description="invest" defaultMessage="Invest (DCA)" />}
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
              <ListItemText primary={<FormattedMessage description="invest" defaultMessage="Invest (DCA)" />} />
              {openFirstSubTab ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
        <Container sx={{ display: 'flex', paddingBottom: '10px' }}>
          {currentBreakPoint !== 'xs' && (
            <StyledNavbarMainContent>
              <WhaveLogoDark
                size="45px"
                onClick={() => handleSubTabChange({ index: 0, mainIndex: 0, url: 'create' })}
              />
              <StyledTabs
                breakpoint={currentBreakPoint}
                TabIndicatorProps={{ style: { bottom: '-10px' } }}
                value={tabIndex}
              >
                <StyledTab
                  onClick={() => handleTabChange({ index: 0, url: 'create' }, false)}
                  label={
                    <StyledTabLabel>
                      <FormattedMessage description="invest" defaultMessage="Invest (DCA)" />
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
              {/* <NetworkLabel network={currentNetwork} /> */}
              <WalletContext.Consumer>
                {({ web3Service }) =>
                  !web3Service.getAccount() && !isLoading ? (
                    <ConnectWalletButtom />
                  ) : (
                    <WalletButtom isLoading={isLoading} />
                  )
                }
              </WalletContext.Consumer>
            </StyledButtonContainer>
            {currentBreakPoint === 'xs' && <LanguageLabel />}
          </StyledNavbarEndContent>
        </Container>
        {currentBreakPoint !== 'xs' && (
          <Collapse in={openFirstSubTab}>
            <StyledInsetSeparator />
            <Container>
              <StyledNavbarContainer>
                <StyledSubContent>
                  <StyledTabs breakpoint={currentBreakPoint} value={tabIndex === 0 ? subTabIndex : 1000}>
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
            </Container>
          </Collapse>
        )}
      </StyledNavbarWrapper>
    </>
  );
};

export default NavBar;
