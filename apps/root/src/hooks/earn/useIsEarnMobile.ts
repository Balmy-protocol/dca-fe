import { useTheme } from 'styled-components';
import { useMediaQuery } from 'ui-library';

export const useIsEarnMobile = () => {
  const theme = useTheme();

  return useMediaQuery(theme.breakpoints.down('md'));
};
