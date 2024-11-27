import type { Components } from '@mui/material/styles';
import { colors } from '../colors';

export const buildPopoverVariant = (mode: 'light' | 'dark'): Components => ({
  MuiPopover: {
    defaultProps: {
      slotProps: {
        paper: {
          style: {
            boxShadow: colors[mode].dropShadow.dropShadow300,
          },
        },
      },
    },
  },
});
