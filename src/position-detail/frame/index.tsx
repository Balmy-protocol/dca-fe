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
import { fullPositionToMappedPosition, getDisplayToken } from 'utils/parsing';
import {
  PERMISSIONS,
  RATE_TYPE,
  TRANSACTION_TYPES,
  PositionVersions,
  DEFAULT_NETWORK_FOR_VERSION,
  LATEST_VERSION,
} from 'config/constants';
import useTransactionModal from 'hooks/useTransactionModal';
import { initializeModifyRateSettings } from 'state/modify-rate-settings/actions';
import { formatUnits } from '@ethersproject/units';
import usePositionService from 'hooks/usePositionService';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import { setPosition } from 'state/position-details/actions';
import { usePositionDetails } from 'state/position-details/hooks';
import MigrateYieldModal from 'common/migrate-yield-modal';
import useGqlFetchAll from 'hooks/useGqlFetchAll';
import useYieldOptions from 'hooks/useYieldOptions';
import SuggestMigrateYieldModal from 'common/suggest-migrate-yield-modal';
import useUnderlyingAmount from 'hooks/useUnderlyingAmount';
import Link from '@mui/material/Link';
import { BigNumber } from 'ethers';
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

  const wrappedProtocolToken = getWrappedProtocolToken(
    Number(chainId) || DEFAULT_NETWORK_FOR_VERSION[LATEST_VERSION].chainId
  );
  const protocolToken = getProtocolToken(Number(chainId));
  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(Number(chainId));

  const position: FullPosition | undefined = data &&
    data.position && {
      ...data.position,
      chainId: Number(chainId),
      version: positionVersion,
      from: getDisplayToken(data.position.from, Number(chainId)),
      to: getDisplayToken(data.position.to, Number(chainId)),
    };

  const pendingTransaction = usePositionHasPendingTransaction(
    (position && fullPositionToMappedPosition(position).id) || ''
  );

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
    },
    skip: !position,
    client,
  });

  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showMigrateYieldModal, setShowMigrateYieldModal] = React.useState(false);
  const [showSuggestMigrateYieldModal, setShowSuggestMigrateYieldModal] = React.useState(false);
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const addTransaction = useTransactionAdder();
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const positionInUse = usePositionDetails();
  const [[toWithdrawUnderlying, swappedUnderlying, remainingLiquidityUnderlying], isLoadingUnderlyings] =
    useUnderlyingAmount([
      {
        token: positionInUse?.to,
        amount: positionInUse ? BigNumber.from(positionInUse?.toWithdraw) : null,
        returnSame: !positionInUse?.to.underlyingTokens.length,
      },
      {
        token: positionInUse?.to,
        amount: positionInUse ? BigNumber.from(positionInUse?.totalSwapped) : null,
        returnSame: !positionInUse?.to.underlyingTokens.length,
      },
      {
        token: positionInUse?.from,
        amount: positionInUse ? BigNumber.from(positionInUse.remainingLiquidity) : null,
        returnSame: !positionInUse?.from.underlyingTokens.length,
      },
    ]);

  React.useEffect(() => {
    dispatch(changeMainTab(1));
  }, []);

  React.useEffect(() => {
    if (position && !isLoading && !positionInUse) {
      dispatch(setPosition(position));
      dispatch(
        setPermissions({
          id: position.id,
          permissions: keyBy(
            position.permissions.map((permission) => ({
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

  if (
    isLoading ||
    !data ||
    (!position && !positionNotFound) ||
    isLoadingSwaps ||
    isLoadingYieldOptions ||
    isLoadingUnderlyings
  ) {
    return (
      <Grid container>
        <CenteredLoadingIndicator size={70} />
      </Grid>
    );
  }

  if (positionNotFound || !position || !positionInUse) {
    return <PositionNotFound />;
  }

  const handleViewNFT = async () => {
    if (!positionInUse) return;
    const tokenNFT = await positionService.getTokenNFT(fullPositionToMappedPosition(positionInUse));
    setNFTData(tokenNFT);
    setShowNFTModal(true);
  };

  const onBackToPositions = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(changeMainTab(1));
    history.push('/positions');
  };

  const onWithdraw = async (useProtocolToken = false) => {
    if (!positionInUse) {
      return;
    }
    try {
      const hasYield = position.to.underlyingTokens.length;
      let hasPermission = true;
      if (useProtocolToken || hasYield) {
        hasPermission = await positionService.companionHasPermission(
          fullPositionToMappedPosition(position),
          PERMISSIONS.WITHDRAW
        );
      }
      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const toSymbol =
        positionInUse.to.address === PROTOCOL_TOKEN_ADDRESS || positionInUse.to.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : positionInUse.to.symbol;
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
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await positionService.withdraw(fullPositionToMappedPosition(positionInUse), useProtocolToken);
      addTransaction(result, {
        type: TRANSACTION_TYPES.WITHDRAW_POSITION,
        typeData: { id: fullPositionToMappedPosition(positionInUse).id },
        position: fullPositionToMappedPosition(positionInUse),
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of {toSymbol} from your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: positionInUse.from.symbol,
              to: positionInUse.to.symbol,
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

  const onWithdrawFunds = async (useProtocolToken = true) => {
    if (!positionInUse) {
      return;
    }
    try {
      const hasYield = position.from.underlyingTokens.length;
      let hasPermission = true;
      if (useProtocolToken || hasYield) {
        hasPermission = await positionService.companionHasPermission(
          fullPositionToMappedPosition(position),
          PERMISSIONS.REDUCE
        );
      }
      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const fromSymbol =
        positionInUse.from.address === PROTOCOL_TOKEN_ADDRESS ||
        positionInUse.from.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : positionInUse.from.symbol;

      const removedFunds = BigNumber.from(positionInUse.depositedRateUnderlying || positionInUse.rate).mul(
        BigNumber.from(positionInUse.remainingSwaps)
      );
      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="Withdrawing funds from"
                defaultMessage="Withdrawing {fromSymbol} funds"
                values={{ fromSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && (
              <Typography variant="body1">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.from.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await positionService.modifyRateAndSwaps(
        fullPositionToMappedPosition(positionInUse),
        '0',
        '0',
        !useProtocolToken
      );
      addTransaction(result, {
        type: TRANSACTION_TYPES.WITHDRAW_FUNDS,
        typeData: {
          id: fullPositionToMappedPosition(positionInUse).id,
          from: fromSymbol,
          removedFunds: removedFunds.toString(),
        },
        position: fullPositionToMappedPosition(positionInUse),
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of funds of {fromSymbol} from your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: positionInUse.from.symbol,
              to: positionInUse.to.symbol,
              fromSymbol,
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error while withdrawing funds',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const onShowModifyRateSettings = () => {
    if (!positionInUse) {
      return;
    }

    const rateToUse = BigNumber.from(positionInUse.depositedRateUnderlying || positionInUse.rate);
    const remainingLiquidityToUse = rateToUse.mul(BigNumber.from(positionInUse.remainingSwaps));

    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(remainingLiquidityToUse, positionInUse.from.decimals),
        rate: formatUnits(rateToUse, positionInUse.from.decimals),
        frequencyValue: positionInUse.remainingSwaps.toString(),
        modeType: RATE_TYPE,
      })
    );
    setShowModifyRateSettingsModal(true);
  };

  return (
    <>
      <TerminateModal
        open={showTerminateModal}
        position={fullPositionToMappedPosition(positionInUse)}
        onCancel={() => setShowTerminateModal(false)}
        remainingLiquidityUnderlying={remainingLiquidityUnderlying}
        toWithdrawUnderlying={toWithdrawUnderlying}
      />
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={fullPositionToMappedPosition(positionInUse)}
        onCancel={() => setShowModifyRateSettingsModal(false)}
      />
      <TransferPositionModal
        open={showTransferModal}
        position={positionInUse}
        onCancel={() => setShowTransferModal(false)}
      />
      <MigrateYieldModal
        open={showMigrateYieldModal}
        position={fullPositionToMappedPosition(positionInUse)}
        onCancel={() => setShowMigrateYieldModal(false)}
      />
      <SuggestMigrateYieldModal
        open={showSuggestMigrateYieldModal}
        position={fullPositionToMappedPosition(positionInUse)}
        onAddFunds={onShowModifyRateSettings}
        onCancel={() => setShowSuggestMigrateYieldModal(false)}
      />
      <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
      <StyledPositionDetailsContainer container>
        <Grid item xs={12} style={{ paddingBottom: '45px', paddingTop: '15px' }}>
          <Button variant="text" color="default">
            {/* <Button variant="text" color="default" onClick={onBackToPositions}> */}
            <Link href="/positions" underline="none" color="inherit" onClick={onBackToPositions}>
              <Typography variant="h5" component="div" style={{ display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon fontSize="inherit" />{' '}
                <FormattedMessage description="backToPositions" defaultMessage="Back to positions" />
              </Typography>
            </Link>
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
          {positionInUse.status !== 'TERMINATED' && (
            <PositionControls
              onTerminate={() => setShowTerminateModal(true)}
              onModifyRate={onShowModifyRateSettings}
              onTransfer={() => setShowTransferModal(true)}
              onViewNFT={handleViewNFT}
              position={positionInUse}
              pendingTransaction={pendingTransaction}
              disabled={shouldShowChangeNetwork}
              onWithdrawFunds={onWithdrawFunds}
              onWithdraw={onWithdraw}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {tabIndex === 0 && (
            <PositionSummaryContainer
              position={positionInUse}
              pendingTransaction={pendingTransaction}
              swapsData={swapsData?.pair}
              toWithdrawUnderlying={toWithdrawUnderlying}
              swappedUnderlying={swappedUnderlying}
              remainingLiquidityUnderlying={remainingLiquidityUnderlying}
              onReusePosition={onShowModifyRateSettings}
              disabled={shouldShowChangeNetwork}
              onMigrateYield={() => setShowMigrateYieldModal(true)}
              onSuggestMigrateYield={() => setShowSuggestMigrateYieldModal(true)}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              yieldOptions={yieldOptions!}
            />
          )}
          {tabIndex === 1 && (
            <PositionPermissionsContainer
              position={positionInUse}
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
