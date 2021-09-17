import React from 'react';
import values from 'lodash/values';
import orderBy from 'lodash/orderBy';
import Button from '@material-ui/core/Button';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import {
  useAllNotClearedTransactions,
  useHasPendingTransactions,
  useIsTransactionPending,
} from 'state/transactions/hooks';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import { TransactionDetails } from 'types';
import useBuildTransactionDetail from 'hooks/useBuildTransactionDetail';
import { clearAllTransactions } from 'state/transactions/actions';
import { useAppDispatch } from 'state/hooks';
import Link from '@material-ui/core/Link';
import { buildEtherscanTransaction, buildEtherscanAddress } from 'utils/etherscan';
import useWeb3Service from 'hooks/useWeb3Service';
import { makeStyles } from '@material-ui/core/styles';
import useCurrentNetwork from 'hooks/useCurrentNetwork';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledPaper = styled(Paper)`
  padding: 30px;
`;

const StyledWalletInformationContainer = styled(Card)`
  padding: 10px;
  margin-bottom: 10px;
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  right: 0px;
  top: -5px;
  color: #9e9e9e;
`;

const StyledCircularProgress = styled(CircularProgress)`
  margin-left: 5px;
`;

const StyledCheck = styled(CheckCircleOutlineIcon)`
  margin-left: 5px;
  color: rgb(17 147 34);
`;

const StyledTransactionDetail = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  justify-content: space-between;
`;

const StyledTransactionDetailText = styled.div`
  display: flex;
  align-items: center;
`;

const StyledRecentTransactionsTitleContainer = styled.div<{ withMargin?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) => (props.withMargin ? 'margin-bottom: 10px' : '')};
`;

interface WalletMenuProps {
  open: boolean;
  onClose: () => void;
}

const WalletMenu = ({ open, onClose }: WalletMenuProps) => {
  const allTransactions = useAllNotClearedTransactions();
  const hasPendingTransactions = useHasPendingTransactions();
  const isPendingTransaction = useIsTransactionPending();
  const buildTransactionDetail = useBuildTransactionDetail();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const classes = useStyles();
  const currentNetwork = useCurrentNetwork();

  const allOrderedTransactions = React.useMemo(
    () =>
      orderBy(
        values(allTransactions).map((transaction: TransactionDetails) => ({
          ...transaction,
          isPending: isPendingTransaction(transaction.hash),
        })),
        'addedTime',
        'desc'
      ),
    [allTransactions, hasPendingTransactions, currentNetwork]
  );

  const onClearAll = () => {
    dispatch(clearAllTransactions({ chainId: currentNetwork.chainId }));
  };
  const onDisconnect = () => {
    web3Service.disconnect();
    onClearAll();
    onClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledPaper>
        <StyledCloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </StyledCloseButton>
        <StyledWalletInformationContainer variant="outlined">
          <StyledRecentTransactionsTitleContainer>
            <Typography variant="body2" component="span">
              <FormattedMessage
                description="connected with"
                defaultMessage="Connected with {provider}"
                values={{ provider: web3Service.getProviderInfo().name }}
              />
            </Typography>
            <Button variant="outlined" size="small" onClick={onDisconnect}>
              <FormattedMessage description="disconnect" defaultMessage="Disconnect" />
            </Button>
          </StyledRecentTransactionsTitleContainer>
          <Typography variant="subtitle1">{`${account.substring(0, 6)}...${account.substring(38)}`}</Typography>
          <Link
            href={buildEtherscanAddress(web3Service.getAccount(), currentNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="body2" component="span">
              <FormattedMessage description="view on etherscan" defaultMessage="View on explorer" />
            </Typography>
            <CallMadeIcon style={{ fontSize: '1rem' }} />
          </Link>
        </StyledWalletInformationContainer>
        <StyledRecentTransactionsTitleContainer withMargin>
          <Typography variant="h6">
            <FormattedMessage description="recent transactions" defaultMessage="Recent transactions" />
          </Typography>
          <Button variant="outlined" size="small" onClick={onClearAll}>
            <FormattedMessage description="clear all" defaultMessage="Clear All" />
          </Button>
        </StyledRecentTransactionsTitleContainer>
        {allOrderedTransactions.map((transaction) => (
          <StyledTransactionDetail key={transaction.hash}>
            <StyledTransactionDetailText>
              <Link
                href={buildEtherscanTransaction(transaction.hash, currentNetwork.chainId)}
                target="_blank"
                rel="noreferrer"
              >
                <Typography variant="body2" component="span">
                  {buildTransactionDetail(transaction)}
                </Typography>
                <CallMadeIcon style={{ fontSize: '1rem' }} />
              </Link>
            </StyledTransactionDetailText>
            {transaction.isPending ? <StyledCircularProgress size={24} /> : <StyledCheck />}
          </StyledTransactionDetail>
        ))}
      </StyledPaper>
    </Dialog>
  );
};

export default WalletMenu;
