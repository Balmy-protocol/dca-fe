import React from 'react';
import Grid from '@material-ui/core/Grid';
import keyBy from 'lodash/keyBy';
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
import { usePositionHasPendingTransaction } from 'state/transactions/hooks';
import Button from 'common/button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PositionNotFound from 'position-detail/position-not-found';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useAppDispatch } from 'state/hooks';
import { appleTabsStylesHook } from 'common/tabs';
import { changePositionDetailsTab } from 'state/tabs/actions';
import { usePositionDetailsTab } from 'state/tabs/hooks';
import PositionPermissionsContainer from 'position-detail/permissions-container';
import { setPermissions } from 'state/position-permissions/actions';
import PositionSummaryContainer from '../summary-container';

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

  const pendingTransaction = usePositionHasPendingTransaction((position && position.id) || '');

  const isPending = pendingTransaction !== null;

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
    },
    skip: !position,
    client,
  });

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
