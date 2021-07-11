import * as React from 'react';
import { formatUnits } from '@ethersproject/units';
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
import usePromise from 'hooks/usePromise';
import { Position, Token, Web3Service, AvailablePair } from 'types';
import { useTransactionAdder } from 'state/transactions/hooks';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import useTransactionModal from 'hooks/useTransactionModal';
import { sortTokens, calculateStale } from 'utils/parsing';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import ArrowRight from 'assets/svg/atom/arrow-right';
import Cog from 'assets/svg/atom/cog';
import PositionMenu from 'common/position-menu';
import AddToPosition from 'common/add-to-position-settings';
import { BigNumber } from 'ethers';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
`;

const StyledCardContent = styled(CardContent)`
  padding-bottom: 10px !important;
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
`;

const StyledProgressWrapper = styled.div`
  margin-top: 14px;
  margin-bottom: 21px;
`;

const StyledCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCardFooterItem = styled.div``;

const StyledFreqLeft = styled.div`
  padding: 8px 11px;
  border-radius: 5px;
  background-color: #dceff9;
  color: #0088cc;
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
  onTerminate: (position: Position) => void;
}

const ActivePosition = ({ position, onWithdraw, onTerminate, web3Service }: ActivePositionProps) => {
  const { from, to, swapInterval, swapped, remainingLiquidity, remainingSwaps, id, totalSwaps } = position;
  const [shouldShowSettings, setShouldShowSettings] = React.useState(false);
  const [shouldShowAddToPosition, setShouldShowAddToPosition] = React.useState(false);
  const [setModalSuccess, setModalLoading, setModalError, setClosedConfig] = useTransactionModal();
  const availablePairs = useAvailablePairs();
  const addTransaction = useTransactionAdder();
  const [balance] = usePromise<string>(
    web3Service,
    'getBalance',
    [from.address, from.decimals],
    !from || !web3Service.getAccount()
  );

  const [token0, token1] = sortTokens(from.address, to.address);
  const pair = find(availablePairs, { token0, token1 });

  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  const isStale = calculateStale(pair?.lastExecutedAt || 0, swapInterval, pair?.createdAt || 0);

  const handleAddFunds = async (ammountToAdd: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Adding funds"
              defaultMessage="Adding funds to {from}:{to} position"
              values={{ from: from.symbol, to: to.symbol }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.addFunds(position, pair as AvailablePair, ammountToAdd);
      addTransaction(result, {
        type: TRANSACTION_TYPES.ADD_FUNDS_POSITION,
        typeData: { id, newFunds: ammountToAdd, decimals: from.decimals },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="adding funds success"
            defaultMessage="Adding funds to {from}:{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
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
      const result = await web3Service.removeFunds(position, pair as AvailablePair, ammountToRemove);
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
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      setModalError({
        error: e,
      });
    }
  };

  const handleModifyRate = async (frequencyValue: string) => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Modifying frequency for position"
              defaultMessage="Changing your {from}:{to} position to finish in {frequencyValue} {frequencyType}"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
                frequencyValue,
                frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()],
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.modifyRate(position, pair as AvailablePair, frequencyValue);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_RATE_POSITION,
        typeData: { id: position.id, newRate: frequencyValue },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success modify frequency for position"
            defaultMessage="Changing the frequency of your {from}:{to} position to finish in {frequencyValue} {frequencyType} has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              frequencyValue,
              frequencyType: STRING_SWAP_INTERVALS[position.swapInterval.toString()],
            }}
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
    <StyledCard>
      <PositionMenu
        onClose={() => setShouldShowSettings(false)}
        shouldShow={shouldShowSettings}
        position={position}
        onWithdraw={onWithdraw}
        onTerminate={onTerminate}
        onModifyRate={handleModifyRate}
        onRemoveFunds={handleWithdrawFunds}
      />
      <AddToPosition
        onClose={() => setShouldShowAddToPosition(false)}
        shouldShow={shouldShowAddToPosition}
        position={position}
        balance={balance}
        onAddFunds={handleAddFunds}
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
          <LinearProgress
            variant="determinate"
            value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
          />
        </StyledProgressWrapper>
        <StyledCardFooter>
          {hasNoFunds ? (
            <StyledNoFunds>
              <Typography variant="body2">
                <FormattedMessage description="no funds" defaultMessage="No funds!" />
              </Typography>
            </StyledNoFunds>
          ) : isStale ? (
            <StyledStale>
              <Typography variant="body2">
                <FormattedMessage description="stale" defaultMessage="Stale" />
              </Typography>
            </StyledStale>
          ) : (
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
          )}
          <StyledCardFooterItem>
            <Button variant="outlined" color="primary" onClick={() => setShouldShowAddToPosition(true)}>
              <Typography variant="body2">
                <FormattedMessage description="add to position" defaultMessage="Add to position" />
              </Typography>
            </Button>
          </StyledCardFooterItem>
        </StyledCardFooter>
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
