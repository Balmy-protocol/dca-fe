import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import useCurrentPositions from 'hooks/useCurrentPositions';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import EmptyPositions from 'common/empty-positions';
import ActivePosition from './components/position';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

const POSITIONS_PER_ROW = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
};
const CurrentPositions = () => {
  const currentPositions = useCurrentPositions();
  const currentBreakPoint = useCurrentBreakpoint();

  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    currentPositions.length % positionsPerRow !== 0 ? positionsPerRow - (currentPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];

  for (let i = 0; i < positionsToFill; i += 1) {
    emptyPositions.push(i);
  }

  return (
    <Grid container direction="column" alignItems="flex-start" justifyContent="center" spacing={3}>
      {/* dont know why I need the 100% width :shrug: */}
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container alignItems="stretch">
          {currentPositions
            ? currentPositions.map((position) => (
                <StyledGridItem item xs={12} key={position.id}>
                  <ActivePosition position={position} />
                </StyledGridItem>
              ))
            : null}
          {currentPositions && !currentPositions.length && (
            <Grid item xs={12}>
              <EmptyPositions />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CurrentPositions;
