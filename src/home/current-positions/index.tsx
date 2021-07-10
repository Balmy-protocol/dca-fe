import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ActivePosition from './components/position';
import { Web3Service, TokenList, Positions, PositionsRaw, Position } from 'types';
import WithdrawModal from 'common/withdraw-modal';
import EmptyPosition from 'common/empty-position';
import TerminateModal from 'common/terminate-modal';
import useCurrentPositions from 'hooks/useCurrentPositions';
import useTokenList from 'hooks/useTokenList';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';

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
  const tokenList = useTokenList();
  const currentPositions = useCurrentPositions();
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);
  const currentBreakPoint = useCurrentBreakpoint();

  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    currentPositions.length % positionsPerRow !== 0 ? positionsPerRow - (currentPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];

  for (let i = 0; i < positionsToFill; i++) {
    emptyPositions.push(i);
  }

  const onWithdraw = (position: Position) => {
    setSelectedPosition(position);
    setShowWithdrawModal(true);
  };
  const onTerminate = (position: Position) => {
    setSelectedPosition(position);
    setShowTerminateModal(true);
  };
  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      {selectedPosition && (
        <>
          <WithdrawModal
            open={showWithdrawModal}
            position={selectedPosition}
            onCancel={() => setShowWithdrawModal(false)}
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
        <Grid container spacing={2} alignItems="flex-start">
          {currentPositions
            ? (currentPositions as PositionsRaw).map((position) => (
                <Grid item xs={12} sm={6} md={3} key={position.id}>
                  <ActivePosition
                    position={{ ...position, from: tokenList[position.from], to: tokenList[position.to] }}
                    web3Service={web3Service}
                    onWithdraw={onWithdraw}
                    onTerminate={onTerminate}
                  />
                </Grid>
              ))
            : null}
          {emptyPositions.map((id) => (
            <Grid item xs={12} sm={6} md={3} key={id}>
              <EmptyPosition />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CurrentPositions;
