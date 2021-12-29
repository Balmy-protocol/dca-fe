import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { useQuery } from '@apollo/client';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import getPosition from 'graphql/getPosition.graphql';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { useHistory, useParams } from 'react-router-dom';
import PositionSwaps from 'position-detail/swaps';
import { FullPosition, GetPairSwapsData, NFTData } from 'types';
import getPairSwaps from 'graphql/getPairSwaps.graphql';
import SwapsGraph from 'position-detail/swap-graph';
import Details from 'position-detail/position-data';
import PositionControls from 'position-detail/position-controls';
import WithdrawModal from 'common/withdraw-modal';
import { fullPositionToMappedPosition, getFrequencyLabel } from 'utils/parsing';
import TerminateModal from 'common/terminate-modal';
import useBalance from 'hooks/useBalance';
import Collapse from '@material-ui/core/Collapse';
import ModifyRateSettings from 'common/modify-rate-settings';
import useWeb3Service from 'hooks/useWeb3Service';
import useTransactionModal from 'hooks/useTransactionModal';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import { usePositionHasPendingTransaction, useTransactionAdder } from 'state/transactions/hooks';
import PositionStatus from 'position-detail/position-status';
import NFTModal from 'common/view-nft-modal';
import { BigNumber } from 'ethers';
import Button from 'common/button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PositionNotFound from 'position-detail/position-not-found';

const StyledControlsWrapper = styled(Grid)`
  display: flex;
  justify-content: space-between;
`;

const StyledPaper = styled(Paper)`
  border-radius: 20px;
  padding: 20px;
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;
`;

const CollapsableGrid = styled(Grid)<{ in: boolean }>`
  ${(props) => (!props.in ? 'padding: 0px !important;' : '')}
`;

const WAIT_FOR_SUBGRAPH = 5000;

const PositionDetailFrame = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const client = useDCAGraphql();
  const web3Service = useWeb3Service();
  const history = useHistory();
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const addTransaction = useTransactionAdder();
  const [actionToShow, setActionToShow] = React.useState<null | 'modifyRate' | 'removeFunds'>(null);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const {
    loading: isLoading,
    data,
    refetch,
  } = useQuery<{ position: FullPosition }>(getPosition, {
    client,
    variables: {
      id: positionId,
    },
    skip: positionId === '' || positionId === null,
  });

  const position = data && data.position;

  const pendingTransaction = usePositionHasPendingTransaction((position && position.id) || '');

  const isPending = pendingTransaction !== null;

  const [balance] = useBalance(position && position.from);

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
    },
    skip: !position,
    client,
  });

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error changing rate and swaps', error: { code: e.code, message: e.message } });
    }
  };

  React.useEffect(() => {
    if (position && !isPending) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      setTimeout(refetch, WAIT_FOR_SUBGRAPH);
    }
  }, [position, isPending]);

  const positionNotFound = !position && data && !isLoading;

  if (isLoading || !data || (!position && !positionNotFound) || isLoadingSwaps) {
    return (
      <Grid container>
        <CenteredLoadingIndicator size={70} />
      </Grid>
    );
  }

  if (positionNotFound || !position) {
    return <PositionNotFound />;
  }

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
      <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
      <Grid container spacing={4}>
        <Grid item xs={12} style={{ paddingBottom: '0px', paddingTop: '0px' }}>
          <Button variant="text" color="default" onClick={() => history.push('/')}>
            <Typography variant="body2" component="div" style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowBackIcon fontSize="inherit" /> Back to positions
            </Typography>
          </Button>
        </Grid>
        <StyledControlsWrapper item xs={12}>
          <PositionStatus position={position} pair={swapsData?.pair} />
          {position.status !== 'TERMINATED' && (
            <PositionControls
              onWithdraw={() => setShowWithdrawModal(true)}
              onTerminate={() => setShowTerminateModal(true)}
              onModifyRate={() => setActionToShow('modifyRate')}
              onViewNFT={handleViewNFT}
              position={position}
              pendingTransaction={pendingTransaction}
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
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="stretch">
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
        </Grid>
      </Grid>
    </>
  );
};
export default PositionDetailFrame;
