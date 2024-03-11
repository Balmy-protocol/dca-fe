import React from 'react';
import { LinearProgress, LinearProgressProps } from '@mui/material';
import { baseColors, colors } from '../../theme';
import { withStyles } from 'tss-react/mui';

export const PositionProgressBar = withStyles(
  ({ variant = 'determinate', ...props }: LinearProgressProps) => <LinearProgress variant={variant} {...props} />,
  ({ palette: { mode } }, { value }) => ({
    bar: {
      background:
        value === 100
          ? colors[mode].semantic.success.darker
          : mode === 'light'
          ? `linear-gradient(270deg, ${colors.light.violet.violet500} 0%, ${colors.light.violet.violet400} ${value}%)`
          : baseColors.violet.violet500,
    },
  })
);
