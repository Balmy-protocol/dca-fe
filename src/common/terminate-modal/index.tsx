import React from 'react';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@material-ui/core/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { PERMISSIONS, TRANSACTION_TYPES } from 'config/constants';
import { makeStyles } from '@material-ui/core/styles';
import { getProtocolToken, getWrappedProtocolToken } from 'mocks/tokens';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { BigNumber } from 'ethers';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  padding: 40px 72px !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  & > *:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 32px 32px;
`;

interface WithdrawModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const TerminateModal = ({ position, open, onCancel }: WithdrawModalProps) => {
  const classes = useStyles();
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

      const hasPermission = await web3Service.companionHasPermission(position.id, PERMISSIONS.TERMINATE);
      if (hasWrappedOrProtocol) {
        if (hasProtocolToken) {
          terminateWithUnwrap = !useProtocolToken;
        } else {
          terminateWithUnwrap = useProtocolToken;
        }
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

      const result = await web3Service.terminate(position, terminateWithUnwrap);
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
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledDialogContent>
        <Typography variant="h6">
          <FormattedMessage
            description="terminate title"
            defaultMessage="Terminate {from}/{to} position"
            values={{ from: position.from.symbol, to: position.to.symbol }}
          />
        </Typography>
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
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={handleCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="go back" defaultMessage="Go back" />
        </Button>
        <Button color="error" variant="contained" fullWidth onClick={handleTerminate} autoFocus>
          <FormattedMessage description="Terminate" defaultMessage="Terminate" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default TerminateModal;
