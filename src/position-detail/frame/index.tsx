import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import keyBy from 'lodash/keyBy';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { useQuery } from '@apollo/client';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import getPosition from 'graphql/getPosition.graphql';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { useHistory, useParams } from 'react-router-dom';
import { FullPosition, GetPairSwapsData } from 'types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import getPairSwaps from 'graphql/getPairSwaps.graphql';
import useWeb3Service from 'hooks/useWeb3Service';
import useTransactionModal from 'hooks/useTransactionModal';
import { TRANSACTION_TYPES, COMPANION_ADDRESS } from 'config/constants';
import {
  usePositionHasPendingTransaction,
  usePositionHasTransfered,
  useTransactionAdder,
} from 'state/transactions/hooks';
import Button from 'common/button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PositionNotFound from 'position-detail/position-not-found';
import useIsCompanionApproved from 'hooks/useIsCompanionApproved';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { buildEtherscanAddress } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import CallMadeIcon from '@material-ui/icons/CallMade';
import Link from '@material-ui/core/Link';
import { useAppDispatch } from 'state/hooks';
import { appleTabsStylesHook } from 'common/tabs';
import { changePositionDetailsTab } from 'state/tabs/actions';
import { usePositionDetailsTab } from 'state/tabs/hooks';
import PositionPermissionsContainer from 'position-detail/permissions-container';
import { setPermissions } from 'state/position-permissions/actions';
import PositionSummaryContainer from '../summary-container';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.type === 'light' ? '#3f51b5' : '#8699ff'};
  `}
  margin: 0px 5px;
`;

const StyledCompanionApprovalContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const WAIT_FOR_SUBGRAPH = 5000;

const PositionDetailFrame = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const client = useDCAGraphql();
  const web3Service = useWeb3Service();
  const history = useHistory();
  const tabIndex = usePositionDetailsTab();
  const dispatch = useAppDispatch();
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  const currentNetwork = useCurrentNetwork();
  const addTransaction = useTransactionAdder();
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

  let position = data && data.position;

  const [isCompanionApproved, isCompanionApprovedLoading, isCompanionApprovedErrors] = useIsCompanionApproved(position);

  const pendingTransaction = usePositionHasPendingTransaction((position && position.id) || '');
  const positionTransfered = usePositionHasTransfered((position && position.id) || '');

  const isPending = pendingTransaction !== null;

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
    },
    skip: !position,
    client,
  });

  const handleGiveCompanionPermissions = async () => {
    if (!position) {
      return;
    }

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Giving permissions"
              defaultMessage="Giving our Hub Companion permissions to modify your position"
            />
          </Typography>
        ),
      });
      const result = await web3Service.approveCompanionForPosition(position);
      addTransaction(result, {
        type: TRANSACTION_TYPES.APPROVE_COMPANION,
        typeData: { id: position.id, from: position.from.symbol, to: position.to.symbol },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success giving companion position permissions"
            defaultMessage="Giving our Hub Companion permissions to modify your position has been succesfully submitted to the blockchain and will be confirmed soon"
          />
        ),
      });
    } catch (e) {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error giving Hub Companion permissions',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  React.useEffect(() => {
    if (position && !isPending) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises
      setTimeout(refetch, WAIT_FOR_SUBGRAPH);
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

  if (isLoading || isCompanionApprovedLoading || !data || (!position && !positionNotFound) || isLoadingSwaps) {
    return (
      <Grid container>
        <CenteredLoadingIndicator size={70} />
      </Grid>
    );
  }

  if (positionNotFound || !position) {
    return <PositionNotFound />;
  }

  const usesCompanion =
    position.from.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === PROTOCOL_TOKEN_ADDRESS;

  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  position = {
    ...position,
    from: position.from.address === wrappedProtocolToken.address ? protocolToken : position.from,
    to: position.to.address === wrappedProtocolToken.address ? protocolToken : position.to,
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12} style={{ paddingBottom: '0px', paddingTop: '0px' }}>
          <Button variant="text" color="default" onClick={() => history.push('/')}>
            <Typography variant="body2" component="div" style={{ display: 'flex', alignItems: 'center' }}>
              <ArrowBackIcon fontSize="inherit" /> Back to positions
            </Typography>
          </Button>
        </Grid>
        {usesCompanion && !isCompanionApproved && !isCompanionApprovedErrors && !positionTransfered && (
          <Grid item xs={12}>
            <Alert severity="warning" variant="outlined">
              <AlertTitle>Companion not approved</AlertTitle>
              <Typography variant="body1">
                <FormattedMessage description="Our" defaultMessage="Our" />
                <StyledLink
                  href={buildEtherscanAddress(COMPANION_ADDRESS[currentNetwork.chainId], currentNetwork.chainId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Hub Companion
                  <CallMadeIcon style={{ fontSize: '1rem' }} />
                </StyledLink>
                <FormattedMessage
                  description="isNotApproved"
                  defaultMessage="is not approved to operate with your position. Please approve the Hub Companion to make modifications on this position to enable the full features for this position"
                />
              </Typography>
              <StyledCompanionApprovalContainer>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={handleGiveCompanionPermissions}
                  disabled={isPending}
                >
                  <FormattedMessage description="approveHubCompanion" defaultMessage="Approve Hub Companion" />
                </Button>
              </StyledCompanionApprovalContainer>
            </Alert>
          </Grid>
        )}
        <Grid item xs={12} style={{ display: 'flex', paddingBottom: '15px' }}>
          <Tabs
            classes={tabsStyles}
            value={tabIndex}
            onChange={(e, index) => dispatch(changePositionDetailsTab(index))}
          >
            <Tab classes={tabItemStyles} disableRipple label="View summary" />
            <Tab classes={tabItemStyles} disableRipple label="View permissions" />
          </Tabs>
        </Grid>
        <Grid item xs={12}>
          {tabIndex === 0 && (
            <PositionSummaryContainer
              position={position}
              pendingTransaction={pendingTransaction}
              usesCompanion={usesCompanion}
              isCompanionApproved={!!isCompanionApproved && !isCompanionApprovedErrors}
              positionTransfered={positionTransfered}
              swapsData={swapsData?.pair}
            />
          )}
          {tabIndex === 1 && (
            <PositionPermissionsContainer position={position} pendingTransaction={pendingTransaction} />
          )}
        </Grid>
      </Grid>
    </>
  );
};
export default PositionDetailFrame;
