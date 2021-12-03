import React from 'react';
import styled from 'styled-components';
import { parseUnits } from '@ethersproject/units';
import { getFrequencyLabel } from 'utils/parsing';
import { BigNumber } from 'ethers';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import TokenInput from 'common/token-input';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import FrequencyInput from 'common/frequency-input';
import { formatCurrencyAmount } from 'utils/currency';
import { STRING_SWAP_INTERVALS } from 'config/constants';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 10px 0px;
  display: flex;
  flex-direction: column;
`;

const StyledStepContents = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0px 30px;
`;

const StyledInputContainer = styled.div`
  flex-grow: 1;
`;

const StyledActionContainer = styled.div`
  flex-grow: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledStepper = styled(Stepper)`
  padding: 0px;
`;

interface ResetPositionProps {
  position: Position;
  onClose: () => void;
  shouldShow: boolean;
  onResetPosition: (ammountToAdd: string, frequencyValue: string) => void;
  balance: BigNumber;
}

const ResetPosition = ({ onClose, shouldShow, onResetPosition, position, balance }: ResetPositionProps) => {
  const [fromValue, setFromValue] = React.useState('');
  const [activeStep, setActiveStep] = React.useState(0);
  const [frequencyValue, setFrequencyValue] = React.useState('');
  const realBalance = balance && balance.add(position.remainingLiquidity);

  const hasErrorFrequency = frequencyValue && BigNumber.from(frequencyValue).lte(BigNumber.from(0));
  const hasErrorCurrency = fromValue && realBalance && parseUnits(fromValue, position.from.decimals).gt(realBalance);
  const frequencyType = getFrequencyLabel(position.swapInterval.toString(), frequencyValue);

  const hasError = activeStep === 0 ? hasErrorCurrency : hasErrorFrequency;
  const isEmpty = activeStep === 0 ? !fromValue : !frequencyValue;

  const handleNext = () => {
    if (activeStep === 1) {
      onResetPosition(fromValue, frequencyValue);
      onClose();
      setFromValue('');
      setFrequencyValue('');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onClose();
      setFromValue('');
      setFrequencyValue('');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <StyledStepper activeStep={activeStep}>
          <Step key="set new funds">
            <StepLabel>
              <FormattedMessage description="set new funds" defaultMessage="Add funds" />
            </StepLabel>
          </Step>
          <Step key="set new frequency">
            <StepLabel>
              <FormattedMessage description="set new duration" defaultMessage="Set duration" />
            </StepLabel>
          </Step>
        </StyledStepper>
        <StyledStepContents>
          <StyledInputContainer>
            {activeStep === 0 ? (
              <>
                <TokenInput
                  id="from-value"
                  error={hasError ? 'Amount cannot exceed your current balance' : ''}
                  value={fromValue}
                  onChange={setFromValue}
                  withBalance
                  token={position.from}
                  balance={realBalance}
                />
                <Typography variant="body2">
                  <FormattedMessage
                    description="in position"
                    defaultMessage="In wallet: {balance} {symbol}"
                    values={{
                      balance: formatCurrencyAmount(realBalance, position.from, 6),
                      symbol: position.from.symbol,
                    }}
                  />
                </Typography>
              </>
            ) : (
              <>
                <FrequencyInput
                  id="frequency-value"
                  error={hasError ? 'Value must be greater than 0' : ''}
                  value={frequencyValue}
                  label={position.swapInterval.toString()}
                  onChange={setFrequencyValue}
                />
                <Typography variant="caption">
                  <FormattedMessage
                    description="rate detail"
                    defaultMessage="We'll swap {rate} {from} {frequency} for {ammountOfSwaps} {frequencyPlural} for you"
                    values={{
                      from: position.from.symbol,
                      rate: fromValue,
                      frequency:
                        STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                          .every,
                      frequencyPlural: frequencyType,
                      ammountOfSwaps: frequencyValue || '0',
                    }}
                  />
                </Typography>
              </>
            )}
          </StyledInputContainer>
          <StyledActionContainer>
            <Button color="default" variant="outlined" onClick={handleBack}>
              {activeStep === 0 && <FormattedMessage description="cancel" defaultMessage="Cancel" />}
              {activeStep !== 0 && <FormattedMessage description="go back" defaultMessage="Back" />}
            </Button>
            <Button
              color={activeStep === 0 ? 'secondary' : 'primary'}
              variant="contained"
              onClick={handleNext}
              disabled={!!hasError || isEmpty}
            >
              {activeStep === 0 && <FormattedMessage description="next" defaultMessage="Next" />}
              {activeStep !== 0 && <FormattedMessage description="finish reset" defaultMessage="Set position" />}
            </Button>
          </StyledActionContainer>
        </StyledStepContents>
      </StyledOverlay>
    </Slide>
  );
};

export default ResetPosition;
