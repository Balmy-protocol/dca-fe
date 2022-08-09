import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { Token } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenButton from 'common/token-button';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-easy-input';
import FrequencyTypeInput from 'common/frequency-type-input';
import IconButton from '@mui/material/IconButton';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { STRING_SWAP_INTERVALS } from 'config/constants';
import { emptyTokenWithAddress } from 'utils/currency';
import { BigNumber } from 'ethers';

const StyledGrid = styled(Grid)<{ show: boolean }>`
  ${({ show }) => !show && 'position: absolute;width: auto;'};
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const StyledTokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0;
  gap: 5px;
`;

const StyledToggleContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const StyledToggleTokenButton = styled(IconButton)`
  border: 4px solid #1b1821;
  background-color: #292929;
  :hover {
    background-color: #484848;
  }
`;

const StyledRateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledFrequencyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledFrequencyTypeContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const StyledFrequencyValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
}

interface SwapFirstStepProps {
  from: Token | null;
  fromValue: string;
  to: Token | null;
  show: boolean;
  frequencyType: BigNumber;
  frequencyValue: string;
  startSelectingCoin: (token: Token) => void;
  toggleFromTo: () => void;
  setFrequencyType: (newFrequencyType: BigNumber) => void;
  cantFund: boolean | null;
  handleFromValueChange: (newValue: string) => void;
  handleFrequencyChange: (newValue: string) => void;
  balance?: BigNumber;
  frequencies: AvailableSwapInterval[];
  buttonToShow: React.ReactNode;
}

const SwapFirstStep = React.forwardRef<HTMLDivElement, SwapFirstStepProps>((props, ref) => {
  const {
    from,
    to,
    fromValue,
    toggleFromTo,
    setFrequencyType,
    frequencyType,
    frequencyValue,
    startSelectingCoin,
    cantFund,
    handleFromValueChange,
    balance,
    frequencies,
    handleFrequencyChange,
    buttonToShow,
    show,
  } = props;

  return (
    <StyledGrid container rowSpacing={2} show={show} ref={ref}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledTokensContainer>
            <StyledTokenContainer>
              <Typography variant="body1">
                <FormattedMessage description="sell" defaultMessage="Sell" />
              </Typography>
              <TokenButton token={from} onClick={() => startSelectingCoin(from || emptyTokenWithAddress('from'))} />
            </StyledTokenContainer>
            <StyledToggleContainer>
              <StyledToggleTokenButton onClick={() => toggleFromTo()}>
                <SwapHorizIcon />
              </StyledToggleTokenButton>
            </StyledToggleContainer>
            <StyledTokenContainer>
              <Typography variant="body1">
                <FormattedMessage description="receive" defaultMessage="Receive" />
              </Typography>
              <TokenButton token={to} onClick={() => startSelectingCoin(to || emptyTokenWithAddress('to'))} />
            </StyledTokenContainer>
          </StyledTokensContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          {/* rate */}
          <StyledRateContainer>
            <Typography variant="body1">
              <FormattedMessage
                description="howMuchToSell"
                defaultMessage="How much {from} do you want to invest?"
                values={{ from: from?.symbol || '' }}
              />
            </Typography>
            <TokenInput
              id="from-value"
              error={cantFund ? 'Amount cannot exceed balance' : ''}
              value={fromValue}
              onChange={handleFromValueChange}
              withBalance={!!balance}
              balance={balance}
              token={from}
              withMax
              withHalf
              fullWidth
            />
          </StyledRateContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledFrequencyContainer>
            <StyledFrequencyTypeContainer>
              <Typography variant="body1">
                <FormattedMessage description="executes" defaultMessage="Executes" />
              </Typography>
              <FrequencyTypeInput options={frequencies} selected={frequencyType} onChange={setFrequencyType} />
            </StyledFrequencyTypeContainer>
            <StyledFrequencyValueContainer>
              <Typography variant="body1">
                <FormattedMessage
                  description="howManyFreq"
                  defaultMessage="How many {type}?"
                  values={{
                    type: STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject,
                  }}
                />
              </Typography>
              <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} />
            </StyledFrequencyValueContainer>
          </StyledFrequencyContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>{buttonToShow}</StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapFirstStep;
