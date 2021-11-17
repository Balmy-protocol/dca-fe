import React from 'react';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { Web3Service, Position, NFTData } from 'types';
import WithdrawModal from 'common/withdraw-modal';
import NFTModal from 'common/view-nft-modal';
import EmptyPosition from 'common/empty-position';
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
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
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

  const handleViewNFT = async (position: Position) => {
    const tokenNFT = await web3Service.getTokenNFT(position.dcaId, position.pairId);
    setNFTData(tokenNFT);
    setShowNFTModal(true);
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
      <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
      {/* dont know why I need the 100% width :shrug: */}
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="stretch">
          {currentPositions
            ? currentPositions.map((position) => (
                <StyledGridItem item xs={12} sm={6} md={3} key={position.id}>
                  <ActivePosition
                    position={position}
                    web3Service={web3Service}
                    onWithdraw={onWithdraw}
                    onTerminate={onTerminate}
                    onViewNFT={handleViewNFT}
                  />
                </StyledGridItem>
              ))
            : null}
          {currentPositions &&
            !!currentPositions.length &&
            emptyPositions.map((id) => (
              <StyledGridItem item xs={12} sm={6} md={3} key={id}>
                <EmptyPosition />
              </StyledGridItem>
            ))}
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
