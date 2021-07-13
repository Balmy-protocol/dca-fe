import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LoadingIndicator from 'common/centered-loading-indicator';
import { Token, Web3Service, EstimatedPairResponse } from 'types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import usePromise from 'hooks/usePromise';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import { makeStyles } from '@material-ui/core/styles';
import { formatCurrencyAmount } from 'utils/currency';
import { ETH } from 'mocks/tokens';

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

const StyledLoadingIndicatorWrapper = styled.div`
  margin: 40px;
`;

interface CreatePairModalProps {
  web3Service: Web3Service;
  from: Token;
  to: Token;
  onCancel: () => void;
  open: boolean;
}

const CreatePairModal = ({ from, to, web3Service, open, onCancel }: CreatePairModalProps) => {
  const classes = useStyles();
  const [estimatedPrice, isLoadingEstimatedPrice, estimatedPriceErrors] = usePromise<EstimatedPairResponse>(
    web3Service,
    'getEstimatedPairCreation',
    [from.address, to.address],
    !from || !to || !web3Service.getAccount() || !open
  );
  const addTransaction = useTransactionAdder();

  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();

  const handleCreatePair = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Creating pair"
              defaultMessage="Creating pair for {from} and {to}"
              values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.createPair(from.address, to.address);
      addTransaction(result, {
        type: TRANSACTION_TYPES.NEW_PAIR,
        typeData: { token0: from.address, token1: to.address },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="pair created"
            defaultMessage="The pair {from}:{to} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="xs"
      classes={{ paper: classes.paper }}
    >
      <StyledDialogContent>
        <Typography variant="h6">
          <FormattedMessage
            description="Create pair"
            defaultMessage="Create pair for {from}:{to}"
            values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
          />
        </Typography>
        {isLoadingEstimatedPrice || !estimatedPrice ? (
          <>
            <StyledLoadingIndicatorWrapper>
              <LoadingIndicator size={70} />
            </StyledLoadingIndicatorWrapper>
            <Typography variant="body1">
              <FormattedMessage
                description="calculate pair cost"
                defaultMessage="Calculating the cost of creating this pair"
              />
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="create pair question"
                defaultMessage="Are you sure you want to create the {from}:{to} currency pair?"
                values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
              />
            </Typography>
            <Typography variant="body1">
              <FormattedMessage
                description="Create pair"
                defaultMessage="The estimated cost of the operation is {costEth} ETH or around {costUsd} dollars."
                values={{
                  cost: estimatedPrice.gas,
                  costUsd: estimatedPrice.gasUsd.toFixed(2),
                  costEth: formatCurrencyAmount(estimatedPrice.gasEth, ETH, 4),
                }}
              />
            </Typography>
          </>
        )}
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="go back" defaultMessage="Go back" />
        </Button>
        <Button
          color="secondary"
          variant="contained"
          disabled={isLoadingEstimatedPrice}
          fullWidth
          onClick={handleCreatePair}
          autoFocus
        >
          <FormattedMessage description="Create pair submit" defaultMessage="Create pair" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default CreatePairModal;
