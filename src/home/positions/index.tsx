import React from 'react';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import { appleTabsStylesHook } from 'common/tabs';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeOpenClosePositionTab } from 'state/tabs/actions';
import History from '../history';
import CurrentPositions from '../current-positions';

const StyledTitleContainer = styled(Paper)`
  ${({ theme }) => `
    padding: 25px;
    border-radius: 10px;
    flex-grow: 0;
    border: 1px solid ${theme.palette.type === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
    margin-bottom: 15px;
    flex-grow: 1;
    margin-top: 15px;
  `}
`;

const StyledPaper = styled(Paper)`
  ${({ theme }) => `
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 25px;
    border-radius: 10px;
    border: 1px solid ${theme.palette.type === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
  `}
`;
const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();

  return (
    <>
      <Grid item xs={12} style={{ display: 'flex' }}>
        <StyledTitleContainer elevation={3}>
          <Typography variant="h4">
            <FormattedMessage description="positions title" defaultMessage="Your positions" />
          </Typography>
          <Typography variant="body1">
            <FormattedMessage
              description="positions description"
              defaultMessage="Here you will see the details of your open positions and be able to see further details about them"
            />
          </Typography>
        </StyledTitleContainer>
      </Grid>
      <Grid item xs={12} style={{ display: 'flex', paddingTop: '0px' }}>
        <StyledPaper elevation={3}>
          <Grid container>
            <Grid item xs={12} style={{ display: 'flex', paddingBottom: '15px' }}>
              <Tabs
                classes={tabsStyles}
                value={tabIndex}
                onChange={(e, index) => dispatch(changeOpenClosePositionTab(index))}
              >
                <Tab classes={tabItemStyles} disableRipple label="Open positions" />
                <Tab classes={tabItemStyles} disableRipple label="Terminated positions" />
              </Tabs>
            </Grid>
            <Grid item xs={12}>
              {tabIndex === 0 ? <CurrentPositions /> : <History />}
            </Grid>
          </Grid>
        </StyledPaper>
      </Grid>
    </>
  );
};
export default Positions;
