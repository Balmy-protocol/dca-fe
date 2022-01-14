import React from 'react';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { Web3Service, Position } from 'types';
import WithdrawModal from 'common/withdraw-modal';
import TerminateModal from 'common/terminate-modal';
import useCurrentPositions from 'hooks/useCurrentPositions';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import EmptyPositions from 'common/empty-positions';
import ActivePosition from './components/position';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

interface CurrentPositionsProps {
  web3Service: Web3Service;
}

const POSITIONS_PER_ROW = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
};
const CurrentPositions = ({ web3Service }: CurrentPositionsProps) => {
  const currentPositions = useCurrentPositions();
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);
  const currentBreakPoint = useCurrentBreakpoint();

  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    currentPositions.length % positionsPerRow !== 0 ? positionsPerRow - (currentPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];

  for (let i = 0; i < positionsToFill; i += 1) {
    emptyPositions.push(i);
  }

  const onWithdraw = (position: Position) => {
    setSelectedPosition(position);
    setShowWithdrawModal(true);
  };

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      {selectedPosition && (
        <>
          <WithdrawModal
            open={showWithdrawModal}
            position={selectedPosition}
            onCancel={() => setShowWithdrawModal(false)}
            useProtocolToken={false}
          />
          <TerminateModal
            open={showTerminateModal}
            position={selectedPosition}
            onCancel={() => setShowTerminateModal(false)}
          />
        </>
      )}
      {/* dont know why I need the 100% width :shrug: */}
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container alignItems="stretch">
          {currentPositions
            ? currentPositions.map((position) => (
                <StyledGridItem item xs={12} key={position.id}>
                  <ActivePosition position={position} web3Service={web3Service} onWithdraw={onWithdraw} />
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
