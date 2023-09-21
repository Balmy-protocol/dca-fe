import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import useCurrentPositions from '@hooks/useCurrentPositions';
import EmptyPositions from '@pages/dca/components/empty-positions';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'ethers';
import { ChainId, Position, YieldOptions, TransactionTypes } from '@types';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import { ModeTypesIds, PERMISSIONS, SUPPORTED_NETWORKS } from '@constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import ModifySettingsModal from '@common/components/modify-settings-modal';
import { useAppDispatch } from '@state/hooks';
import { initializeModifyRateSettings } from '@state/modify-rate-settings/actions';
import { formatUnits } from '@ethersproject/units';
import { EmptyPosition } from '@common/mocks/currentPositions';
import usePositionService from '@hooks/usePositionService';
import useSupportsSigning from '@hooks/useSupportsSigning';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import SuggestMigrateYieldModal from '@common/components/suggest-migrate-yield-modal';
import useErrorService from '@hooks/useErrorService';
import useYieldOptions from '@hooks/useYieldOptions';
import { TransactionResponse } from '@ethersproject/providers';
import TerminateModal from '@common/components/terminate-modal';
import { shouldTrackError } from '@common/utils/errors';
import MigrateYieldModal from '@common/components/migrate-yield-modal';
import ActivePosition from './components/position';
import FinishedPosition from './components/finished-position';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

interface CurrentPositionsProps {
  isLoading: boolean;
}

function comparePositions(positionA: Position, positionB: Position) {
  const isAFinished = positionA.remainingSwaps.lte(BigNumber.from(0));
  const isBFinished = positionB.remainingSwaps.lte(BigNumber.from(0));
  if (isAFinished !== isBFinished) {
    return isAFinished ? 1 : -1;
  }

  return positionA.startedAt > positionB.startedAt ? -1 : 1;
}

const CurrentPositions = ({ isLoading }: CurrentPositionsProps) => {
  const hasSignSupport = useSupportsSigning();
  const currentPositions = useCurrentPositions();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const positionService = usePositionService();
  const errorService = useErrorService();
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showMigrateYieldModal, setShowMigrateYieldModal] = React.useState(false);
  const [showSuggestMigrateYieldModal, setShowSuggestMigrateYieldModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(EmptyPosition);
  const dispatch = useAppDispatch();
  const yieldOptionsByChain: Record<ChainId, YieldOptions> = {};
  let isLoadingAllChainsYieldOptions = false;
  SUPPORTED_NETWORKS.forEach((supportedNetwork) => {
    const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(supportedNetwork);
    yieldOptionsByChain[supportedNetwork] = yieldOptions || [];
    isLoadingAllChainsYieldOptions = isLoadingYieldOptions || isLoadingAllChainsYieldOptions;
  });

  const onCancelModifySettingsModal = React.useCallback(
    () => setShowModifyRateSettingsModal(false),
    [setShowModifyRateSettingsModal]
  );
  const onCancelMigrateYieldModal = React.useCallback(
    () => setShowMigrateYieldModal(false),
    [setShowMigrateYieldModal]
  );
  const onCancelSuggestMigrateYieldModal = React.useCallback(
    () => setShowSuggestMigrateYieldModal(false),
    [setShowSuggestMigrateYieldModal]
  );
  const onCancelTerminateModal = React.useCallback(() => setShowTerminateModal(false), [setShowTerminateModal]);

  if (isLoading || isLoadingAllChainsYieldOptions) {
    return <CenteredLoadingIndicator size={70} />;
  }

  if (currentPositions && !currentPositions.length) {
    return <EmptyPositions />;
  }

  const onWithdraw = async (position: Position, useProtocolToken = false) => {
    const protocolToken = getProtocolToken(position.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    try {
      const { positionId } = position;
      const hasPermission = await positionService.companionHasPermission(
        { ...position, id: positionId },
        PERMISSIONS.WITHDRAW
      );

      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const toSymbol =
        position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : position.to.symbol;

      const hasYield = position.to.underlyingTokens.length;

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
            {(!!useProtocolToken || !!hasYield) && !hasPermission && hasSignSupport && (
              <Typography variant="body1">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {token}."
                  values={{ token: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });

      let result;
      let hash;

      if (hasSignSupport) {
        result = await positionService.withdraw(position, useProtocolToken);

        hash = result.hash;
      } else {
        result = await positionService.withdrawSafe(position);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result.hash = result.safeTxHash;
        hash = result.safeTxHash;
      }

      addTransaction(result as TransactionResponse, {
        type: TransactionTypes.withdrawPosition,
        typeData: {
          id: position.id,
          withdrawnUnderlying: position.toWithdrawUnderlying && position.toWithdrawUnderlying.toString(),
        },
        position,
      });
      setModalSuccess({
        hash,
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
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
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
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const positionsInProgress = currentPositions
    .filter(
      ({ toWithdraw, remainingSwaps }) => toWithdraw.gt(BigNumber.from(0)) || remainingSwaps.gt(BigNumber.from(0))
    )
    .sort(comparePositions);
  const positionsFinished = currentPositions
    .filter(
      ({ toWithdraw, remainingSwaps }) => toWithdraw.lte(BigNumber.from(0)) && remainingSwaps.lte(BigNumber.from(0))
    )
    .sort(comparePositions);

  const onShowModifyRateSettings = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(
          (position.depositedRateUnderlying || position.rate).mul(position.remainingSwaps),
          position.from.decimals
        ),
        rate: formatUnits(position.depositedRateUnderlying || position.rate, position.from.decimals),
        frequencyValue: position.remainingSwaps.toString(),
        modeType: BigNumber.from(position.remainingLiquidity).gt(BigNumber.from(0))
          ? ModeTypesIds.FULL_DEPOSIT_TYPE
          : ModeTypesIds.RATE_TYPE,
      })
    );
    setShowModifyRateSettingsModal(true);
  };

  const onShowTerminate = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    setShowTerminateModal(true);
  };

  const onShowMigrateYield = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    setShowMigrateYieldModal(true);
  };

  const onSuggestMigrateYieldModal = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    setShowSuggestMigrateYieldModal(true);
  };

  return (
    <>
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={selectedPosition}
        onCancel={onCancelModifySettingsModal}
      />
      <TerminateModal open={showTerminateModal} position={selectedPosition} onCancel={onCancelTerminateModal} />
      <MigrateYieldModal
        onCancel={onCancelMigrateYieldModal}
        open={showMigrateYieldModal}
        position={selectedPosition}
      />
      <SuggestMigrateYieldModal
        onCancel={onCancelSuggestMigrateYieldModal}
        open={showSuggestMigrateYieldModal}
        onAddFunds={onShowModifyRateSettings}
        position={selectedPosition}
      />
      <Grid container spacing={1}>
        {!!positionsInProgress.length && (
          <>
            <StyledGridItem item xs={12}>
              <Typography variant="body2">
                <FormattedMessage description="inProgressPositions" defaultMessage="ACTIVE" />
              </Typography>
            </StyledGridItem>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {positionsInProgress.map((position) => (
                  <StyledGridItem item xs={12} sm={6} md={4} key={position.id}>
                    <ActivePosition
                      position={position}
                      onWithdraw={onWithdraw}
                      onReusePosition={onShowModifyRateSettings}
                      onTerminate={onShowTerminate}
                      onMigrateYield={onShowMigrateYield}
                      onSuggestMigrateYield={onSuggestMigrateYieldModal}
                      disabled={false}
                      hasSignSupport={!!hasSignSupport}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      yieldOptionsByChain={yieldOptionsByChain}
                    />
                  </StyledGridItem>
                ))}
              </Grid>
            </Grid>
          </>
        )}
        {!!positionsFinished.length && (
          <>
            <StyledGridItem item xs={12} sx={{ marginTop: '32px' }}>
              <Typography variant="body2">
                <FormattedMessage description="donePositions" defaultMessage="DONE" />
              </Typography>
            </StyledGridItem>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {positionsFinished.map((position) => (
                  <StyledGridItem item xs={12} sm={6} md={4} key={position.id}>
                    <FinishedPosition
                      position={position}
                      onWithdraw={onWithdraw}
                      onReusePosition={onShowModifyRateSettings}
                      onMigrateYield={onShowMigrateYield}
                      onTerminate={onShowTerminate}
                      disabled={false}
                      hasSignSupport={!!hasSignSupport}
                      onSuggestMigrateYield={onSuggestMigrateYieldModal}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      yieldOptionsByChain={yieldOptionsByChain}
                    />
                  </StyledGridItem>
                ))}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default CurrentPositions;
