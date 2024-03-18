import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress, { circularProgressClasses, CircularProgressProps } from '@mui/material/CircularProgress';
import { colors } from '../../theme';

// Inspired by the former Facebook spinners.
function CircularProgressWithBrackground(props: CircularProgressProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: ({ palette: { mode } }) => colors[mode].accent.accent200,
        }}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="determinate"
        disableShrink
        sx={{
          color: ({ palette: { mode } }) => colors[mode].accent.accent400,
          animationDuration: '550ms',
          position: 'absolute',
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        {...props}
      />
    </Box>
  );
}

export { CircularProgressWithBrackground };
