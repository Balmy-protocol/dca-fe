import React from 'react';
import { formatUnits } from '@ethersproject/units';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { PERMISSIONS, POSITION_VERSION_2, TRANSACTION_TYPES } from 'config/constants';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import usePositionService from 'hooks/usePositionService';
import useErrorService from 'hooks/useErrorService';
import { shouldTrackError } from 'utils/errors';

interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
  useProtocolToken: boolean;
}

const WithdrawModal = ({ position, open, onCancel, useProtocolToken }: WithdrawModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const currentNetwork = useCurrentNetwork();
  const positionService = usePositionService();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();
  const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
  const toSymbol =
    position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address
      ? protocolOrWrappedToken
      : position.to.symbol;

  const handleWithdraw = async () => {
    try {
      onCancel();
      let hasPermission;

      const positionId =
        position.version !== POSITION_VERSION_2 ? position.id : position.id.substring(0, position.id.length - 3);
      if (useProtocolToken) {
        hasPermission = await positionService.companionHasPermission(
          { ...position, id: positionId },
          PERMISSIONS.WITHDRAW
        );
      }

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
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as {token}."
                  values={{ token: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await positionService.withdraw(position, useProtocolToken);
      addTransaction(result, {
        type: TRANSACTION_TYPES.WITHDRAW_POSITION,
        typeData: { id: position.id, withdrawnUnderlying: '0' },
        position,
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
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e)) {
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while withdrawing', JSON.stringify(e), {
          position: position.id,
          useProtocolToken,
          chainId: currentNetwork.chainId,
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

  return (
    <Modal
      open={open}
      showCloseButton
      actions={[
        {
          label: <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />,
          color: 'secondary',
          variant: 'contained',
          onClick: handleWithdraw,
        },
      ]}
    >
      <Typography variant="h6">
        <FormattedMessage
          description="withdraw title"
          defaultMessage="Withdraw {toSymbol} from {from}/{to} position"
          values={{ from: position.from.symbol, to: position.to.symbol, toSymbol }}
        />
      </Typography>
      <Typography variant="body1">
        <FormattedMessage
          description="Withdraw warning"
          defaultMessage="Are you sure you want to withdraw {ammount} {to}?"
          values={{
            to: toSymbol,
            ammount: formatUnits(position.toWithdraw, position.to.decimals),
          }}
        />
      </Typography>
    </Modal>
  );
};
export default WithdrawModal;
