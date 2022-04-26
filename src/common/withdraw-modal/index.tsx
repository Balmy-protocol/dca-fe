import React from 'react';
import styled from 'styled-components';
import { formatUnits } from '@ethersproject/units';
import Button from 'common/button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { PERMISSIONS, TRANSACTION_TYPES } from 'config/constants';
import { makeStyles } from '@mui/styles';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';

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
  *:not(:last-child) {
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
  useProtocolToken: boolean;
}

const WithdrawModal = ({ position, open, onCancel, useProtocolToken }: WithdrawModalProps) => {
  const classes = useStyles();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const currentNetwork = useCurrentNetwork();
  const { web3Service } = React.useContext(WalletContext);
  const protocolToken = getProtocolToken(currentNetwork.chainId);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const addTransaction = useTransactionAdder();
  const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
  const toSymbol =
    position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address
      ? protocolOrWrappedToken
      : position.to.symbol;

  const handleWithdraw = async () => {
    try {
      onCancel();
      let hasPermission;

      if (useProtocolToken) {
        hasPermission = await web3Service.companionHasPermission(position.id, PERMISSIONS.WITHDRAW);
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
                  defaultMessage="You will need to first sign a message (which is costless) to approve our Companion contract. Then, you will need to submit the transaction where you get your balance back as ETH."
                />
              </Typography>
            )}
          </>
        ),
      });
      const result = await web3Service.withdraw(position, useProtocolToken);
      addTransaction(result, { type: TRANSACTION_TYPES.WITHDRAW_POSITION, typeData: { id: position.id } });
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

  return (
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledDialogContent>
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
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="go back" defaultMessage="Go back" />
        </Button>
        <Button color="secondary" variant="contained" fullWidth onClick={handleWithdraw} autoFocus>
          <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default WithdrawModal;
