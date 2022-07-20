import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import keyBy from 'lodash/keyBy';
import Typography from '@mui/material/Typography';
import { useQuery } from '@apollo/client';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import getPosition from 'graphql/getPosition.graphql';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { useHistory, useParams } from 'react-router-dom';
import { FullPosition, GetPairSwapsData, NFTData } from 'types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import getPairSwaps from 'graphql/getPairSwaps.graphql';
import { usePositionHasPendingTransaction, useTransactionAdder } from 'state/transactions/hooks';
import Button from 'common/button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PositionNotFound from 'position-detail/position-not-found';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useAppDispatch } from 'state/hooks';
import { changeMainTab, changePositionDetailsTab } from 'state/tabs/actions';
import { usePositionDetailsTab } from 'state/tabs/hooks';
import PositionPermissionsContainer from 'position-detail/permissions-container';
import { setPermissions } from 'state/position-permissions/actions';
import { FormattedMessage } from 'react-intl';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import NFTModal from 'common/view-nft-modal';
import TransferPositionModal from 'common/transfer-position-modal';
import TerminateModal from 'common/terminate-modal';
import ModifySettingsModal from 'common/modify-settings-modal';
import { fullPositionToMappedPosition } from 'utils/parsing';
import { PERMISSIONS, RATE_TYPE, TRANSACTION_TYPES, PositionVersions } from 'config/constants';
import useTransactionModal from 'hooks/useTransactionModal';
import { initializeModifyRateSettings } from 'state/modify-rate-settings/actions';
import { formatUnits } from '@ethersproject/units';
import usePositionService from 'hooks/usePositionService';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useGqlFetchAll from 'hooks/useGqlFetchAll';
import PositionControls from '../position-summary-controls';
import PositionSummaryContainer from '../summary-container';

const StyledTab = withStyles(() =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      color: 'rgba(255,255,255,0.5)',
    },
    selected: {
      color: '#FFFFFF !important',
      fontWeight: '500',
    },
  })
)(Tab);

const StyledTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    indicator: {
      background: '#3076F6',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
)(Tabs);

const StyledPositionDetailsContainer = styled(Grid)`
  align-self: flex-start;
`;

// const WAIT_FOR_SUBGRAPH = 5000;

const PositionDetailFrame = () => {
  const { positionId, chainId, positionVersion } = useParams<{
    positionId: string;
    chainId: string;
    positionVersion: PositionVersions;
  }>();
  const client = useDCAGraphql(Number(chainId), positionVersion);
  const history = useHistory();
  const tabIndex = usePositionDetailsTab();
  const dispatch = useAppDispatch();
  const positionService = usePositionService();
  const currentNetwork = useCurrentNetwork();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();

  const shouldShowChangeNetwork = Number(chainId) !== currentNetwork.chainId || !isOnCorrectNetwork;

  const {
    loading: isLoading,
    data,
    // refetch,
  } = useGqlFetchAll<{ position: FullPosition }>(
    client,
    getPosition,
    {
      id: positionId,
    },
    'position.history',
    positionId === '' || positionId === null
  );

  let position: FullPosition | undefined = data && {
    ...data.position,
    chainId: Number(chainId),
    version: positionVersion,
  };

  const pendingTransaction = usePositionHasPendingTransaction((position && position.id) || '');

  const isPending = pendingTransaction !== null;

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
    },
    skip: !position,
    client,
  });

  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const addTransaction = useTransactionAdder();
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);

  React.useEffect(() => {
    dispatch(changeMainTab(1));
  }, []);

  React.useEffect(() => {
    if (position && !isPending) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      // setTimeout(refetch, WAIT_FOR_SUBGRAPH);
    }
  }, [position, isPending]);

  React.useEffect(() => {
    if (position && !isLoading) {
      dispatch(
        setPermissions({
          id: position.id,
          permissions: keyBy(
            position.current.permissions.map((permission) => ({
              ...permission,
              operator: permission.operator.toLowerCase(),
            })),
            'operator'
          ),
        })
      );
    }
  }, [position, isLoading]);

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

  const handleViewNFT = async () => {
    if (!position) return;
    const tokenNFT = await positionService.getTokenNFT(fullPositionToMappedPosition(position));
    setNFTData(tokenNFT);
    setShowNFTModal(true);
  };

  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  position = {
    ...position,
    from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
    to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
  };

  const onBackToPositions = () => {
    dispatch(changeMainTab(1));
    history.push('/positions');
  };

  const onWithdraw = async (useProtocolToken = false) => {
    if (!position) {
      return;
    }
    try {
      const hasPermission = await positionService.companionHasPermission(
        fullPositionToMappedPosition(position),
        PERMISSIONS.WITHDRAW
      );

      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const toSymbol =
        position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : position.to.symbol;
      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="Withdrawing from"
                defaultMessage="Withdrawing {toSymbol}"
                values={{ toSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && (
              <Typography variant="body1">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as ETH."
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await positionService.withdraw(fullPositionToMappedPosition(position), useProtocolToken);
      addTransaction(result, {
        type: TRANSACTION_TYPES.WITHDRAW_POSITION,
        typeData: { id: position.id },
        position: fullPositionToMappedPosition(position),
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of {toSymbol} from your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              toSymbol,
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error while withdrawing', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const onShowModifyRateSettings = () => {
    if (!position) {
      return;
    }

    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(position.current.remainingLiquidity, position.from.decimals),
        rate: formatUnits(position.current.rate, position.from.decimals),
        frequencyValue: position.current.remainingSwaps.toString(),
        modeType: RATE_TYPE,
      })
    );
    setShowModifyRateSettingsModal(true);
  };

  return (
    <>
      <TerminateModal
        open={showTerminateModal}
        position={fullPositionToMappedPosition(position)}
        onCancel={() => setShowTerminateModal(false)}
      />
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={fullPositionToMappedPosition(position)}
        onCancel={() => setShowModifyRateSettingsModal(false)}
      />
      <TransferPositionModal
        open={showTransferModal}
        position={position}
        onCancel={() => setShowTransferModal(false)}
      />
      <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
      <StyledPositionDetailsContainer container>
        <Grid item xs={12} style={{ paddingBottom: '45px', paddingTop: '15px' }}>
          <Button variant="text" color="default" onClick={onBackToPositions}>
            <Typography variant="h5" component="div" style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowBackIcon fontSize="inherit" />{' '}
              <FormattedMessage description="backToPositions" defaultMessage="Back to positions" />
            </Typography>
          </Button>
        </Grid>
        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
          <StyledTabs
            value={tabIndex}
            onChange={(e, index) => dispatch(changePositionDetailsTab(index))}
            TabIndicatorProps={{ style: { bottom: '8px' } }}
          >
            <StyledTab
              disableRipple
              label={
                <Typography variant="h6">
                  <FormattedMessage description="viewSummary" defaultMessage="View summary" />
                </Typography>
              }
            />
            <StyledTab
              disableRipple
              sx={{ marginLeft: '32px' }}
              label={
                <Typography variant="h6">
                  <FormattedMessage description="viewPermissions" defaultMessage="View permissions" />
                </Typography>
              }
            />
          </StyledTabs>
          {position.status !== 'TERMINATED' && (
            <PositionControls
              onTerminate={() => setShowTerminateModal(true)}
              onModifyRate={onShowModifyRateSettings}
              onTransfer={() => setShowTransferModal(true)}
              onViewNFT={handleViewNFT}
              position={position}
              pendingTransaction={pendingTransaction}
              disabled={shouldShowChangeNetwork}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {tabIndex === 0 && (
            <PositionSummaryContainer
              position={position}
              pendingTransaction={pendingTransaction}
              swapsData={swapsData?.pair}
              onWithdraw={onWithdraw}
              onReusePosition={onShowModifyRateSettings}
              disabled={shouldShowChangeNetwork}
            />
          )}
          {tabIndex === 1 && (
            <PositionPermissionsContainer
              position={position}
              pendingTransaction={pendingTransaction}
              disabled={shouldShowChangeNetwork}
            />
          )}
        </Grid>
      </StyledPositionDetailsContainer>
    </>
  );
};
export default PositionDetailFrame;
