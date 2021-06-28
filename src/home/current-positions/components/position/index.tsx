import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
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
import { Token, Web3Service } from 'types';
import BlockIcon from '@material-ui/icons/Block';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import SettingsIcon from '@material-ui/icons/Settings';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';
import FloatingMenu from 'common/floating-menu';
import TokenInput from 'common/token-input';
import usePromise from 'hooks/usePromise';
import { CurrentPosition as ActivePositionInterface } from 'types';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';

const StyledCard = styled(Card)`
  margin: 10px;
  width: 250px;
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

interface ActivePositionProps extends Omit<ActivePositionInterface, 'from' | 'to'> {
  from: Token;
  to: Token;
  web3Service: Web3Service;
}

const ActivePosition = ({
  from,
  to,
  swapInterval,
  swapped,
  startedAt,
  remainingLiquidity,
  remainingSwaps,
  withdrawn,
  id,
  web3Service,
}: ActivePositionProps) => {
  const [shouldShowAddForm, setShouldShowAddForm] = React.useState(false);
  const [fromValue, setFromValue] = React.useState('');
  const buttonContent = <MoreVertIcon />;
  const classNames = useDeletedStyles();
  const [balance, isLoadingBalance, balanceErrors] = usePromise<string>(
    web3Service,
    'getBalance',
    [from.address, from.decimals],
    !from || !web3Service.getAccount() || !shouldShowAddForm
  );

  const hasError = fromValue && balance && BigNumber.from(fromValue).gt(BigNumber.from(balance));

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
            <MenuItem onClick={() => alert('are you fucking sure?')}>
              <StyledListItemIcon>
                <CallSplitIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Withdraw" defaultMessage="Withdraw" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => alert('are you fucking sure?')}>
              <StyledListItemIcon>
                <SettingsIcon fontSize="small" />
              </StyledListItemIcon>
              <ListItemText>
                <FormattedMessage description="Modify frequency" defaultMessage="Modify Frequency" />
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => alert('are you fucking sure?')} classes={classNames}>
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
        <Typography variant="body2">
          <FormattedMessage
            description="current remaining"
            defaultMessage="{remainingLiquidity} {from} remaining"
            values={{ remainingLiquidity: formatUnits(remainingLiquidity, from.decimals), from: from.symbol }}
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            description="days to finish"
            defaultMessage="Started at: {startedAt} with {remainingDays} {type} to close"
            values={{
              startedAt: DateTime.fromJSDate(startedAt).toLocaleString(),
              remainingDays: remainingSwaps,
              type: STRING_SWAP_INTERVALS[swapInterval as keyof typeof STRING_SWAP_INTERVALS],
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
              <Button size="small" variant="contained" disabled={!shouldShowAddForm} color="primary">
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
