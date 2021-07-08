import * as React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import find from 'lodash/find';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import IconButton from '@material-ui/core/IconButton';
import Button from 'common/button';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import TokenInput from 'common/token-input';
import usePromise from 'hooks/usePromise';
import { Position, Token, Web3Service, AvailablePair } from 'types';
import { useTransactionAdder } from 'state/transactions/hooks';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import useTransactionModal from 'hooks/useTransactionModal';
import { sortTokens } from 'utils/parsing';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRight from 'assets/svg/atom/arrow-right';
import Cog from 'assets/svg/atom/cog';
import PositionMenu from 'common/position-menu';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
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
  margin-bottom: 15px;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 28px;
`;

const StyledAddCircleOutlineIcon = styled(AddCircleOutlineIcon)`
  color: rgb(17 147 34);
`;

const StyledDetailWrapper = styled.div`
  margin-bottom: 5px;
`;

const StyledProgressWrapper = styled.div`
  margin-top: 14px;
  margin-bottom: 21px;
`;

const StyledCardFooter = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const StyledCardFooterItem = styled.div``;

const StyledFreqLeft = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #dceff9;
  color: #0088cc;
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
  const { from, to, swapInterval, swapped, remainingLiquidity, remainingSwaps, id, totalSwaps } = position;
  const [shouldShowAddForm, setShouldShowAddForm] = React.useState(false);
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [fromValue, setFromValue] = React.useState('');
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
      <PositionMenu onClose={() => setShouldShowSettings(false)} shouldShow={shouldShowSettings} position={position} />
      <StyledCardContent>
        <StyledCardHeader>
          <StyledCardTitleHeader>
            <TokenIcon token={from} size="16px" />
            <Typography variant="body1">{from.symbol}</Typography>
            <ArrowRight size="20px" />
            <TokenIcon token={to} size="16px" />
            <Typography variant="body1">{to.symbol}</Typography>
          </StyledCardTitleHeader>
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={() => setShouldShowSettings(true)}
            size="small"
          >
            <Cog size="22px" />
          </IconButton>
        </StyledCardHeader>
        <StyledDetailWrapper>
          <Typography variant="body2">
            <FormattedMessage
              description="current exercised"
              defaultMessage="{exercised} {to} swapped"
              values={{ exercised: formatUnits(swapped, to.decimals), to: to.symbol }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledDetailWrapper>
          <Typography variant="body2">
            <FormattedMessage
              description="current remaining"
              defaultMessage="{remainingLiquidity} {from} remain"
              values={{ remainingLiquidity: formatUnits(remainingLiquidity, from.decimals), from: from.symbol }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledProgressWrapper>
          <LinearProgress variant="determinate" value={100 * (remainingSwaps.toNumber() / totalSwaps.toNumber())} />
        </StyledProgressWrapper>
        <StyledCardFooter>
          <StyledFreqLeft>
            <Typography variant="body2">
              <FormattedMessage
                description="days to finish"
                defaultMessage="{remainingDays} {type} left"
                values={{
                  remainingDays: remainingSwaps.toString(),
                  type: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS],
                }}
              />
            </Typography>
          </StyledFreqLeft>
          <StyledCardFooterItem>
            <Button variant="outlined" color="primary" onClick={() => setShouldShowAddForm(true)}>
              <Typography variant="body2">
                <FormattedMessage description="add to position" defaultMessage="Add to position" />
              </Typography>
            </Button>
          </StyledCardFooterItem>
        </StyledCardFooter>
      </StyledCardContent>
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
                color="primary"
                disabled={!shouldShowAddForm}
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
