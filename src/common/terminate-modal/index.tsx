import React from 'react';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { PERMISSIONS, POSITION_VERSION_3, TRANSACTION_TYPES } from 'config/constants';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { BigNumber } from 'ethers';

interface TerminateModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const StyledTerminateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
`;

const TerminateModal = ({ position, open, onCancel }: TerminateModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);
  const addTransaction = useTransactionAdder();
  const currentNetwork = useCurrentNetwork();
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const [useProtocolToken, setUseProtocolToken] = React.useState(false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const hasProtocolToken =
    position.from.address === protocolToken.address || position.to.address === protocolToken.address;
  const hasWrappedOrProtocol =
    hasProtocolToken ||
    position.from.address === wrappedProtocolToken.address ||
    position.to.address === wrappedProtocolToken.address;
  const protocolIsFrom =
    position.from.address === protocolToken.address || position.from.address === wrappedProtocolToken.address;
  const swappedOrLiquidity = protocolIsFrom ? position.remainingLiquidity : position.toWithdraw;

  const protocolBalance = hasWrappedOrProtocol ? swappedOrLiquidity : BigNumber.from(0);

  const handleCancel = () => {
    onCancel();
    setUseProtocolToken(false);
  };

  const handleTerminate = async () => {
    try {
      handleCancel();
      let terminateWithUnwrap = false;

      const positionId =
        position.version === POSITION_VERSION_3 ? position.id : position.id.substring(0, position.id.length - 3);
      const hasPermission = await web3Service.companionHasPermission(
        { ...position, id: positionId },
        PERMISSIONS.TERMINATE
      );
      if (hasWrappedOrProtocol && protocolBalance.gt(BigNumber.from(0))) {
        if (hasProtocolToken) {
          terminateWithUnwrap = !useProtocolToken;
        } else {
          terminateWithUnwrap = useProtocolToken;
        }
      } else {
        terminateWithUnwrap = false;
      }

      setModalLoading({
        content: (
          <>
            <Typography variant="body1">
              <FormattedMessage description="Terminating position" defaultMessage="Terminating your position" />
            </Typography>
            {hasWrappedOrProtocol && terminateWithUnwrap && !hasPermission && (
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

      const result = await web3Service.terminate(
        {
          ...position,
          id: positionId,
        },
        terminateWithUnwrap
      );
      addTransaction(result, { type: TRANSACTION_TYPES.TERMINATE_POSITION, typeData: { id: position.id } });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="position termination success"
            defaultMessage="Your {from}/{to} position termination has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error while terminating position',
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
          defaultMessage="Terminate {from}/{to} position"
          values={{ from: position.from.symbol, to: position.to.symbol }}
        />
      }
      actions={[
        {
          color: 'error',
          variant: 'contained',
          label: <FormattedMessage description="Terminate" defaultMessage="Terminate" />,
          onClick: handleTerminate,
        },
      ]}
    >
      <StyledTerminateContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="terminate description"
            defaultMessage="Swaps are no longer going to be executed, you won't be able to make any new modifications to this position."
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="terminate returns"
            defaultMessage="You will get back {from} {fromSymbol} and {to} {toSymbol}"
            values={{
              from: formatUnits(position.remainingLiquidity, position.from.decimals),
              fromSymbol: position.from.symbol,
              to: formatUnits(position.toWithdraw, position.to.decimals),
              toSymbol: position.to.symbol,
            }}
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage description="terminate warning" defaultMessage="This cannot be undone." />
        </Typography>
        {hasWrappedOrProtocol && protocolBalance.gt(BigNumber.from(0)) && (
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
