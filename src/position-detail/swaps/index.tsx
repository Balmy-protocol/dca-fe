import React from 'react';
import Grid from '@mui/material/Grid';
import { FullPosition } from 'types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { appleTabsStylesHook } from 'common/tabs';
import PositionTimeline from './components/timeline';

interface PositionSwapsProps {
  position: FullPosition;
}

const PositionSwaps = ({ position }: PositionSwapsProps) => {
  const [tabIndex, setTabIndex] = React.useState<0 | 1 | 2 | 3>(0);
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  return (
    <Grid container>
      <Grid item xs={12} style={{ display: 'flex', paddingBottom: '0px' }}>
        <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
          <Tab classes={tabItemStyles} disableRipple label="All" />
          <Tab classes={tabItemStyles} disableRipple label="Swaps" />
          <Tab classes={tabItemStyles} disableRipple label="Modifications" />
          <Tab classes={tabItemStyles} disableRipple label="Withdraws" />
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        <PositionTimeline position={position} filter={tabIndex} />
      </Grid>
    </Grid>
  );
};
export default PositionSwaps;
