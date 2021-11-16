import React from 'react';
import styled from 'styled-components';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { getFrequencyLabel } from 'utils/parsing';
import { BigNumber } from 'ethers';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
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

const StyledActionContainer = styled.div<{ isMinimal?: boolean }>`
  flex-grow: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${(props) => (props.isMinimal ? '0px' : '20px')};
`;

const StyledStepper = styled(Stepper)<{ isMinimal?: boolean }>`
  padding: ${(props) => (props.isMinimal ? '0px' : '24px')};
  padding-bottom: ${(props) => (props.isMinimal ? '0px' : '10px')};
`;

interface ModifyRateAndSwapsProps {
  position: Position;
  onClose: () => void;
  onModifyRateAndSwaps: (ammountToAdd: string, frequencyValue: string) => void;
  balance: BigNumber;
  isMinimal?: boolean;
  showAddCaption?: boolean;
}

const ModifyRateAndSwaps = ({
  onClose,
  onModifyRateAndSwaps,
  position,
  balance,
  isMinimal,
  showAddCaption,
}: ModifyRateAndSwapsProps) => {
  const [fromValue, setFromValue] = React.useState(formatUnits(position.rate, position.from.decimals));
  const [activeStep, setActiveStep] = React.useState(0);
  const [frequencyValue, setFrequencyValue] = React.useState(position.remainingSwaps.toString());
  const realBalance = balance && balance.add(position.remainingLiquidity);
  const frequencyType = getFrequencyLabel(position.swapInterval.toString(), position.remainingSwaps.toString());
  const hasErrorFrequency = frequencyValue && BigNumber.from(frequencyValue).lte(BigNumber.from(0));
  const hasErrorCurrency = fromValue && realBalance && parseUnits(fromValue, position.from.decimals).gt(realBalance);
  const hasError = activeStep === 0 ? hasErrorCurrency : hasErrorFrequency;
  const isEmpty = activeStep === 0 ? !fromValue : !frequencyValue;

  const cantFund =
    activeStep !== 0 &&
    fromValue &&
    realBalance &&
    parseUnits(fromValue, position.from.decimals).gt(BigNumber.from(0)) &&
    frequencyValue &&
    BigNumber.from(frequencyValue).gt(BigNumber.from(0)) &&
    parseUnits(fromValue, position.from.decimals).mul(BigNumber.from(frequencyValue)).gt(realBalance);

  const handleNext = () => {
    if (activeStep === 1) {
      onModifyRateAndSwaps(fromValue, frequencyValue);
      onClose();
      setFromValue(formatUnits(position.rate, position.from.decimals));
      setFrequencyValue(position.remainingSwaps.toString());
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onClose();
      setFromValue(formatUnits(position.rate, position.from.decimals));
      setFrequencyValue('');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  return (
    <>
      <StyledStepper activeStep={activeStep} isMinimal={isMinimal}>
        <Step key="set new funds">
          <StepLabel>
            <FormattedMessage description="set new rate" defaultMessage="Set rate" />
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
                error={!!hasError ? 'Amount cannot exceed your current balance' : ''}
                value={fromValue}
                label={position.from.symbol}
                onChange={setFromValue}
                withBalance={true}
                isLoadingBalance={false}
                token={position.from}
                balance={realBalance}
                fullWidth
              />
              <Typography variant={isMinimal ? 'body2' : 'body1'}>
                <FormattedMessage
                  description="in position"
                  defaultMessage="Available: {balance} {symbol}"
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
                error={!!hasError ? 'Value must be greater than 0' : ''}
                value={frequencyValue}
                label={position.swapInterval.toString()}
                onChange={setFrequencyValue}
              />
              <Typography variant={isMinimal ? 'body2' : 'body1'}>
                <FormattedMessage
                  description="current days to finish"
                  defaultMessage="Current: {remainingDays} {type} left"
                  values={{
                    remainingDays: position.remainingSwaps.toString(),
                    type: frequencyType,
                  }}
                />
              </Typography>
              <Typography variant={isMinimal ? 'caption' : 'body2'}>
                <FormattedMessage
                  description="rate detail"
                  defaultMessage="We'll swap {rate} {from} every {frequency} for {ammountOfSwaps} {frequencyPlural} for you"
                  values={{
                    from: position.from.symbol,
                    rate: fromValue,
                    frequency:
                      STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                        .singular,
                    frequencyPlural: frequencyType,
                    ammountOfSwaps: frequencyValue || '0',
                  }}
                />
              </Typography>
              {showAddCaption && (
                <Typography variant={isMinimal ? 'caption' : 'body2'}>
                  {position.remainingLiquidity
                    .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue, position.from.decimals)))
                    .lte(BigNumber.from(0)) ? (
                    <FormattedMessage
                      description="rate add detail"
                      defaultMessage="You will need to provide an aditional {addAmmount} {from}"
                      values={{
                        from: position.from.symbol,
                        addAmmount: formatUnits(
                          position.remainingLiquidity
                            .sub(
                              BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue, position.from.decimals))
                            )
                            .abs(),
                          position.from.decimals
                        ),
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      description="rate withdraw detail"
                      defaultMessage="We will return {returnAmmount} {from} to you"
                      values={{
                        from: position.from.symbol,
                        returnAmmount: formatUnits(
                          position.remainingLiquidity
                            .sub(
                              BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue, position.from.decimals))
                            )
                            .abs(),
                          position.from.decimals
                        ),
                      }}
                    />
                  )}
                </Typography>
              )}
            </>
          )}
        </StyledInputContainer>
        <StyledActionContainer isMinimal={isMinimal}>
          <Button color="default" variant="outlined" onClick={handleBack}>
            {activeStep === 0 && <FormattedMessage description="cancel" defaultMessage="Cancel" />}
            {activeStep !== 0 && <FormattedMessage description="go back" defaultMessage="Back" />}
          </Button>
          <Button
            color={activeStep === 0 ? 'secondary' : 'primary'}
            variant="contained"
            onClick={handleNext}
            disabled={!!hasError || isEmpty || cantFund}
          >
            {activeStep === 0 && <FormattedMessage description="next" defaultMessage="Next" />}
            {activeStep !== 0 && !cantFund && (
              <FormattedMessage description="modify rate frequency" defaultMessage="Modify position" />
            )}
            {activeStep !== 0 && cantFund && (
              <FormattedMessage description="no balance" defaultMessage="Insufficient balance" />
            )}
          </Button>
        </StyledActionContainer>
      </StyledStepContents>
    </>
  );
};

export default ModifyRateAndSwaps;
