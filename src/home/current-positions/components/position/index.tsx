import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import find from 'lodash/find';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BlockIcon from '@material-ui/icons/Block';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import SettingsIcon from '@material-ui/icons/Settings';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';
import FloatingMenu from 'common/floating-menu';
import TokenInput from 'common/token-input';
import usePromise from 'hooks/usePromise';
import { Position, Token, Web3Service, AvailablePair } from 'types';
import { useTransactionAdder } from 'state/transactions/hooks';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import { sortTokens } from 'utils/parsing';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';

const StyledCard = styled(Card)`
  margin: 10px;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 0px;
`;

const StyledCardActions = styled(CardActions)`
  padding-top: 0px;
  justify-content: flex-end;
`;

const StyledIconButton = styled(IconButton)`
  padding: 0px;
  padding-right: 12px;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
`;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 28px;
`;

const StyledAddCircleOutlineIcon = styled(AddCircleOutlineIcon)`
  color: rgb(17 147 34);
`;

const useDeletedStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.error.main,
    },
  })
);

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
  web3Service: Web3Service;
  onWithdraw: (position: Position) => void;
  onTerminate: (position: Position) => void;
  onModifyRate: (position: Position) => void;
  onRemoveFunds: (position: Position) => void;
}

const ActivePosition = ({
  position,
  onWithdraw,
  onTerminate,
  onModifyRate,
  onRemoveFunds,
  web3Service,
}: ActivePositionProps) => {
  if (!position.from || !position.to) return null;
  const { from, to, swapInterval, swapped, remainingLiquidity, remainingSwaps, id } = position;
  const [shouldShowAddForm, setShouldShowAddForm] = React.useState(false);
  const [fromValue, setFromValue] = React.useState('');
  const buttonContent = <MoreVertIcon />;
  const classNames = useDeletedStyles();
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const availablePairs = useAvailablePairs();
  const addTransaction = useTransactionAdder();
  const [balance, isLoadingBalance, balanceErrors] = usePromise<string>(
    web3Service,
    'getBalance',
    [from.address, from.decimals],
    !from || !web3Service.getAccount() || !shouldShowAddForm
  );

  const hasError = fromValue && balance && parseUnits(fromValue, from.decimals).gt(parseUnits(balance, from.decimals));

  const [token0, token1] = sortTokens(from.address, to.address);
  const pair = find(availablePairs, { token0, token1 });

  const handleAddFunds = async () => {
    try {
      setModalLoading({
        content: (
          <Typography variant="subtitle2">
            <FormattedMessage
              description="Adding funds"
              defaultMessage="Adding funds to {from}:{to} position"
              values={{ from: from.symbol, to: to.symbol }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.addFunds(position, pair as AvailablePair, fromValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.ADD_FUNDS_POSITION,
        typeData: { id, newFunds: fromValue, decimals: from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
      });
      setShouldShowAddForm(false);
      setFromValue('');
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  return (
    <StyledCard>
      <StyledCardContent>
        <StyledCardHeader>
          <StyledCardTitleHeader>
            <Typography variant="h6">{from.symbol}</Typography>
            <ArrowForwardIcon />
            <Typography variant="h6">{to.symbol}</Typography>
          </StyledCardTitleHeader>
          <FloatingMenu buttonContent={buttonContent} buttonStyles={{}} isIcon>
            <MenuItem onClick={() => onWithdraw(position)}>
              <StyledListItemIcon>
                <CallSplitIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onModifyRate(position)}>
              <StyledListItemIcon>
                <SettingsIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Modify frequency" defaultMessage="Modify Frequency" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onRemoveFunds(position)}>
              <StyledListItemIcon>
                <CallSplitIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Remove funds" defaultMessage="Withdraw funds" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onTerminate(position)} classes={classNames}>
              <StyledListItemIcon>
                <BlockIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Drop out" defaultMessage="Drop out" />
              </ListItemText>
            </MenuItem>
          </FloatingMenu>
        </StyledCardHeader>
        <Typography variant="subtitle1">
          <FormattedMessage
            description="current exercised"
            defaultMessage="{exercised} {to} swapped"
            values={{ exercised: formatUnits(swapped, to.decimals), to: to.symbol }}
          />
        </Typography>
        <Typography variant="subtitle2">
          <FormattedMessage
            description="current remaining"
            defaultMessage="{remainingLiquidity} {from} remaining"
            values={{ remainingLiquidity: formatUnits(remainingLiquidity, from.decimals), from: from.symbol }}
          />
        </Typography>
        <Typography variant="body2" component="p">
          <FormattedMessage
            description="days to finish"
            defaultMessage="{remainingDays} {type} to close"
            values={{
              remainingDays: remainingSwaps.toString(),
              type: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS],
            }}
          />
        </Typography>
      </StyledCardContent>
      <StyledCardActions>
        <StyledIconButton aria-label="add" onClick={() => setShouldShowAddForm(true)}>
          <StyledAddCircleOutlineIcon fontSize="inherit" />
        </StyledIconButton>
      </StyledCardActions>
      <Grow in={shouldShowAddForm} mountOnEnter unmountOnExit>
        <Paper elevation={4}>
          <Grid container alignItems="center" justify="space-around">
            <Grid item xs={7}>
              <TokenInput
                id="add-from-value"
                error={hasError ? 'Ammount cannot exceed balance' : ''}
                value={fromValue}
                label={from.symbol}
                onChange={setFromValue}
                withBalance={!isLoadingBalance}
                isLoadingBalance={isLoadingBalance}
                balance={balance}
              />
            </Grid>
            <Grid item xs={3} style={{ marginTop: '8px' }}>
              <Button
                size="small"
                variant="contained"
                disabled={!shouldShowAddForm}
                color="primary"
                onClick={handleAddFunds}
              >
                <Typography variant="button">
                  <FormattedMessage description="Add" defaultMessage="Add" />
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grow>
    </StyledCard>
  );
};
export default ActivePosition;
