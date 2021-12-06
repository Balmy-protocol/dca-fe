import * as React from 'react';
import find from 'lodash/find';
import Card from '@material-ui/core/Card';
import LinearProgress from '@material-ui/core/LinearProgress';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Button from 'common/button';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import TokenIcon from 'common/token-icon';
import { Position, Token, Web3Service } from 'types';
import { useTransactionAdder } from 'state/transactions/hooks';
import { getFrequencyLabel, sortTokens, calculateStale } from 'utils/parsing';
import useTransactionModal from 'hooks/useTransactionModal';
import { useHistory } from 'react-router-dom';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRight from 'assets/svg/atom/arrow-right';
import Cog from 'assets/svg/atom/cog';
import PositionMenu from 'common/position-menu';
import AddToPosition from 'common/add-to-position-settings';
import { BigNumber } from 'ethers';
import ResetPosition from 'common/reset-position-settings';
import { formatCurrencyAmount } from 'utils/currency';
import { buildEtherscanTransaction } from 'utils/etherscan';
import CallMadeIcon from '@material-ui/icons/CallMade';
import Link from '@material-ui/core/Link';
import useBalance from 'hooks/useBalance';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { STALE } from 'hooks/useIsStale';

const StyledHelpOutlineIcon = styled(HelpOutlineIcon)`
  margin-left: 10px;
`;

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

const StyledDetailWrapper = styled.div`
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const StyledProgressWrapper = styled.div`
  margin-top: 14px;
  margin-bottom: 21px;
`;

const StyledCardFooterButton = styled(Button)`
  margin-top: 8px;
`;

const StyledFreqLeft = styled.div`
  ${({ theme }) => `
    padding: 12px 15px;
    border-radius: 5px;
    text-align: center;
    background-color: ${theme.palette.type === 'light' ? '#dceff9' : '#275f7c'};
    color: ${theme.palette.type === 'light' ? '#0088cc' : '#ffffff'};
  `}
`;

const StyledStale = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #f9f3dc;
  color: #cc6d00;
  * {
    font-weight: 600 !important;
  }
`;

const StyledNoFunds = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #f9dcdc;
  color: #f50000;
  * {
    font-weight: 600 !important;
  }
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
  web3Service: Web3Service;
  onWithdraw: (position: Position) => void;
  onViewNFT: (position: Position) => void;
}

const ActivePosition = ({ position, onWithdraw, web3Service, onViewNFT }: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    swapped,
    remainingLiquidity,
    remainingSwaps,
    rate,
    id,
    totalSwaps,
    pendingTransaction,
    toWithdraw,
  } = position;
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [shouldShowAddToPosition, setShouldShowAddToPosition] = React.useState(false);
  const [shouldShowReset, setShouldShowReset] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const availablePairs = useAvailablePairs();
  const addTransaction = useTransactionAdder();
  const [balance] = useBalance(from);
  const currentNetwork = useCurrentNetwork();
  const history = useHistory();

  const isPending = !!pendingTransaction;
  const [token0, token1] = sortTokens(from, to);
  const pair = find(
    availablePairs,
    (findigPair) => findigPair.token0.address === token0.address && findigPair.token1.address === token1.address
  );

  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  const isStale =
    calculateStale(
      pair?.lastExecutedAt || 0,
      swapInterval,
      pair?.createdAt || 0,
      pair?.swapInfo || { swapsToPerform: [] }
    ) === STALE;

  const handleOnWithdraw = (positionToWithdraw: Position) => {
    setShouldShowSettings(false);
    onWithdraw(positionToWithdraw);
  };

  const onViewDetails = () => {
    history.push(`/positions/${position.id}`);
  };

  const handleResetPosition = async (ammountToAdd: string, frequencyValue: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="setting swap"
              defaultMessage="Adding {ammountToAdd} {from} to {from}/{to} position and setting it to run for {frequencyValue} {type}"
              values={{
                ammountToAdd,
                frequencyValue,
                from: from.symbol,
                to: to.symbol,
                type: getFrequencyLabel(swapInterval.toString(), frequencyValue),
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.resetPosition(position, ammountToAdd, frequencyValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.RESET_POSITION,
        typeData: { id, newFunds: ammountToAdd, decimals: from.decimals, newSwaps: frequencyValue },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="resetting position success"
            defaultMessage="Adding {ammountToAdd} {from} to {from}/{to} position and setting it to run for {frequencyValue} {type} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              ammountToAdd,
              frequencyValue,
              from: from.symbol,
              to: to.symbol,
              type: getFrequencyLabel(swapInterval.toString(), frequencyValue),
            }}
          />
        ),
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'error while adding funds', error: { code: e.code, message: e.message } });
    }
  };

  const handleAddFunds = async (ammountToAdd: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Adding funds"
              defaultMessage="Adding funds to {from}/{to} position"
              values={{ from: from.symbol, to: to.symbol }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.addFunds(position, ammountToAdd);
      addTransaction(result, {
        type: TRANSACTION_TYPES.ADD_FUNDS_POSITION,
        typeData: { id, newFunds: ammountToAdd, decimals: from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="adding funds success"
            defaultMessage="Adding funds to your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'error while adding funds', error: { code: e.code, message: e.message } });
    }
  };

  const handleWithdrawFunds = async (ammountToRemove: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Withdrawing funds from position"
              defaultMessage="Returning {ammountToRemove} {from} to you"
              values={{ from: position.from.symbol, ammountToRemove }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.removeFunds(position, ammountToRemove);
      addTransaction(result, {
        type: TRANSACTION_TYPES.REMOVE_FUNDS,
        typeData: { id: position.id, ammountToRemove, decimals: position.from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="Withdrawing funds from position success"
            defaultMessage="Returning {ammountToRemove} {from} to you has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{ from: position.from.symbol, ammountToRemove }}
          />
        ),
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'error while withdrawing funds', error: { code: e.code, message: e.message } });
    }
  };

  const handleModifyRateAndSwaps = async (newRate: string, newFrequency: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Modifying rate for position"
              defaultMessage="Changing your {from}/{to} position rate to swap {newRate} {from} {frequencyType} for {frequency} {frequencyTypePlural}"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
                newRate,
                frequency: newFrequency,
                frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb,
                frequencyTypePlural: getFrequencyLabel(position.swapInterval.toString(), newFrequency),
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.modifyRateAndSwaps(position, newRate, newFrequency);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION,
        typeData: { id: position.id, newRate, newSwaps: newFrequency, decimals: position.from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success modify rate for position"
            defaultMessage="Changing your {from}/{to} position rate to swap {newRate} {from} {frequencyType} for {frequency} {frequencyTypePlural} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              newRate,
              frequency: newFrequency,
              frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()].adverb,
              frequencyTypePlural: getFrequencyLabel(position.swapInterval.toString(), newFrequency),
            }}
          />
        ),
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'error while modifying rate', error: { code: e.code, message: e.message } });
    }
  };

  return (
    <StyledCard>
      <PositionMenu
        onClose={() => setShouldShowSettings(false)}
        shouldShow={shouldShowSettings}
        position={position}
        onWithdraw={handleOnWithdraw}
        onModifyRateAndSwaps={handleModifyRateAndSwaps}
        onRemoveFunds={handleWithdrawFunds}
        balance={balance || BigNumber.from(0)}
      />
      <AddToPosition
        onClose={() => setShouldShowAddToPosition(false)}
        shouldShow={shouldShowAddToPosition}
        position={position}
        balance={balance || BigNumber.from(0)}
        onAddFunds={handleAddFunds}
      />
      <ResetPosition
        onClose={() => setShouldShowReset(false)}
        shouldShow={shouldShowReset}
        position={position}
        balance={balance || BigNumber.from(0)}
        onResetPosition={handleResetPosition}
      />
      <StyledCardContent>
        <StyledCardHeader>
          <StyledCardTitleHeader>
            <TokenIcon token={from} size="16px" />
            <Typography variant="body1">{from.symbol}</Typography>
            <ArrowRight size="20px" />
            <TokenIcon token={to} size="16px" />
            <Typography variant="body1">{to.symbol}</Typography>
          </StyledCardTitleHeader>
          <div>
            <Tooltip title="View NFT" arrow placement="top">
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={() => onViewNFT(position)}
                disabled={isPending}
                size="small"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={() => setShouldShowSettings(true)}
              disabled={isPending}
              size="small"
            >
              <Cog size="22px" isDisabled={isPending} />
            </IconButton>
          </div>
        </StyledCardHeader>
        <StyledDetailWrapper>
          <Typography variant="body2" component="span">
            <FormattedMessage
              description="current swapped in position"
              defaultMessage="{exercised} {to} to withdraw"
              values={{ exercised: formatCurrencyAmount(toWithdraw, to), to: to.symbol }}
            />
          </Typography>
          <Tooltip
            title={`Total ammount swapped: ${formatCurrencyAmount(swapped, to)} ${to.symbol}`}
            arrow
            placement="top"
          >
            <StyledHelpOutlineIcon fontSize="small" />
          </Tooltip>
        </StyledDetailWrapper>
        <StyledDetailWrapper>
          <Typography variant="body2">
            <FormattedMessage
              description="current remaining"
              defaultMessage="{remainingLiquidity} {from} remaining"
              values={{ remainingLiquidity: formatCurrencyAmount(remainingLiquidity, from), from: from.symbol }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledDetailWrapper>
          <Typography variant="caption">
            <FormattedMessage
              description="current rate"
              defaultMessage="Swapping {rate} {from} {frequency}"
              values={{
                rate: formatCurrencyAmount(rate, from),
                from: from.symbol,
                frequency: STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb,
              }}
            />
          </Typography>
        </StyledDetailWrapper>
        <StyledProgressWrapper>
          <LinearProgress
            variant="determinate"
            value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
          />
        </StyledProgressWrapper>
        {!isPending && hasNoFunds && (
          <StyledNoFunds>
            <Typography variant="body2">
              <FormattedMessage description="no funds" defaultMessage="No funds!" />
            </Typography>
          </StyledNoFunds>
        )}
        {!isPending && !hasNoFunds && isStale && (
          <StyledStale>
            <Typography variant="body2">
              <FormattedMessage description="stale" defaultMessage="Stale" />
            </Typography>
          </StyledStale>
        )}
        {!isPending && !hasNoFunds && !isStale && (
          <StyledFreqLeft>
            <Typography variant="body2">
              <FormattedMessage
                description="days to finish"
                defaultMessage="{type} left"
                values={{
                  type: getFrequencyLabel(swapInterval.toString(), remainingSwaps.toString()),
                }}
              />
            </Typography>
          </StyledFreqLeft>
        )}
        <StyledCardFooterButton
          variant="contained"
          color={isPending ? 'pending' : 'secondary'}
          onClick={() => !isPending && onViewDetails()}
          fullWidth
        >
          {isPending ? (
            <Link
              href={buildEtherscanTransaction(pendingTransaction, currentNetwork.chainId)}
              target="_blank"
              rel="noreferrer"
              underline="none"
              color="inherit"
            >
              <Typography variant="body2" component="span">
                <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
              </Typography>
              <CallMadeIcon style={{ fontSize: '1rem' }} />
            </Link>
          ) : (
            <Typography variant="body2">
              <FormattedMessage description="View details" defaultMessage="View details" />
            </Typography>
          )}
        </StyledCardFooterButton>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
