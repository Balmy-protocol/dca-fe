import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import styled from 'styled-components';
import SwapContainer from '../swap-container';
import History from '../history';
import CurrentPositions from '../current-positions';
import WalletContext from 'common/wallet-context';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';

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
  const [tabIndex, setTabIndex] = React.useState(0);
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
          <WalletContext.Consumer>
            {({ web3Service }) => (
              <>
                <Grid item xs={12}>
                  <SwapContainer />
                </Grid>
                {web3Service.getAccount() && (
                  <>
                    <Grid item xs={12} style={{ display: 'flex', paddingBottom: '0px' }}>
                      <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
                        <Tab classes={tabItemStyles} disableRipple label={'Open positions'} />
                        <Tab classes={tabItemStyles} disableRipple label={'Terminated positions'} />
                      </Tabs>
                    </Grid>
                    <Grid item xs={12} style={{ display: 'flex', paddingTop: '0px' }}>
                      {tabIndex === 0 ? (
                        <CurrentPositions web3Service={web3Service} />
                      ) : (
                        <History web3Service={web3Service} />
                      )}
                    </Grid>
                  </>
                )}
              </>
            )}
          </WalletContext.Consumer>
        </>
      )}
    </StyledGridContainer>
  );
};
export default HomeFrame;
