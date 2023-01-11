import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import useCurrentPositions from 'hooks/useCurrentPositions';
import EmptyPositions from 'common/empty-positions';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'ethers';
import { ChainId, Position, YieldOptions } from 'types';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import { FULL_DEPOSIT_TYPE, PERMISSIONS, RATE_TYPE, SUPPORTED_NETWORKS, TRANSACTION_TYPES } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useSelectedNetwork';
import ModifySettingsModal from 'common/modify-settings-modal';
import { useAppDispatch } from 'state/hooks';
import { initializeModifyRateSettings } from 'state/modify-rate-settings/actions';
import { formatUnits } from '@ethersproject/units';
import { EmptyPosition } from 'mocks/currentPositions';
import usePositionService from 'hooks/usePositionService';
import useSupportsSigning from 'hooks/useSupportsSigning';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import SuggestMigrateYieldModal from 'common/suggest-migrate-yield-modal';
import useErrorService from 'hooks/useErrorService';
import useYieldOptions from 'hooks/useYieldOptions';
import { shouldTrackError } from 'utils/errors';
import MigrateYieldModal from 'common/migrate-yield-modal';
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
  const [hasSignSupport] = useSupportsSigning();
  const currentPositions = useCurrentPositions();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const addTransaction = useTransactionAdder();
  const positionService = usePositionService();
  const errorService = useErrorService();
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
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

  if (isLoading || isLoadingAllChainsYieldOptions) {
    return <CenteredLoadingIndicator size={70} />;
  }

  if (currentPositions && !currentPositions.length) {
    return <EmptyPositions />;
  }

  const onWithdraw = async (position: Position, useProtocolToken = false) => {
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
            {(!!useProtocolToken || !!hasYield) && !hasPermission && (
              <Typography variant="body1">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as {token}."
                  values={{ token: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });

      const result = await positionService.withdraw(position, useProtocolToken);
      addTransaction(result, { type: TRANSACTION_TYPES.WITHDRAW_POSITION, typeData: { id: position.id }, position });
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
      setModalError({ content: 'Error while withdrawing', error: { code: e.code, message: e.message, data: e.data } });
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
        modeType: BigNumber.from(position.remainingLiquidity).gt(BigNumber.from(0)) ? FULL_DEPOSIT_TYPE : RATE_TYPE,
      })
    );
    setShowModifyRateSettingsModal(true);
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
