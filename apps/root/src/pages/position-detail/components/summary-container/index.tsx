import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, Grid } from 'ui-library';
import { PositionWithHistory } from '@types';
import Sticky from 'react-stickynode';

import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import GraphContainer from '../graph-container';
import PositionSwaps from './components/swaps';
import Details from './components/position-data';
import PositionDataSkeleton from './components/position-data/position-data-skeleton';

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)}
  `}
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;

  .sticky-outer-wrapper {
    flex: 1;
  }
`;

interface PositionSummaryContainerProps {
  position?: PositionWithHistory;
  pendingTransaction: string | null;
  isLoading: boolean;
}

const PositionSummaryContainer = ({ position, pendingTransaction, isLoading }: PositionSummaryContainerProps) => {
  const currentBreakpoint = useCurrentBreakpoint();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  return (
    <Grid container spacing={6} alignItems="flex-start">
      <StyledFlexGridItem item xs={12} md={5}>
        <Sticky enabled={!isDownMd} top={95}>
          <StyledPaper>
            {isLoading ? (
              <PositionDataSkeleton />
            ) : (
              position && <Details position={position} pendingTransaction={pendingTransaction} />
            )}
          </StyledPaper>
        </Sticky>
      </StyledFlexGridItem>
      <Grid item xs={12} md={7}>
        <Grid container direction="column" spacing={6} flexWrap="nowrap">
          <Grid item xs={12}>
            <GraphContainer position={position} isLoading={isLoading} />
          </Grid>
          <Grid item xs={12}>
            <StyledPaper>
              <PositionSwaps position={position} isLoading={isLoading} />
            </StyledPaper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PositionSummaryContainer;
