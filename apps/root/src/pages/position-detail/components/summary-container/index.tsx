import React from 'react';
import styled from 'styled-components';
import { Grid, Paper } from 'ui-library';
import { FullPosition, YieldOptions } from '@types';
import Sticky from 'react-stickynode';

import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import GraphContainer from '../graph-container';
import PositionSwaps from './components/swaps';
import Details from './components/position-data';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;

  .sticky-outer-wrapper {
    flex: 1;
  }
`;

interface PositionSummaryContainerProps {
  position: FullPosition;
  pendingTransaction: string | null;
  onMigrateYield: () => void;
  onSuggestMigrateYield: () => void;
  onReusePosition: () => void;
  yieldOptions: YieldOptions;
  toWithdrawUnderlying?: bigint | null;
  remainingLiquidityUnderlying?: bigint | null;
  swappedUnderlying?: bigint | null;
  totalGasSaved?: bigint;
}

const PositionSummaryContainer = ({
  position,
  pendingTransaction,
  onReusePosition,
  yieldOptions,
  toWithdrawUnderlying,
  remainingLiquidityUnderlying,
  swappedUnderlying,
  onMigrateYield,
  onSuggestMigrateYield,
  totalGasSaved,
}: PositionSummaryContainerProps) => {
  const currentBreakpoint = useCurrentBreakpoint();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  return (
    <>
      <Grid container spacing={4} alignItems="flex-start">
        <StyledFlexGridItem item xs={12} md={5}>
          <Sticky enabled={!isDownMd} top={95}>
            <StyledPaper variant="outlined">
              <Details
                position={position}
                pendingTransaction={pendingTransaction}
                onReusePosition={onReusePosition}
                yieldOptions={yieldOptions}
                toWithdrawUnderlying={toWithdrawUnderlying}
                remainingLiquidityUnderlying={remainingLiquidityUnderlying}
                swappedUnderlying={swappedUnderlying}
                onMigrateYield={onMigrateYield}
                onSuggestMigrateYield={onSuggestMigrateYield}
                totalGasSaved={totalGasSaved}
              />
            </StyledPaper>
          </Sticky>
        </StyledFlexGridItem>
        <Grid item xs={12} md={7}>
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <StyledPaper variant="outlined">
                <GraphContainer position={position} />
              </StyledPaper>
            </Grid>
            <Grid item xs={12}>
              <StyledPaper variant="outlined">
                <PositionSwaps position={position} />
              </StyledPaper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PositionSummaryContainer;
