import React from 'react';
import { Grid, Tabs, Tab, Typography, createStyles } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import { FormattedMessage } from 'react-intl';
import PositionTimeline from './components/timeline';
import { PositionWithHistory } from 'common-types';

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      margin: '0 5px',
      minWidth: 'auto',
      fontWeight: '500 !important',
    },
  })
);

const StyledTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
);

interface PositionSwapsProps {
  position?: PositionWithHistory;
  isLoading: boolean;
}

const PositionSwaps = ({ position, isLoading }: PositionSwapsProps) => {
  const [tabIndex, setTabIndex] = React.useState<0 | 1 | 2 | 3>(0);
  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5">
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
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="all" defaultMessage="All" />
              </Typography>
            }
            disabled={isLoading}
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="swaps" defaultMessage="Swaps" />
              </Typography>
            }
            disabled={isLoading}
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="modifications" defaultMessage="Modifications" />
              </Typography>
            }
            disabled={isLoading}
          />
          <StyledTab
            disableRipple
            label={
              <Typography variant="bodySmallRegular">
                <FormattedMessage description="withdraws" defaultMessage="Withdraws" />
              </Typography>
            }
            disabled={isLoading}
          />
        </StyledTabs>
      </Grid>
      <Grid item xs={12}>
        <PositionTimeline position={position} filter={tabIndex} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
};
export default PositionSwaps;
