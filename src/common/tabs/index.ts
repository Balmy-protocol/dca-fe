import { createStyles, Theme } from '@material-ui/core/styles';
import makeStyles from '@material-ui/styles/makeStyles';

export const tabsStyles = ({ palette, breakpoints }: Theme) =>
  createStyles({
    root: {
      backgroundColor: palette.type === 'light' ? '#eee' : palette.divider,
      borderRadius: 20,
      minHeight: 44,
      padding: 5,
    },
    flexContainer: {
      display: 'inline-flex',
      position: 'relative',
      zIndex: 1,
    },
    scroller: {
      [breakpoints.up('md')]: {
        padding: '0 8px',
      },
    },
    indicator: {
      top: 3,
      bottom: 3,
      right: 3,
      height: 'auto',
      background: 'none',
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 4,
        right: 4,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: palette.type === 'light' ? '#fff' : palette.action.selected,
        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.16)',
      },
    },
  });

export const tabItemStyles = ({ palette, breakpoints }: Theme) =>
  createStyles({
    root: {
      '&:hover': {
        opacity: 1,
      },
      minHeight: 44,
      minWidth: 96,
      [breakpoints.up('md')]: {
        minWidth: 120,
      },
    },
    wrapper: {
      // zIndex: 2,
      // marginTop: spacing(0.5),
      color: palette.text.primary,
      textTransform: 'initial',
    },
  });

export const appleTabsStylesHook = {
  useTabs: makeStyles(createStyles(tabsStyles)),
  useTabItem: makeStyles(createStyles(tabItemStyles)),
};
