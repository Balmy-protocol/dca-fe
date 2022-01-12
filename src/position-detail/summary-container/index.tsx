import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PositionControls from 'position-detail/position-summary-controls';
import { fullPositionToMappedPosition, getFrequencyLabel } from 'utils/parsing';
import Collapse from '@material-ui/core/Collapse';
import ModifyRateSettings from 'common/modify-rate-settings';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import PositionSwaps from 'position-detail/swaps';
import { FullPosition, GetPairSwapsData, NFTData } from 'types';
import SwapsGraph from 'position-detail/swap-graph';
import Details from 'position-detail/position-data';
import PositionStatus from 'position-detail/position-status';
import { BigNumber } from 'ethers';
import useWeb3Service from 'hooks/useWeb3Service';
import useBalance from 'hooks/useBalance';
import NFTModal from 'common/view-nft-modal';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import WithdrawModal from 'common/withdraw-modal';
import TerminateModal from 'common/terminate-modal';
import TransferPositionModal from 'common/transfer-position-modal';
import MigratePositionModal from 'common/migrate-position-modal';

const StyledControlsWrapper = styled(Grid)`
  display: flex;
  justify-content: space-between;
`;

const StyledPaper = styled(Paper)`
  border-radius: 20px;
  padding: 20px;
`;

const CollapsableGrid = styled(Grid)<{ in: boolean }>`
  ${(props) => (!props.in ? 'padding: 0px !important;' : '')}
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;
`;

interface PositionSummaryContainerProps {
  position: FullPosition;
  pendingTransaction: string | null;
  usesCompanion: boolean;
  isCompanionApproved: boolean;
  positionTransfered: string | null;
  swapsData: GetPairSwapsData | undefined;
}

const PositionSummaryContainer = ({
  position,
  pendingTransaction,
  usesCompanion,
  isCompanionApproved,
  positionTransfered,
  swapsData,
}: PositionSummaryContainerProps) => {
  const [balance] = useBalance(position && position.from);
  const [actionToShow, setActionToShow] = React.useState<null | 'modifyRate' | 'removeFunds'>(null);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showMigrateModal, setShowMigrateModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const web3Service = useWeb3Service();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();

  const handleViewNFT = async () => {
    if (!position) return;
    const tokenNFT = await web3Service.getTokenNFT(position.id);
    setNFTData(tokenNFT);
    setShowNFTModal(true);
  };

  const handleModifyRateAndSwaps = async (newRate: string, newFrequency: string) => {
    if (!position) {
      return;
    }

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Modifying rate for position"
              defaultMessage="Changing your {from}/{to} position rate to swap {newRate} {from} {frequencyType} for {frequency} {frequencyTypePlural}"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
                newRate,
                frequency: newFrequency,
                frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.interval.toString()].adverb,
                frequencyTypePlural: getFrequencyLabel(position.swapInterval.interval.toString(), newFrequency),
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.modifyRateAndSwaps(
        fullPositionToMappedPosition(position),
        newRate,
        newFrequency
      );
      setActionToShow(null);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION,
        typeData: { id: position.id, newRate, newSwaps: newFrequency, decimals: position.from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success modify rate for position"
            defaultMessage="Changing your {from}/{to} position rate to swap {newRate} {from} {frequencyType} for {frequency} {frequencyTypePlural} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              newRate,
              frequency: newFrequency,
              frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.interval.toString()].adverb,
              frequencyTypePlural: getFrequencyLabel(position.swapInterval.interval.toString(), newFrequency),
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error changing rate and swaps',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  return (
    <>
      <WithdrawModal
        open={showWithdrawModal}
        position={fullPositionToMappedPosition(position)}
        onCancel={() => setShowWithdrawModal(false)}
      />
      <TerminateModal
        open={showTerminateModal}
        position={fullPositionToMappedPosition(position)}
        onCancel={() => setShowTerminateModal(false)}
      />
      <TransferPositionModal
        open={showTransferModal}
        position={position}
        onCancel={() => setShowTransferModal(false)}
      />
      <MigratePositionModal
        open={showMigrateModal}
        position={fullPositionToMappedPosition(position)}
        onCancel={() => setShowMigrateModal(false)}
      />
      <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
      <Grid container spacing={2} alignItems="stretch">
        <StyledControlsWrapper item xs={12}>
          <PositionStatus position={position} pair={swapsData} alignedEnd />
          {position.status !== 'TERMINATED' && !positionTransfered && (
            <PositionControls
              onWithdraw={() => setShowWithdrawModal(true)}
              onTerminate={() => setShowTerminateModal(true)}
              onModifyRate={() => setActionToShow('modifyRate')}
              onTransfer={() => setShowTransferModal(true)}
              onMigratePosition={() => setShowMigrateModal(true)}
              onViewNFT={handleViewNFT}
              position={position}
              pendingTransaction={pendingTransaction}
              shouldDisable={usesCompanion && !isCompanionApproved}
            />
          )}
        </StyledControlsWrapper>
        <Collapse
          in={actionToShow === 'modifyRate'}
          component={(props) => (
            <CollapsableGrid in={actionToShow === 'modifyRate'} item xs={12} {...props}>
              {props.children}
            </CollapsableGrid>
          )}
        >
          <StyledPaper>
            <ModifyRateSettings
              onClose={() => setActionToShow(null)}
              position={fullPositionToMappedPosition(position)}
              onModifyRateAndSwaps={handleModifyRateAndSwaps}
              balance={balance || BigNumber.from(0)}
              showAddCaption
            />
          </StyledPaper>
        </Collapse>
        <StyledFlexGridItem item xs={12} md={4}>
          <Details position={position} />
        </StyledFlexGridItem>
        <StyledFlexGridItem item xs={12} md={8}>
          <SwapsGraph position={position} />
        </StyledFlexGridItem>
        <Grid item xs={12}>
          <Typography variant="h4">
            <FormattedMessage description="PositionTimeline" defaultMessage="Position Timeline" />
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <PositionSwaps position={position} />
        </Grid>
      </Grid>
    </>
  );
};

export default PositionSummaryContainer;
