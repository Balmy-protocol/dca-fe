import React from 'react';
import styled from 'styled-components';
import { parseUnits, formatUnits } from '@ethersproject/units';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import TokenInput from 'common/token-input';
import { formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';
import { getFrequencyLabel } from 'utils/parsing';
import { STRING_SWAP_INTERVALS } from 'config/constants';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 10px 30px;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 0;
`;

const StyledInputContainer = styled.div`
  flex-grow: 1;
`;

const StyledActionContainer = styled.div`
  flex-grow: 0;
`;

interface AddToPositionProps {
  position: Position;
  onClose: () => void;
  shouldShow: boolean;
  onAddFunds: (ammountToAdd: string) => void;
  balance: BigNumber;
}

const AddToPosition = ({ onClose, shouldShow, onAddFunds, position, balance }: AddToPositionProps) => {
  const [fromValue, setFromValue] = React.useState('');
  const hasError = fromValue && balance && parseUnits(fromValue, position.from.decimals).gt(balance);
  const frequencyType = getFrequencyLabel(position.swapInterval.toString(), position.remainingSwaps.toString());

  const newRate = position.remainingSwaps.eq(BigNumber.from(0))
    ? BigNumber.from(0)
    : parseUnits(fromValue || '0', position.from.decimals)
        .add(position.remainingLiquidity)
        .div(BigNumber.from(position.remainingSwaps));
  const handleAddFunds = () => {
    onAddFunds(fromValue);
    onClose();
  };
  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <StyledHeader>
          <IconButton
            aria-label="close"
            size="small"
            onClick={onClose}
            style={{ position: 'absolute', top: '10px', right: '25px' }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h6">
            <FormattedMessage description="add to position" defaultMessage="Add to position" />
          </Typography>
        </StyledHeader>
        <StyledInputContainer>
          <TokenInput
            id="from-value"
            error={hasError ? 'Amount cannot exceed your current balance' : ''}
            value={fromValue}
            label={position.from.symbol}
            onChange={setFromValue}
            withBalance
            isLoadingBalance={false}
            balance={balance}
            token={position.from}
          />
          <Typography variant="body2">
            <FormattedMessage
              description="in position"
              defaultMessage="In wallet: {balance} {symbol}"
              values={{ balance: formatCurrencyAmount(balance, position.from, 6), symbol: position.from.symbol }}
            />
          </Typography>
        </StyledInputContainer>
        <StyledInputContainer>
          <Typography variant="caption" component="span">
            <FormattedMessage
              description="rate detail"
              defaultMessage="We'll swap {rate} {from} every {frequency} for {ammountOfSwaps} {frequencyPlural} for you"
              values={{
                from: position.from.symbol,
                rate: formatUnits(newRate, position.from.decimals),
                frequency:
                  STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                    .singular,
                frequencyPlural: frequencyType,
                ammountOfSwaps: position.remainingSwaps.toString(),
              }}
            />
          </Typography>
        </StyledInputContainer>
        <StyledActionContainer>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={handleAddFunds}
            disabled={hasError || !fromValue || parseUnits(fromValue, position.from.decimals).lte(BigNumber.from(0))}
          >
            <FormattedMessage description="add to position" defaultMessage="Add to position" />
          </Button>
        </StyledActionContainer>
      </StyledOverlay>
    </Slide>
  );
};

export default AddToPosition;
