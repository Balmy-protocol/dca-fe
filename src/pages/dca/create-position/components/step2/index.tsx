import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { AvailablePair, YieldOptions } from '@types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@common/components/button';
import { BigNumber } from 'ethers';
import YieldSelector from './components/yield-selector';
import Summary from './components/summary/intex';
import NextSwapAvailable from './components/next-swap-available';

const StyledGrid = styled(Grid)<{ $show: boolean }>`
  ${({ $show }) => !$show && 'position: absolute;width: auto;'};
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 89;
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

interface SwapSecondStepProps {
  handleFromValueChange: (newValue: string) => void;
  handleRateValueChange: (newValue: string) => void;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  handleFrequencyChange: (newValue: string) => void;
  buttonToShow: React.ReactNode;
  show: boolean;
  onBack: () => void;
  fromValueUsdPrice: number;
  rateUsdPrice: number;
  usdPrice?: BigNumber;
  yieldEnabled: boolean;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  existingPair?: AvailablePair;
}

const SwapSecondStep = React.forwardRef<HTMLDivElement, SwapSecondStepProps>((props, ref) => {
  const {
    handleFromValueChange,
    handleRateValueChange,
    handleFrequencyChange,
    buttonToShow,
    show,
    onBack,
    fromValueUsdPrice,
    rateUsdPrice,
    yieldEnabled,
    yieldOptions,
    isLoadingYieldOptions,
    fromCanHaveYield,
    usdPrice,
    existingPair,
    toCanHaveYield,
  } = props;

  return (
    <StyledGrid $show={show} container rowSpacing={2} ref={ref}>
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={onBack}>
          <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBackIcon fontSize="inherit" />{' '}
            <FormattedMessage description="backToSwap" defaultMessage="Back to create position" />
          </Typography>
        </Button>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <Summary
            handleFromValueChange={handleFromValueChange}
            handleFrequencyChange={handleFrequencyChange}
            handleRateValueChange={handleRateValueChange}
            rateUsdPrice={rateUsdPrice}
            yieldEnabled={yieldEnabled}
            fromCanHaveYield={fromCanHaveYield}
            fromValueUsdPrice={fromValueUsdPrice}
          />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <YieldSelector
            usdPrice={usdPrice}
            yieldEnabled={yieldEnabled}
            fromCanHaveYield={fromCanHaveYield}
            toCanHaveYield={toCanHaveYield}
            yieldOptions={yieldOptions}
            isLoadingYieldOptions={isLoadingYieldOptions}
            rateUsdPrice={rateUsdPrice}
          />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          {buttonToShow}
          <NextSwapAvailable existingPair={existingPair} yieldEnabled={yieldEnabled} />
        </StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapSecondStep;
