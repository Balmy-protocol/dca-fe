import React from 'react';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import styled from 'styled-components';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useMainTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeMainTab } from 'state/tabs/actions';
import SwapContainer from '../swap-container';
import Positions from '../positions';

interface HomeFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    (!['isLoading'].includes(prop) && defaultValidatorFn(prop)) || ['container'].includes(prop),
})<HomeFrameProps>`
  height: ${(props) => (props.isLoading ? `calc(100% + ${(props?.spacing || 0) * 4}px)` : 'auto')}; ;
`;

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const tabIndex = useMainTab();
  const dispatch = useAppDispatch();
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();

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
