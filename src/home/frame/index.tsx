import React from 'react';
import find from 'lodash/find';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import styled from 'styled-components';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useMainTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeMainTab } from 'state/tabs/actions';
import { useParams } from 'react-router-dom';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';
import { setNetwork } from 'state/config/actions';
import { NetworkStruct } from 'types';
import useWeb3Service from 'hooks/useWeb3Service';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import SwapContainer from '../swap-container';
import Positions from '../positions';

interface HomeFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    (!['isLoading'].includes(prop) && defaultValidatorFn(prop)) || ['container'].includes(prop),
})<HomeFrameProps>``;
// height: ${(props) => (props.isLoading ? `calc(100% + ${(parseInt(props?.spacing || '0', 10) || 0) * 4}px)` : 'auto')}; ;

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const tabIndex = useMainTab();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  const currentNetwork = useCurrentNetwork();
  const { chainId } = useParams<{ chainId: string }>();

  React.useEffect(() => {
    if (
      chainId &&
      SUPPORTED_NETWORKS.includes(parseInt(chainId, 10)) &&
      chainId !== currentNetwork.chainId.toString()
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      web3Service.changeNetwork(parseInt(chainId, 10));
    }
  }, [chainId, currentNetwork]);

  return (
    <StyledGridContainer container spacing={8} isLoading={isLoading}>
      {isLoading ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <>
          <Grid item xs={12} style={{ display: 'flex', paddingBottom: '0px', justifyContent: 'center' }}>
            <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => dispatch(changeMainTab(index))}>
              <Tab classes={tabItemStyles} disableRipple label="Create" />
              <Tab classes={tabItemStyles} disableRipple label="Positions" />
              <Tab
                classes={tabItemStyles}
                disableRipple
                label="Leaderboard"
                onClick={() => window.open('https://mean.finance/leaderboard', '_blank')}
              />
            </Tabs>
          </Grid>
          {tabIndex === 0 ? (
            <Grid item xs={12}>
              <SwapContainer />
            </Grid>
          ) : (
            <Positions />
          )}
        </>
      )}
    </StyledGridContainer>
  );
};
export default HomeFrame;
