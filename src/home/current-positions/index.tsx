import React from 'react';
import Grid from '@mui/material/Grid';
import find from 'lodash/find';
import styled from 'styled-components';
import useCurrentPositions from 'hooks/useCurrentPositions';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import EmptyPositions from 'common/empty-positions';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'ethers';
import { Position } from 'types';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import { FULL_DEPOSIT_TYPE, NETWORKS, PERMISSIONS, RATE_TYPE, TRANSACTION_TYPES } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import ModifySettingsModal from 'common/modify-settings-modal';
import { useAppDispatch } from 'state/hooks';
import { initializeModifyRateSettings } from 'state/modify-rate-settings/actions';
import { formatUnits } from '@ethersproject/units';
import { EmptyPosition } from 'mocks/currentPositions';
import usePositionService from 'hooks/usePositionService';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useSupportsSigning from 'hooks/useSupportsSigning';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import TerminateModal from 'common/terminate-modal';
import MigratePositionModal from 'common/migrate-position-modal';
import useWalletService from 'hooks/useWalletService';
import usePrevious from 'hooks/usePrevious';
import ActivePosition from './components/position';
import FinishedPosition from './components/finished-position';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

const POSITIONS_PER_ROW = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
};
const CurrentPositions = () => {
  const [hasSignSupport] = useSupportsSigning();
  const currentPositions = useCurrentPositions();
  const currentBreakPoint = useCurrentBreakpoint();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const addTransaction = useTransactionAdder();
  const positionService = usePositionService();
  const positionsPerRow = POSITIONS_PER_ROW[currentBreakPoint];
  const positionsToFill =
    currentPositions.length % positionsPerRow !== 0 ? positionsPerRow - (currentPositions.length % positionsPerRow) : 0;
  const emptyPositions = [];
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showMigrateModal, setShowMigrateModal] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState(EmptyPosition);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const walletService = useWalletService();
  const account = walletService.getAccount();
  const prevAccount = usePrevious(account);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedCurrentPositions());

  React.useEffect(() => {
    const fetchPositions = async () => {
      await positionService.fetchCurrentPositions();
      setHasLoadedPositions(true);
      setIsLoading(false);
    };

    if (!hasLoadedPositions || account !== prevAccount) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPositions();
      setIsLoading(true);
    }
  }, [account, prevAccount]);

  const network = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId: currentNetwork.chainId })!;
    return supportedNetwork;
  }, [currentNetwork.chainId]);

  for (let i = 0; i < positionsToFill; i += 1) {
    emptyPositions.push(i);
  }

  if (isLoading) {
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
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({ content: 'Error while withdrawing', error: { code: e.code, message: e.message, data: e.data } });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const positionsInProgress = currentPositions.filter(
    ({ toWithdraw, remainingSwaps }) => toWithdraw.gt(BigNumber.from(0)) || remainingSwaps.gt(BigNumber.from(0))
  );
  const positionsFinished = currentPositions.filter(
    ({ toWithdraw, remainingSwaps }) => toWithdraw.lte(BigNumber.from(0)) && remainingSwaps.lte(BigNumber.from(0))
  );

  const onShowModifyRateSettings = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(position.remainingLiquidity, position.from.decimals),
        rate: formatUnits(position.rate, position.from.decimals),
        frequencyValue: position.remainingSwaps.toString(),
        modeType: BigNumber.from(position.remainingLiquidity).gt(BigNumber.from(0)) ? FULL_DEPOSIT_TYPE : RATE_TYPE,
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

  const onShowMigrate = (position: Position) => {
    if (!position) {
      return;
    }

    setSelectedPosition(position);
    setShowMigrateModal(true);
  };

  return (
    <>
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={selectedPosition}
        onCancel={() => setShowModifyRateSettingsModal(false)}
      />
      <TerminateModal
        open={showTerminateModal}
        position={selectedPosition}
        onCancel={() => setShowTerminateModal(false)}
      />
      <MigratePositionModal
        onCancel={() => setShowMigrateModal(false)}
        open={showMigrateModal}
        position={selectedPosition}
      />
      <Grid container spacing={1}>
        {!!positionsInProgress.length && (
          <>
            <StyledGridItem item xs={12}>
              <Typography variant="body2">
                <FormattedMessage description="inProgressPositions" defaultMessage="IN PROGRESS" />
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
                      onMigrate={onShowMigrate}
                      disabled={!isOnCorrectNetwork}
                      hasSignSupport={!!hasSignSupport}
                      network={network}
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
                <FormattedMessage description="finishedPositions" defaultMessage="FINISHED" />
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
                      onTerminate={onShowTerminate}
                      onMigrate={onShowMigrate}
                      disabled={!isOnCorrectNetwork}
                      hasSignSupport={!!hasSignSupport}
                      network={network}
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
