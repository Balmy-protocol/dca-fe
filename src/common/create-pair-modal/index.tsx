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
import { makeStyles } from '@material-ui/core/styles';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

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
  amountOfSwaps: string;
  toDeposit: string;
  swapInterval: BigNumber;
  onCreatePair: () => void;
}

const CreatePairModal = ({
  from,
  to,
  toDeposit,
  amountOfSwaps,
  swapInterval,
  web3Service,
  open,
  onCancel,
  onCreatePair,
}: CreatePairModalProps) => {
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estimatedPrice, isLoadingEstimatedPrice, estimatedPriceErrors] = usePromise<EstimatedPairResponse>(
    web3Service,
    'getEstimatedPairCreation',
    [from, to, toDeposit, amountOfSwaps, swapInterval],
    !from || !to || !toDeposit || !amountOfSwaps || !swapInterval || !web3Service.getAccount() || !open
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();

  // TODO: Uncomment when estimateGasWorks
  // if (estimatedPriceErrors && open) {
  //   setModalError({
  //     error: estimatedPriceErrors,
  //   });
  //   onCancel();
  // }
  // const isLoading = isLoadingEstimatedPrice || !estimatedPrice;

  const isLoading = false;

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
            description="First deposit"
            defaultMessage="Create position for {from}/{to}"
            values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
          />
        </Typography>
        {isLoading ? (
          <>
            <StyledLoadingIndicatorWrapper>
              <LoadingIndicator size={70} />
            </StyledLoadingIndicatorWrapper>
            <Typography variant="body1">
              <FormattedMessage
                description="calculate pair cost"
                defaultMessage="Calculating the cost of creating this position"
              />
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1">
              <FormattedMessage
                description="create pair question"
                defaultMessage="You are the first person to create a position for this pair of tokens. Beacuse of this, the gas cost is going to be higher than a normal position creation. This, however, will be a one time operation. Are you sure you want to create the {from}/{to} position?"
                values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
              />
            </Typography>
            {/* TODO: uncomment when estimateGas works */}
            {/* <Typography variant="body1">
              <FormattedMessage
                description="Create pair"
                defaultMessage="The estimated cost of the operation is {costEth} ETH or around {costUsd} dollars."
                values={{
                  cost: estimatedPrice.gas,
                  costUsd: estimatedPrice.gasUsd.toFixed(2),
                  costEth: formatCurrencyAmount(estimatedPrice.gasEth, ETH, 4),
                }}
              />
            </Typography> */}
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
          onClick={onCreatePair}
          autoFocus
        >
          <FormattedMessage description="Create pair submit" defaultMessage="Create position" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default CreatePairModal;
