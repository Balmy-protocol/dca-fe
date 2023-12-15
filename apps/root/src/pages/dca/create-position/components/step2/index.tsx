import React from 'react';
import styled from 'styled-components';
import { Grid, Typography, ArrowBackIcon, Button } from 'ui-library';
import { YieldOptions } from '@types';
import { FormattedMessage } from 'react-intl';

import YieldSelector from './components/yield-selector';
import Summary from './components/summary/intex';

const StyledContentContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
`;

interface SwapSecondStepProps {
  handleFromValueChange: (newValue: string) => void;
  handleRateValueChange: (newValue: string) => void;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  handleFrequencyChange: (newValue: string) => void;
  onBack: () => void;
  fromValueUsdPrice: number;
  rateUsdPrice: number;
  usdPrice?: bigint;
  yieldEnabled: boolean;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
}

const SwapSecondStep = ({
  handleFromValueChange,
  handleRateValueChange,
  handleFrequencyChange,
  onBack,
  fromValueUsdPrice,
  rateUsdPrice,
  yieldEnabled,
  yieldOptions,
  isLoadingYieldOptions,
  fromCanHaveYield,
  usdPrice,
  toCanHaveYield,
}: SwapSecondStepProps) => (
  <Grid container rowSpacing={2}>
    <Grid item xs={12}>
      <Button variant="text" color="primary" onClick={onBack}>
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
  </Grid>
);
export default SwapSecondStep;
