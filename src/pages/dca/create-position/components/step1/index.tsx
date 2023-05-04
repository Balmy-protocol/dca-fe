import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { Token } from '@types';
import { BigNumber } from 'ethers';
import AmountInput from './components/amount-input';
import FrequencySelector from './components/frequency-selector';
import TokenSelector from './components/token-selector';
import NetworkSelector from './components/network-selector';

export const StyledGrid = styled(Grid)<{ $show: boolean }>`
  ${({ $show }) => !$show && 'position: absolute;width: auto;'};
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 90;
`;

export const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
}

interface SwapFirstStepProps {
  show: boolean;
  startSelectingCoin: (token: Token) => void;
  cantFund: boolean | null;
  handleFrequencyChange: (newValue: string) => void;
  balance?: BigNumber;
  frequencies: AvailableSwapInterval[];
  buttonToShow: React.ReactNode;
  fromValueUsdPrice: number;
  onChangeNetwork: (chainId: number) => void;
  handleFromValueChange: (newFromValue: string) => void;
}

const SwapFirstStep = React.forwardRef<HTMLDivElement, SwapFirstStepProps>(
  (
    {
      startSelectingCoin,
      cantFund,
      balance,
      frequencies,
      handleFrequencyChange,
      buttonToShow,
      show,
      fromValueUsdPrice,
      onChangeNetwork,
      handleFromValueChange,
    },
    ref
  ) => (
    <StyledGrid container rowSpacing={2} $show={show} ref={ref}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <NetworkSelector onChangeNetwork={onChangeNetwork} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <TokenSelector startSelectingCoin={startSelectingCoin} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <AmountInput
            balance={balance}
            cantFund={cantFund}
            fromValueUsdPrice={fromValueUsdPrice}
            handleFromValueChange={handleFromValueChange}
          />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <FrequencySelector frequencies={frequencies} handleFrequencyChange={handleFrequencyChange} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>{buttonToShow}</StyledContentContainer>
      </Grid>
    </StyledGrid>
  )
);

export default SwapFirstStep;
