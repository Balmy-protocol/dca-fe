import { createStyles, Theme } from '@material-ui/core/styles';
import makeStyles from '@material-ui/styles/makeStyles';

export const tabsStyles =
  (isMinimal: boolean = false) =>
  ({ palette, breakpoints }: Theme) =>
    createStyles({
      root: {
        backgroundColor: palette.type === 'light' ? '#eee' : palette.divider,
        borderRadius: isMinimal ? 50 : 20,
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
          padding: isMinimal ? '0px' : '0 8px',
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

export const tabItemStyles =
  (isMinimal: boolean = false) =>
  ({ palette, breakpoints }: Theme) =>
    createStyles({
      root: {
        '&:hover': {
          opacity: 1,
        },
        minHeight: 44,
        minWidth: isMinimal ? 50 : 96,
        [breakpoints.up('md')]: {
          minWidth: isMinimal ? 50 : 120,
        },
        padding: isMinimal ? '2px 8px' : '6px 12px',
      },
      wrapper: {
        // zIndex: 2,
        // marginTop: spacing(0.5),
        color: palette.text.primary,
        textTransform: 'initial',
      },
    });

export const appleTabsStylesHook = {
  useTabs: makeStyles(createStyles(tabsStyles(false))),
  useTabItem: makeStyles(createStyles(tabItemStyles(false))),
};

export const minimalAppleTabsStylesHook = {
  useTabs: makeStyles(createStyles(tabsStyles(true))),
  useTabItem: makeStyles(createStyles(tabItemStyles(true))),
};
