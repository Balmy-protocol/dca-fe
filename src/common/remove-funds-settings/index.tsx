import React from 'react';
import styled from 'styled-components';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { Position } from 'types';
import TokenInput from 'common/token-input';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import Button from 'common/button';
import Typography from '@material-ui/core/Typography';
import ArrowLeft from 'assets/svg/atom/arrow-left';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from 'utils/currency';
import { getFrequencyLabel } from 'utils/parsing';
import { STRING_SWAP_INTERVALS } from 'config/constants';

const StyledHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 0;
`;

const StyledIconButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledInputContainer = styled.div`
  flex-grow: 1;
`;

const StyledActionContainer = styled.div`
  flex-grow: 0;
`;

interface RemoveFundsSettingsProps {
  position: Position;
  onWithdraw: (ammountToRemove: string) => void;
  onClose: () => void;
}

const RemoveFundsSettings = ({ position, onWithdraw, onClose }: RemoveFundsSettingsProps) => {
  const [fromValue, setFromValue] = React.useState('');

  const newRate = position.remainingSwaps.eq(BigNumber.from(0))
    ? BigNumber.from(0)
    : position.remainingLiquidity
        .sub(parseUnits(fromValue || '0', position.from.decimals))
        .div(BigNumber.from(position.remainingSwaps));
  const hasError = fromValue && parseUnits(fromValue, position.from.decimals).gt(position.remainingLiquidity);
  const shouldDisable = fromValue && parseUnits(fromValue, position.from.decimals).lte(BigNumber.from(0));
  const frequencyType = getFrequencyLabel(position.swapInterval.toString(), position.remainingSwaps.toString());

  return (
    <>
      <StyledHeader>
        <StyledIconButton aria-label="close" size="small" onClick={onClose}>
          <ArrowLeft size="20px" />
        </StyledIconButton>
        <Typography variant="h6">
          <FormattedMessage description="withdraw funds" defaultMessage="Withdraw funds" />
        </Typography>
      </StyledHeader>
      <StyledInputContainer>
        <TokenInput
          id="from-value"
          error={hasError ? 'Amount cannot exceed or equal your current funds' : ''}
          value={fromValue}
          onChange={setFromValue}
          withBalance
          balance={position.remainingLiquidity}
          token={position.from}
        />
        <Typography variant="body2">
          <FormattedMessage
            description="in position"
            defaultMessage="In position: {balance} {symbol}"
            values={{
              balance: formatCurrencyAmount(position.remainingLiquidity, position.from, 4),
              symbol: position.from.symbol,
            }}
          />
        </Typography>
      </StyledInputContainer>
      <StyledInputContainer>
        <Typography variant="caption" component="span">
          {newRate.eq(BigNumber.from(0)) ? (
            <FormattedMessage
              description="rate detail"
              defaultMessage="We'll return {fromValue} to you and stop swapping this position"
              values={{
                fromValue,
              }}
            />
          ) : (
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
          )}
        </Typography>
      </StyledInputContainer>
      <StyledActionContainer>
        <Button
          color="secondary"
          variant="contained"
          fullWidth
          disabled={!fromValue || !!shouldDisable || !!hasError}
          onClick={() => onWithdraw(fromValue)}
        >
          <FormattedMessage description="withdraw funds" defaultMessage="Withdraw funds" />
        </Button>
      </StyledActionContainer>
    </>
  );
};
export default RemoveFundsSettings;
