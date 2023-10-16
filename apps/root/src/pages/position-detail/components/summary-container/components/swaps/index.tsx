import React from 'react';
import { Grid, Tabs, Tab, Typography, createStyles } from 'ui-library';
import { FullPosition } from '@types';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage } from 'react-intl';
import PositionTimeline from './components/timeline';

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      margin: '0 5px',
      minWidth: 'auto',
      color: '#FFFFFF !important',
      fontWeight: '500 !important',
    },
  })
);

const StyledTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    indicator: {
      background: '#3076F6',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
);

interface PositionSwapsProps {
  position: FullPosition;
}

const PositionSwaps = ({ position }: PositionSwapsProps) => {
  const [tabIndex, setTabIndex] = React.useState<0 | 1 | 2 | 3>(0);
  return (
    <Grid container>
      <Grid
        item
        xs={12}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '15px' }}
      >
        <Typography variant="h6">
          <FormattedMessage description="timeline" defaultMessage="Timeline" />
        </Typography>
        <StyledTabs
          value={tabIndex}
          TabIndicatorProps={{ style: { bottom: '8px' } }}
          onChange={(e, index: 0 | 1 | 2 | 3) => setTabIndex(index)}
        >
          <StyledTab
            disableRipple
            label={
              <Typography variant="body2">
                <FormattedMessage description="all" defaultMessage="All" />
              </Typography>
            }
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="body2">
                <FormattedMessage description="swaps" defaultMessage="Swaps" />
              </Typography>
            }
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="body2">
                <FormattedMessage description="modifications" defaultMessage="Modifications" />
              </Typography>
            }
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="body2">
                <FormattedMessage description="withdraws" defaultMessage="Withdraws" />
              </Typography>
            }
          />
        </StyledTabs>
      </Grid>
      <Grid item xs={12}>
        <PositionTimeline position={position} filter={tabIndex} />
      </Grid>
    </Grid>
  );
};
export default PositionSwaps;
