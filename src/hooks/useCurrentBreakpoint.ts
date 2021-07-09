import { useTheme, useMediaQuery } from '@material-ui/core';

function useCurrentBreakpoint() {
  const theme = useTheme();
  let isBreakpoint = useMediaQuery(theme.breakpoints.only('xs'));
  if (isBreakpoint) {
    return 'xs';
  }
  isBreakpoint = useMediaQuery(theme.breakpoints.only('sm'));
  if (isBreakpoint) {
    return 'sm';
  }
  isBreakpoint = useMediaQuery(theme.breakpoints.only('md'));
  if (isBreakpoint) {
    return 'md';
  }
  isBreakpoint = useMediaQuery(theme.breakpoints.only('lg'));
  if (isBreakpoint) {
    return 'lg';
  }

  return 'xl';
}

export default useCurrentBreakpoint;
