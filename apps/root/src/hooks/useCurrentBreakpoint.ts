import { useTheme, useMediaQuery } from '@mui/material';

function useCurrentBreakpoint() {
  const theme = useTheme();
  const isXsBreakpoint = useMediaQuery(theme.breakpoints.only('xs'));
  const isSmBreakpoint = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdBreakpoint = useMediaQuery(theme.breakpoints.only('md'));
  const isLgBreakpoint = useMediaQuery(theme.breakpoints.only('lg'));

  if (isXsBreakpoint) {
    return 'xs';
  }
  if (isSmBreakpoint) {
    return 'sm';
  }
  if (isMdBreakpoint) {
    return 'md';
  }
  if (isLgBreakpoint) {
    return 'lg';
  }

  return 'xl';
}

export default useCurrentBreakpoint;
