import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PositionSwaps from 'position-detail/swaps';
import { FullPosition, GetPairSwapsData, YieldOptions } from 'types';
import Details from 'position-detail/position-data';
import Sticky from 'react-stickynode';
import GraphContainer from 'position-detail/graph-container';
import { BigNumber } from 'ethers';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
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
  swapsData: GetPairSwapsData | undefined;
  onWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: () => void;
  disabled: boolean;
  yieldOptions: YieldOptions;
  toWithdrawUnderlying?: BigNumber | null;
  remainingLiquidityUnderlying?: BigNumber | null;
}

const PositionSummaryContainer = ({
  position,
  pendingTransaction,
  swapsData,
  onWithdraw,
  onReusePosition,
  disabled,
  yieldOptions,
  toWithdrawUnderlying,
  remainingLiquidityUnderlying,
}: PositionSummaryContainerProps) => (
  <>
    <Grid container spacing={4} alignItems="flex-start">
      <StyledFlexGridItem item xs={12} md={5}>
        <Sticky enabled top={95}>
          <StyledPaper variant="outlined">
            <Details
              position={position}
              pair={swapsData}
              pendingTransaction={pendingTransaction}
              onWithdraw={onWithdraw}
              onReusePosition={onReusePosition}
              disabled={disabled}
              yieldOptions={yieldOptions}
              toWithdrawUnderlying={toWithdrawUnderlying}
              remainingLiquidityUnderlying={remainingLiquidityUnderlying}
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

export default PositionSummaryContainer;
