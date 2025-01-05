import React from 'react';
import { Grid, Typography } from 'ui-library';
import styled from 'styled-components';
import useCurrentPositions from '@hooks/useCurrentPositions';
import EmptyPositions from '@pages/dca/components/empty-positions';
import { FormattedMessage } from 'react-intl';

import { Position, TransactionTypes } from '@types';
import useTransactionModal from '@hooks/useTransactionModal';
import { useTransactionAdder } from '@state/transactions/hooks';
import { PERMISSIONS } from '@constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import ModifySettingsModal from '@common/components/modify-settings-modal';
import { useAppDispatch } from '@state/hooks';
import { initializeModifyRateSettings } from '@state/modify-rate-settings/actions';
import { Address, formatUnits } from 'viem';
import { EmptyPosition } from '@common/mocks/currentPositions';
import usePositionService from '@hooks/usePositionService';
import useSupportsSigning from '@hooks/useSupportsSigning';
import useErrorService from '@hooks/useErrorService';
import TerminateModal from '@common/components/terminate-modal';
import { deserializeError, shouldTrackError } from '@common/utils/errors';
import { OpenPosition, PositionCardSkeleton } from '../position-card';
import CreatePositionBox from './components/create-position-box';
import useAnalytics from '@hooks/useAnalytics';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

interface CurrentPositionsProps {
  isLoading: boolean;
}

function comparePositions(positionA: Position, positionB: Position) {
  const isAFinished = positionA.remainingSwaps <= 0n;
  const isBFinished = positionB.remainingSwaps <= 0n;
  if (isAFinished !== isBFinished) {
    return isAFinished ? 1 : -1;
  }

  return positionA.startedAt > positionB.startedAt ? -1 : 1;
}

const skeletonItems = Array.from(Array(5).keys());

const CurrentPositions = ({ isLoading }: CurrentPositionsProps) => {
  const hasSignSupport = useSupportsSigning();
  const { currentPositions } = useCurrentPositions();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const positionService = usePositionService();
  const errorService = useErrorService();
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(EmptyPosition);
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();

  const onCancelModifySettingsModal = React.useCallback(() => {
    setShowModifyRateSettingsModal(false);
    trackEvent('Position List - Cancel modify');
  }, [setShowModifyRateSettingsModal]);

  const onCancelTerminateModal = React.useCallback(() => {
    setShowTerminateModal(false);
    trackEvent('Position List - Cancel terminate');
  }, [setShowTerminateModal]);

  if (currentPositions && !currentPositions.length && !isLoading) {
    return <EmptyPositions />;
  }

  const onWithdraw = async (position: Position, useProtocolToken = false) => {
    const protocolToken = getProtocolToken(position.chainId);
    const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

    try {
      const { positionId } = position;
      const hasPermission = await positionService.companionHasPermission(
        { ...position, id: positionId.toString() },
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
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="Withdrawing from"
                defaultMessage="Withdrawing {toSymbol}"
                values={{ toSymbol }}
              />
            </Typography>
            {(!!useProtocolToken || !!hasYield) && !hasPermission && hasSignSupport && (
              <Typography variant="bodyRegular">
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

      let hash: Address;

      trackEvent('Position List - Withdraw position submitting', {
        chainId: position.chainId,
        withdrawn: position.toWithdraw.amountInUSD,
      });
      if (hasSignSupport) {
        const result = await positionService.withdraw(position, useProtocolToken);

        hash = result.hash;
      } else {
        const result = await positionService.withdrawSafe(position);

        hash = result.safeTxHash as Address;
      }
      trackEvent('Position List - Withdraw position submitted', {
        chainId: position.chainId,
        withdrawn: position.toWithdraw.amountInUSD,
      });

      addTransaction(
        { hash: hash, from: position.user, chainId: position.chainId },
        {
          type: TransactionTypes.withdrawPosition,
          typeData: {
            id: position.id,
            withdrawnUnderlying: position.toWithdraw.amount.toString(),
          },
          position,
        }
      );
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
      if (shouldTrackError(e as Error)) {
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while withdrawing', JSON.stringify(e), {
          position: position.id,
          useProtocolToken,
          chainId: position.chainId,
        });
        trackEvent('Position List - Withdraw position error', {
          chainId: position.chainId,
          withdrawn: position.toWithdraw.amountInUSD,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: <FormattedMessage description="modalErrorWithdraw" defaultMessage="Error while withdrawing" />,
        error: {
          ...deserializeError(e),
          extraData: {
            useProtocolToken,
            chainId: position.chainId,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const positionsInProgress = currentPositions
    .filter(({ toWithdraw, remainingSwaps }) => toWithdraw.amount > 0n || remainingSwaps > 0n)
    .sort(comparePositions);
  const positionsFinished = currentPositions
    .filter(({ toWithdraw, remainingSwaps }) => toWithdraw.amount <= 0n && remainingSwaps <= 0n)
    .sort(comparePositions);

  const sortedPositions = [...positionsInProgress, ...positionsFinished];

  const onShowModifyRateSettings = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(position.rate.amount * position.remainingSwaps, position.from.decimals),
        rate: position.rate.amountInUnits,
        frequencyValue: position.remainingSwaps.toString(),
      })
    );
    setShowModifyRateSettingsModal(true);
    trackEvent('Position List - Show modify position', {
      chainId: position.chainId,
      remainingSwaps: position.remainingSwaps,
      frequency: position.swapInterval,
    });
  };

  const onShowTerminate = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    setShowTerminateModal(true);
    trackEvent('Position List - Show terminate position', {
      chainId: position.chainId,
      remainingLiquidity: position.remainingLiquidity.amountInUSD,
      toWithdraw: position.toWithdraw.amountInUSD,
    });
  };

  return (
    <>
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={selectedPosition}
        onCancel={onCancelModifySettingsModal}
      />
      <TerminateModal open={showTerminateModal} position={selectedPosition} onCancel={onCancelTerminateModal} />
      <Grid container spacing={8}>
        {!!sortedPositions.length && (
          <>
            <StyledGridItem item xs={12} md={6}>
              <CreatePositionBox />
            </StyledGridItem>
            {isLoading
              ? skeletonItems.map((i) => (
                  <StyledGridItem item xs={12} md={6} key={i}>
                    <PositionCardSkeleton />
                  </StyledGridItem>
                ))
              : sortedPositions.map((position) => (
                  <StyledGridItem item xs={12} md={6} key={position.id}>
                    <OpenPosition
                      position={position}
                      onWithdraw={onWithdraw}
                      onReusePosition={onShowModifyRateSettings}
                      onTerminate={onShowTerminate}
                      disabled={false}
                      hasSignSupport={!!hasSignSupport}
                    />
                  </StyledGridItem>
                ))}
          </>
        )}
      </Grid>
    </>
  );
};

export default CurrentPositions;
