import React from 'react';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeOpenClosePositionTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import History from '../history';
import CurrentPositions from '../current-positions';

const StyledTab = withStyles(() =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      color: 'rgba(255,255,255,0.5)',
    },
    selected: {
      color: '#FFFFFF !important',
      fontWeight: '500',
    },
  })
)(Tab);

const StyledTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
    indicator: {
      background: '#3076F6',
    },
  })
)(Tabs);

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
`;

const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();

  return (
    <>
      <Grid item xs={12} style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
        <Typography variant="h4">
          <FormattedMessage description="positions title" defaultMessage="Your positions" />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="positions description"
            defaultMessage="Here you will see the details of your open positions and be able to see further details about them"
          />
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ display: 'flex', paddingTop: '0px' }}>
        <Grid container>
          <Grid item xs={12} style={{ display: 'flex', paddingBottom: '15px' }}>
            <StyledTabs
              value={tabIndex}
              onChange={(e, index) => dispatch(changeOpenClosePositionTab(index))}
              TabIndicatorProps={{ style: { bottom: '8px' } }}
            >
              <StyledTab
                disableRipple
                label={
                  <Typography variant="h6">
                    <FormattedMessage description="openPositions" defaultMessage="Open positions" />
                  </Typography>
                }
              />
              <StyledTab
                disableRipple
                sx={{ marginLeft: '32px' }}
                label={
                  <Typography variant="h6">
                    <FormattedMessage description="terminatedPositions" defaultMessage="Terminated positions" />
                  </Typography>
                }
              />
            </StyledTabs>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper variant="outlined">{tabIndex === 0 ? <CurrentPositions /> : <History />}</StyledPaper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Positions;
