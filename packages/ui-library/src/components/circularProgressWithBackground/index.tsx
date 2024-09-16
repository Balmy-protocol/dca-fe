import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress, { circularProgressClasses, CircularProgressProps } from '@mui/material/CircularProgress';
import { colors } from '../../theme';
import omit from 'lodash/omit';

// Inspired by the former Facebook spinners.
function CircularProgressWithBrackground(props: CircularProgressProps) {
  return (
    // eslint-disable-next-line react/destructuring-assignment
    <Box sx={{ position: 'relative', ...(props.sx || {}) }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: ({ palette: { mode } }) => colors[mode].accent.accent200,
        }}
        {...omit(props, 'sx')}
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
        {...omit(props, 'sx')}
      />
    </Box>
  );
}

export { CircularProgressWithBrackground };
