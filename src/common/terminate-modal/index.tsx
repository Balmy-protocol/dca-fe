import React from 'react';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { PERMISSIONS, TRANSACTION_TYPES } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { BigNumber } from 'ethers';
import useSupportsSigning from 'hooks/useSupportsSigning';
import usePositionService from 'hooks/usePositionService';
import useErrorService from 'hooks/useErrorService';
import { shouldTrackError } from 'utils/errors';
import useTrackEvent from 'hooks/useTrackEvent';

interface TerminateModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
  remainingLiquidityUnderlying?: BigNumber;
  toWithdrawUnderlying?: BigNumber;
}

const StyledTerminateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
`;

const TerminateModal = ({
  position,
  open,
  onCancel,
  remainingLiquidityUnderlying,
  toWithdrawUnderlying,
}: TerminateModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const positionService = usePositionService();
  const addTransaction = useTransactionAdder();
  const currentNetwork = useCurrentNetwork();
  const errorService = useErrorService();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const [useProtocolToken, setUseProtocolToken] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const remainingLiquidity =
    remainingLiquidityUnderlying || position.remainingLiquidityUnderlying || position.remainingLiquidity;
  const toWithdraw = toWithdrawUnderlying || position.toWithdrawUnderlying || position.toWithdraw;

  const hasProtocolToken =
    position.from.address === protocolToken.address || position.to.address === protocolToken.address;
  const hasWrappedOrProtocol =
    hasProtocolToken ||
    position.from.address === wrappedProtocolToken.address ||
    position.to.address === wrappedProtocolToken.address;
  const protocolIsFrom =
    position.from.address === protocolToken.address || position.from.address === wrappedProtocolToken.address;
  const protocolIsTo =
    position.to.address === protocolToken.address || position.to.address === wrappedProtocolToken.address;
  const swappedOrLiquidity = protocolIsFrom ? remainingLiquidity : toWithdraw;
  const [hasSignSupport] = useSupportsSigning();
  const trackEvent = useTrackEvent();

  const protocolBalance = hasWrappedOrProtocol ? swappedOrLiquidity : BigNumber.from(0);
  let fromSymbol = position.from.symbol;
  let toSymbol = position.to.symbol;

  if (protocolIsFrom && !hasSignSupport) {
    fromSymbol = wrappedProtocolToken.symbol;
  }
  if (protocolIsTo && !hasSignSupport) {
    toSymbol = wrappedProtocolToken.symbol;
  }

  const handleCancel = () => {
    onCancel();
    setUseProtocolToken(false);
  };

  const handleTerminate = async () => {
    try {
      handleCancel();
      let terminateWithUnwrap = false;

      const hasPermission = await positionService.companionHasPermission(position, PERMISSIONS.TERMINATE);
      if (hasWrappedOrProtocol && protocolBalance.gt(BigNumber.from(0))) {
        if (hasProtocolToken) {
          terminateWithUnwrap = !useProtocolToken;
        } else {
          terminateWithUnwrap = useProtocolToken;
        }
      } else {
        terminateWithUnwrap = false;
      }

      terminateWithUnwrap = terminateWithUnwrap && !!hasSignSupport;

      trackEvent('DCA - Terminate position submitting', { terminateWithUnwrap });

      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage description="Terminating position" defaultMessage="Closing your position" />
            </Typography>
            {hasWrappedOrProtocol && terminateWithUnwrap && !hasPermission && (
              <Typography variant="body1">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as {token}."
                  values={{ token: position.from.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });

      const result = await positionService.terminate(position, terminateWithUnwrap);
      addTransaction(result, {
        type: TRANSACTION_TYPES.TERMINATE_POSITION,
        typeData: {
          id: position.id,
          remainingLiquidity: remainingLiquidity.toString(),
          toWithdraw: toWithdraw.toString(),
        },
        position,
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="position termination success"
            defaultMessage="Your {from}/{to} position closing has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: fromSymbol,
              to: toSymbol,
            }}
          />
        ),
      });
      trackEvent('DCA - Terminate position submitted', { terminateWithUnwrap });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        trackEvent('DCA - Terminate position error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error terminating position', JSON.stringify(e), {
          position: position.id,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: <FormattedMessage description="modalErrorTerminate" defaultMessage="Error terminating position" />,
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={handleCancel}
      showCloseIcon
      maxWidth="sm"
      title={
        <FormattedMessage
          description="terminate title"
          defaultMessage="Close {from}/{to} position"
          values={{ from: fromSymbol, to: toSymbol }}
        />
      }
      actions={[
        {
          color: 'error',
          variant: 'contained',
          label: <FormattedMessage description="ClosePosition" defaultMessage="Withdraw and close position" />,
          onClick: handleTerminate,
        },
      ]}
    >
      <StyledTerminateContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="terminate description"
            defaultMessage="Swaps are no longer going to be executed, you won't be able to make any new modifications to this position and the NFT will be burned."
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="terminate returns"
            defaultMessage="You will get back {from} {fromSymbol} and {to} {toSymbol}"
            values={{
              from: formatUnits(remainingLiquidity, position.from.decimals),
              fromSymbol,
              to: formatUnits(toWithdraw, position.to.decimals),
              toSymbol,
            }}
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage description="terminate warning" defaultMessage="This cannot be undone." />
        </Typography>
        {hasWrappedOrProtocol && hasSignSupport && protocolBalance.gt(BigNumber.from(0)) && (
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={useProtocolToken}
                  onChange={(evt) => setUseProtocolToken(evt.target.checked)}
                  name="useProtocolToken"
                />
              }
              label={
                hasWrappedOrProtocol && hasProtocolToken ? (
                  <FormattedMessage
                    description="Terminate get weth"
                    defaultMessage="Get {protocolToken} as {wrappedProtocolToken} instead"
                    values={{ protocolToken: protocolToken.symbol, wrappedProtocolToken: wrappedProtocolToken.symbol }}
                  />
                ) : (
                  <FormattedMessage
                    description="Terminate get eth"
                    defaultMessage="Get {wrappedProtocolToken} as {protocolToken} instead"
                    values={{ protocolToken: protocolToken.symbol, wrappedProtocolToken: wrappedProtocolToken.symbol }}
                  />
                )
              }
            />
          </FormGroup>
        )}
      </StyledTerminateContainer>
    </Modal>
  );
};
export default TerminateModal;
