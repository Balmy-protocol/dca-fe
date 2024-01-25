import React from 'react';
import { Grid, Typography, Link, Tabs, Tab, Alert, ArrowBackIcon, createStyles, Button } from 'ui-library';
import styled from 'styled-components';
import keyBy from 'lodash/keyBy';
import { useQuery } from '@apollo/client';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import getPosition from '@graphql/getPosition.graphql';
import useDCAGraphql from '@hooks/useDCAGraphql';
import { useParams } from 'react-router-dom';
import { FullPosition, GetPairSwapsData, NFTData, PositionVersions, TransactionTypes } from '@types';
import getPairSwaps from '@graphql/getPairSwaps.graphql';
import { usePositionHasPendingTransaction, useTransactionAdder } from '@state/transactions/hooks';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useAppDispatch } from '@state/hooks';
import { changePositionDetailsTab, changeRoute } from '@state/tabs/actions';
import { usePositionDetailsTab } from '@state/tabs/hooks';
import { FormattedMessage } from 'react-intl';
import { withStyles } from 'tss-react/mui';
import TerminateModal from '@common/components/terminate-modal';
import ModifySettingsModal from '@common/components/modify-settings-modal';
import { fullPositionToMappedPosition, getDisplayToken } from '@common/utils/parsing';
import {
  PERMISSIONS,
  ModeTypesIds,
  DEFAULT_NETWORK_FOR_VERSION,
  LATEST_VERSION,
  FAIL_ON_ERROR,
  AAVE_FROZEN_TOKENS,
} from '@constants';
import useTransactionModal from '@hooks/useTransactionModal';
import { initializeModifyRateSettings } from '@state/modify-rate-settings/actions';
import { Address, formatUnits, Transaction } from 'viem';
import usePositionService from '@hooks/usePositionService';
import { setPosition } from '@state/position-details/actions';
import { usePositionDetails } from '@state/position-details/hooks';
import MigrateYieldModal from '@common/components/migrate-yield-modal';
import useGqlFetchAll from '@hooks/useGqlFetchAll';
import useYieldOptions from '@hooks/useYieldOptions';
import SuggestMigrateYieldModal from '@common/components/suggest-migrate-yield-modal';
import useUnderlyingAmount from '@hooks/useUnderlyingAmount';
import useTotalGasSaved from '@hooks/useTotalGasSaved';

import useErrorService from '@hooks/useErrorService';
import { shouldTrackError } from '@common/utils/errors';
import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';
import useSupportsSigning from '@hooks/useSupportsSigning';
import { setPermissions } from '@state/position-permissions/actions';
import PositionNotFound from '../components/position-not-found';
import PositionControls from '../components/position-summary-controls';
import PositionSummaryContainer from '../components/summary-container';
import PositionPermissionsContainer from '../components/permissions-container';
import NFTModal from '../components/view-nft-modal';
import TransferPositionModal from '../components/transfer-position-modal';
import { DCA_POSITIONS_ROUTE } from '@constants/routes';
import find from 'lodash/find';

const StyledTab = withStyles(Tab, () =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
    },
    selected: {
      fontWeight: '500',
    },
  })
);

const StyledTabs = withStyles(Tabs, () =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
  })
);

const StyledLink = styled(Link)`
  margin: 0px 5px;
`;

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
  const pushToHistory = usePushToHistory();
  const tabIndex = usePositionDetailsTab();
  const dispatch = useAppDispatch();
  const positionService = usePositionService();
  const errorService = useErrorService();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const trackEvent = useTrackEvent();
  const {
    loading: isLoading,
    data,
    error,
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
      version: positionVersion || LATEST_VERSION,
      from: getDisplayToken(data.position.from, Number(chainId)),
      to: getDisplayToken(data.position.to, Number(chainId)),
    };

  const pendingTransaction = usePositionHasPendingTransaction(
    (position && fullPositionToMappedPosition(position).id) || ''
  );

  const { loading: isLoadingSwaps, data: swapsData } = useQuery<{ pair: GetPairSwapsData }>(getPairSwaps, {
    variables: {
      id: position && position.pair.id,
      ...((!FAIL_ON_ERROR && { subgraphError: 'allow' }) || { subgraphError: 'deny' }),
    },
    errorPolicy: (!FAIL_ON_ERROR && 'ignore') || 'none',
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
  const positionInUse = usePositionDetails(position?.id);
  const [totalGasSaved, isLoadingTotalGasSaved] = useTotalGasSaved(positionInUse);
  const [[toWithdrawUnderlying, swappedUnderlying, remainingLiquidityUnderlying], isLoadingUnderlyings] =
    useUnderlyingAmount([
      {
        token: positionInUse?.to,
        amount: positionInUse ? BigInt(positionInUse?.toWithdraw) : null,
        returnSame: !positionInUse?.to.underlyingTokens.length,
      },
      {
        token: positionInUse?.to,
        amount: positionInUse ? BigInt(positionInUse?.totalSwapped) : null,
        returnSame: !positionInUse?.to.underlyingTokens.length,
      },
      {
        token: positionInUse?.from,
        amount: positionInUse ? BigInt(positionInUse.remainingLiquidity) : null,
        returnSame: !positionInUse?.from.underlyingTokens.length,
      },
    ]);
  const hasSignSupport = useSupportsSigning();

  React.useEffect(() => {
    dispatch(changeRoute(DCA_POSITIONS_ROUTE.key));
    trackEvent('DCA - Visit position detail page', { chainId });
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
              operator: permission.operator.toLowerCase() as Address,
            })),
            'operator'
          ),
        })
      );
    }
  }, [position, isLoading]);

  const positionNotFound = !position && data && !isLoading;

  if (
    !error &&
    (isLoading ||
      !data ||
      (!position && !positionNotFound) ||
      isLoadingSwaps ||
      isLoadingYieldOptions ||
      isLoadingUnderlyings ||
      isLoadingTotalGasSaved)
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

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });

  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

  const handleViewNFT = async () => {
    if (!positionInUse) return;
    const tokenNFT = await positionService.getTokenNFT(fullPositionToMappedPosition(positionInUse));
    setNFTData(tokenNFT);
    setShowNFTModal(true);
    trackEvent('DCA - Position Details - View NFT');
  };

  const onBackToPositions = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(changeRoute(DCA_POSITIONS_ROUTE.key));
    pushToHistory('/positions');
    trackEvent('DCA - Go back to positions');
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
            <Typography variant="body">
              <FormattedMessage
                description="Withdrawing from"
                defaultMessage="Withdrawing {toSymbol}"
                values={{ toSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && hasSignSupport && (
              <Typography variant="body">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      trackEvent('DCA - Position details - Withdraw submitting', { chainId, useProtocolToken });

      let result;
      let hash;

      if (hasSignSupport) {
        result = await positionService.withdraw(fullPositionToMappedPosition(positionInUse), useProtocolToken);

        hash = result.hash;
      } else {
        result = await positionService.withdrawSafe(fullPositionToMappedPosition(positionInUse));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result.hash = result.safeTxHash;
        hash = result.safeTxHash;
      }

      addTransaction(result as Transaction, {
        type: TransactionTypes.withdrawPosition,
        typeData: {
          id: fullPositionToMappedPosition(positionInUse).id,
          withdrawnUnderlying: toWithdrawUnderlying.toString(),
        },
        position: fullPositionToMappedPosition(positionInUse),
      });
      setModalSuccess({
        hash,
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
      trackEvent('DCA - Position details - Withdraw submitted', { chainId, useProtocolToken });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Position details - Withdraw error', { chainId, useProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while withdrawing', JSON.stringify(e), {
          position: position.id,
          useProtocolToken,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: <FormattedMessage description="modalErrorWithdraw" defaultMessage="Error while withdrawing" />,
        error: {
          code: e.code,
          message: e.message,
          data: e.data,
          extraData: {
            useProtocolToken,
            chainId: position.chainId,
          },
        },
      });
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

      const removedFunds =
        BigInt(positionInUse.depositedRateUnderlying || positionInUse.rate) * BigInt(positionInUse.remainingSwaps);
      setModalLoading({
        content: (
          <>
            <Typography variant="body">
              <FormattedMessage
                description="Withdrawing funds from"
                defaultMessage="Withdrawing {fromSymbol} funds"
                values={{ fromSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && hasSignSupport && (
              <Typography variant="body">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.from.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      trackEvent('DCA - Position details - Withdraw funds submitting', { chainId, useProtocolToken });

      let result;
      let hash;

      if (hasSignSupport) {
        result = await positionService.modifyRateAndSwaps(
          fullPositionToMappedPosition(positionInUse),
          '0',
          '0',
          !useProtocolToken
        );
        hash = result.hash;
      } else {
        result = await positionService.modifyRateAndSwapsSafe(
          fullPositionToMappedPosition(positionInUse),
          '0',
          '0',
          !useProtocolToken
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result.hash = result.safeTxHash;
        hash = result.safeTxHash;
      }
      addTransaction(result as unknown as Transaction, {
        type: TransactionTypes.withdrawFunds,
        typeData: {
          id: fullPositionToMappedPosition(positionInUse).id,
          from: fromSymbol,
          removedFunds: removedFunds.toString(),
        },
        position: fullPositionToMappedPosition(positionInUse),
      });
      setModalSuccess({
        hash,
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
      trackEvent('DCA - Position details - Withdraw funds submitted', { chainId, useProtocolToken });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Position details - Withdraw funds error', { chainId, useProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while withdrawing funds', JSON.stringify(e), {
          position: position.chainId,
          useProtocolToken,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage description="modalErrorWithdrawFunds" defaultMessage="Error while withdrawing funds" />
        ),
        error: {
          code: e.code,
          message: e.message,
          data: e.data,
          extraData: {
            useProtocolToken,
            chainId: position.chainId,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const onShowModifyRateSettings = () => {
    if (!positionInUse) {
      return;
    }

    const rateToUse = BigInt(positionInUse.depositedRateUnderlying || positionInUse.rate);
    const remainingLiquidityToUse = rateToUse * BigInt(positionInUse.remainingSwaps);

    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(remainingLiquidityToUse, positionInUse.from.decimals),
        rate: formatUnits(rateToUse, positionInUse.from.decimals),
        frequencyValue: positionInUse.remainingSwaps.toString(),
        modeType: ModeTypesIds.RATE_TYPE,
      })
    );
    trackEvent('DCA - Position details - Show add funds modal');
    setShowModifyRateSettingsModal(true);
  };

  const handleShowTerminateModal = () => {
    setShowTerminateModal(true);
    trackEvent('DCA - Position details - Show terminate modal');
  };

  const handleShowTransferModal = () => {
    setShowTransferModal(true);
    trackEvent('DCA - Position details - Show transfer modal');
  };

  const handleShowSuggestMigrateModal = () => {
    setShowSuggestMigrateYieldModal(true);
    trackEvent('DCA - Position details - Show suggest migrate modal');
  };

  const handleShowMigrateModal = () => {
    setShowMigrateYieldModal(true);
    trackEvent('DCA - Position details - Show migrate modal');
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
          <Button variant="text" color="primary">
            {/* <Button variant="text" color="primary" onClick={onBackToPositions}> */}
            <Link href="/positions" underline="none" color="inherit" onClick={onBackToPositions}>
              <Typography variant="h5" component="div" style={{ display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon fontSize="inherit" />{' '}
                <FormattedMessage description="backToPositions" defaultMessage="Back to positions" />
              </Typography>
            </Link>
          </Button>
        </Grid>
        {((position.from.symbol === 'CRV' && position.from.underlyingTokens.length) ||
          (position.to.symbol === 'CRV' && position.to.underlyingTokens.length)) && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionCRVNotSupported"
                defaultMessage="Unfortunately, the CRV token can no longer be used as collateral on Aave V3. This means that it's not possible to swap this position. We recommend closing this position."
              />
            </Alert>
          </Grid>
        )}
        {position.from.symbol === 'LPT' && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionLPTNotSupported"
                defaultMessage="Livepeer liquidity on Arbitrum has decreased significantly, so adding funds is disabled until this situation has reverted."
              />
            </Alert>
          </Grid>
        )}
        {(position.from.symbol === 'UNIDX' || position.to.symbol === 'UNIDX') && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionUNIDXNotSupported"
                defaultMessage="$UNIDX liquidity has been moved out of Uniswap, thus rendering the oracle unreliable. Swaps have been paused until a reliable oracle for $UNIDX is available"
              />
            </Alert>
          </Grid>
        )}
        {position.from.symbol === 'jEUR' && position.from.underlyingTokens.length && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionJEURNotSupported"
                defaultMessage="Due to the latest developments Aave has paused the $jEUR lending and borrowing. As a result, increasing the position has been disabled. Read more about this here"
              />
              <StyledLink href="https://app.aave.com/governance/proposal/?proposalId=143" target="_blank">
                <FormattedMessage description="here" defaultMessage="here." />
              </StyledLink>
            </Alert>
          </Grid>
        )}
        {position.from.symbol === 'agEUR' ||
          (position.to.symbol === 'agEUR' && (
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
              <Alert severity="warning">
                <FormattedMessage
                  description="positionagEURNotSupported"
                  defaultMessage="Due to Euler's security breach, the Angle protocol has been paused. As a consequence, oracles and swaps cannot operate reliably and have been halted."
                />
              </Alert>
            </Grid>
          ))}
        {!!position.to.underlyingTokens.length && !!position.from.underlyingTokens.length && position.chainId === 1 && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionEulerHack1"
                defaultMessage="Euler has frozen the contracts after the hack, so withdraw is not possible at the moment. You might be entitled to claim compensation, to do this visit the"
              />
              <StyledLink href="https://mean.finance/euler-claim" target="_blank">
                <FormattedMessage description="EulerClaim ClaimPage" defaultMessage="claim page" />
              </StyledLink>
            </Alert>
          </Grid>
        )}
        {(AAVE_FROZEN_TOKENS.includes(foundYieldTo?.tokenAddress.toLowerCase() || '') ||
          AAVE_FROZEN_TOKENS.includes(foundYieldFrom?.tokenAddress.toLowerCase() || '')) && (
          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
            <Alert severity="warning">
              <FormattedMessage
                description="positionAaveVulnerability"
                defaultMessage="Due to recent updates, Aave has temporarily suspended certain lending and borrowing pools. Rest assured, no funds are at risk and Aave’s DAO already has a governance proposal to re-enable safely previously affected pools. However, during this period, you won’t be able to interact with your position and we won’t be able to execute the swaps. For a comprehensive understanding of Aave’s decision,"
              />
              <StyledLink
                href="https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335/1"
                target="_blank"
              >
                <FormattedMessage
                  description="clickhereForAnnouncement"
                  defaultMessage="click here to read their official announcement."
                />
              </StyledLink>
            </Alert>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', flexWrap: 'wrap' }}
        >
          <StyledTabs
            value={tabIndex}
            onChange={(e, index: number) => dispatch(changePositionDetailsTab(index))}
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
              onTerminate={handleShowTerminateModal}
              onModifyRate={onShowModifyRateSettings}
              onTransfer={handleShowTransferModal}
              onViewNFT={handleViewNFT}
              position={positionInUse}
              pendingTransaction={pendingTransaction}
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
              onMigrateYield={handleShowMigrateModal}
              onSuggestMigrateYield={handleShowSuggestMigrateModal}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              yieldOptions={yieldOptions!}
              totalGasSaved={totalGasSaved}
            />
          )}
          {tabIndex === 1 && (
            <PositionPermissionsContainer position={positionInUse} pendingTransaction={pendingTransaction} />
          )}
        </Grid>
      </StyledPositionDetailsContainer>
    </>
  );
};
export default PositionDetailFrame;
