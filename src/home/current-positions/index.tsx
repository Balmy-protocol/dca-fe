import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ActivePosition from './components/position';
import usePromise from 'hooks/usePromise';
import { Web3Service, TokenList, Positions, PositionsRaw, Position } from 'types';
import WithdrawModal from 'common/withdraw-modal';
import TerminateModal from 'common/terminate-modal';
import useCurrentPositions from 'hooks/useCurrentPositions';
import ModifyRateModal from 'common/modify-rate-modal';
import RemoveFundsModal from 'common/remove-funds-modal';

interface CurrentPositionsProps {
  web3Service: Web3Service;
  tokenList: TokenList;
}

const CurrentPositions = ({ web3Service, tokenList }: CurrentPositionsProps) => {
  const currentPositions = useCurrentPositions();
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showModifyRateModal, setShowModifyRateModal] = React.useState(false);
  const [showRemoveFundsModal, setShowRemoveFunds] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);

  const onWithdraw = (position: Position) => {
    setSelectedPosition(position);
    setShowWithdrawModal(true);
  };
  const onTerminate = (position: Position) => {
    setSelectedPosition(position);
    setShowTerminateModal(true);
  };
  const onModifyRate = (position: Position) => {
    setSelectedPosition(position);
    setShowModifyRateModal(true);
  };
  const onRemoveFunds = (position: Position) => {
    setSelectedPosition(position);
    setShowRemoveFunds(true);
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
          <ModifyRateModal
            open={showModifyRateModal}
            position={selectedPosition}
            onCancel={() => setShowModifyRateModal(false)}
          />
          <RemoveFundsModal
            open={showRemoveFundsModal}
            position={selectedPosition}
            onCancel={() => setShowRemoveFunds(false)}
          />
        </>
      )}
      <Grid item xs={12}>
        <Typography variant="h3">
          <FormattedMessage description="Current positions" defaultMessage="Your current positions" />
        </Typography>
      </Grid>
      {/* dont know why I need the 100% width :shrug: */}
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {currentPositions
            ? (currentPositions as PositionsRaw).map(
                ({
                  from,
                  to,
                  swapInterval,
                  swapped,
                  remainingLiquidity,
                  remainingSwaps,
                  id,
                  status,
                  withdrawn,
                  startedAt,
                }) => (
                  <Grid item xs={12} sm={6} md={3} key={id}>
                    <ActivePosition
                      from={tokenList[from]}
                      to={tokenList[to]}
                      swapInterval={swapInterval}
                      swapped={swapped}
                      withdrawn={withdrawn}
                      remainingLiquidity={remainingLiquidity}
                      remainingSwaps={remainingSwaps}
                      id={id}
                      status={status}
                      web3Service={web3Service}
                      onWithdraw={onWithdraw}
                      onTerminate={onTerminate}
                      onModifyRate={onModifyRate}
                      onRemoveFunds={onRemoveFunds}
                      startedAt={startedAt}
                    />
                  </Grid>
                )
              )
            : null}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CurrentPositions;
