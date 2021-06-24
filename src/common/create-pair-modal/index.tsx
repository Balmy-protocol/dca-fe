import React from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LoadingIndicator from 'common/centered-loading-indicator';
import { Token, Web3Service } from 'types';
import { FormattedMessage } from 'react-intl';
import usePromise from 'hooks/usePromise';

const StyledPaper = styled(Paper)`
  padding: 20px;
  max-width: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
`;

interface CreatePairModalProps {
  web3Service: Web3Service;
  from: Token;
  to: Token;
  onCancel: () => void;
  open: boolean;
}

const CreatePairModal = ({ from, to, web3Service, open, onCancel }: CreatePairModalProps) => {
  const [estimatedPrice, isLoadingEstimatedPrice, estimatedPriceErrors] = usePromise(
    web3Service,
    'getEstimatedPairCreation',
    [from, to],
    !from || !to || !web3Service.getAccount()
  );

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        <FormattedMessage
          description="Create pair"
          defaultMessage="Create pair with {from} and {to}"
          values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
        />
      </DialogTitle>
      <DialogContent>
        {isLoadingEstimatedPrice || !estimatedPrice ? (
          <LoadingIndicator />
        ) : (
          <DialogContentText id="alert-dialog-description">
            <FormattedMessage
              description="Create pair"
              defaultMessage="The estimated cost of the operation is {cost}"
              values={{ cost: estimatedPrice.toString() }}
            />
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          <FormattedMessage description="Cancel" defaultMessage="Cancel" />
        </Button>
        <Button onClick={() => {}} color="primary" disabled={isLoadingEstimatedPrice} autoFocus>
          <FormattedMessage description="Create pair submit" defaultMessage="Create pair" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CreatePairModal;
