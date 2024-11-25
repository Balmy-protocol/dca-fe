import type { TabsProps } from '@mui/material/Tabs';
import Tabs from '@mui/material/Tabs';
import { createStyles } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import { colors } from '../../theme';

const UnderlinedTabs = withStyles(Tabs, (theme) =>
  createStyles({
    root: {
      flex: 1,
    },
    flexContainer: {
      borderBottom: `1.5px solid ${colors[theme.palette.mode].border.border1}`,
    },
  })
);

export { Tabs, UnderlinedTabs, type TabsProps };
