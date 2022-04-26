import React from 'react';
import styled from 'styled-components';
import { parseUnits, formatUnits } from '@ethersproject/units';
import { getFrequencyLabel } from 'utils/parsing';
import { BigNumber } from 'ethers';
import { Position, Token } from 'types';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import TokenInput from 'common/token-input';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import FrequencyInput from 'common/frequency-input';
import { formatCurrencyAmount } from 'utils/currency';
import { STRING_SWAP_INTERVALS } from 'config/constants';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import Switch from '@mui/material/Switch';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import useBalance from 'hooks/useBalance';
import useAllowance from 'hooks/useAllowance';
import { useHasPendingApproval } from 'state/transactions/hooks';
import useWeb3Service from 'hooks/useWeb3Service';
import {
  useModifyRateSettingsActiveStep,
  useModifyRateSettingsFrequencyValue,
  useModifyRateSettingsFromValue,
  useModifyRateSettingsUseWrappedProtocolToken,
} from 'state/modify-rate-settings/hooks';
import { useAppDispatch } from 'state/hooks';
import {
  setActiveStep,
  setFrequencyValue,
  setFromValue,
  setUseWrappedProtocolToken,
} from 'state/modify-rate-settings/actions';

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

const StyledApproveButton = styled(Button)`
  margin-right: 10px;
`;

const StyledStepper = styled(Stepper)<{ isMinimal?: boolean }>`
  padding: ${(props) => (props.isMinimal ? '0px' : '24px')};
  padding-bottom: ${(props) => (props.isMinimal ? '0px' : '10px')};
`;

interface ModifyRateAndSwapsProps {
  position: Position;
  onClose: () => void;
  onModifyRateAndSwaps: (ammountToAdd: string, frequencyValue: string, useWrappedProtocol: boolean) => void;
  onApprove: (from: Token, to: Token) => void;
  isMinimal?: boolean;
  showAddCaption?: boolean;
}

const ModifyRateAndSwaps = ({
  onClose,
  onModifyRateAndSwaps,
  position,
  isMinimal,
  showAddCaption,
  onApprove,
}: ModifyRateAndSwapsProps) => {
  // const fromValue = React.useState(formatUnits(position.rate, position.from.decimals));
  const fromValue = useModifyRateSettingsFromValue();
  const activeStep = useModifyRateSettingsActiveStep();
  // const [frequencyValue, setFrequencyValue] = React.useState(position.remainingSwaps.toString());
  const frequencyValue = useModifyRateSettingsFrequencyValue();
  const useWrappedProtocolToken = useModifyRateSettingsUseWrappedProtocolToken();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();
  const web3Service = useWeb3Service();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const shouldShowWrappedProtocolSwitch = position.from.address === PROTOCOL_TOKEN_ADDRESS;
  const fromToUse = shouldShowWrappedProtocolSwitch && useWrappedProtocolToken ? wrappedProtocolToken : position.from;
  const hasPendingApproval = useHasPendingApproval(fromToUse, web3Service.getAccount());
  const [balance] = useBalance(useWrappedProtocolToken ? wrappedProtocolToken : position.from);
  const [allowance] = useAllowance(useWrappedProtocolToken ? wrappedProtocolToken : position.from);
  const realBalance = balance && balance.add(position.remainingLiquidity);
  const frequencyType = getFrequencyLabel(position.swapInterval.toString(), position.remainingSwaps.toString());
  const hasErrorCurrency = fromValue && realBalance && parseUnits(fromValue, position.from.decimals).gt(realBalance);
  const hasError = activeStep === 0 ? hasErrorCurrency : false;
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
      onModifyRateAndSwaps(fromValue, frequencyValue, shouldShowWrappedProtocolSwitch && useWrappedProtocolToken);
      onClose();
      dispatch(setFromValue(formatUnits(position.rate, position.from.decimals)));
      dispatch(setFrequencyValue(position.remainingSwaps.toString()));
    } else {
      dispatch(setActiveStep(activeStep + 1));
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onClose();
      dispatch(setFromValue(formatUnits(position.rate, position.from.decimals)));
      dispatch(setFrequencyValue(''));
    } else {
      dispatch(setActiveStep(activeStep - 1));
    }
  };

  const isIncreasingPosition = position.remainingLiquidity
    .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue || '0', fromToUse.decimals)))
    .lte(BigNumber.from(0));

  const needsToApprove =
    useWrappedProtocolToken &&
    allowance &&
    isIncreasingPosition &&
    parseUnits(allowance.allowance, position.from.decimals).lt(
      position.remainingLiquidity
        .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue || '0', fromToUse.decimals)))
        .abs()
    );

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
              {shouldShowWrappedProtocolSwitch && (
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useWrappedProtocolToken}
                        onChange={() => dispatch(setUseWrappedProtocolToken(!useWrappedProtocolToken))}
                        name="enableDisableWrappedProtocolToken"
                        color="primary"
                      />
                    }
                    label={`Use ${wrappedProtocolToken.symbol}`}
                  />
                </FormGroup>
              )}
              <TokenInput
                id="from-value"
                error={hasError ? 'Amount cannot exceed your current balance' : ''}
                value={fromValue}
                onChange={(newFromValue: string) => dispatch(setFromValue(newFromValue))}
                withBalance
                token={fromToUse}
                balance={realBalance}
                fullWidth
              />
              <Typography variant={isMinimal ? 'body2' : 'body1'}>
                <FormattedMessage
                  description="in position"
                  defaultMessage="Available: {balance} {symbol}"
                  values={{
                    balance: formatCurrencyAmount(realBalance, fromToUse, 6),
                    symbol: fromToUse.symbol,
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
                onChange={(newFrequencyValue: string) => dispatch(setFrequencyValue(newFrequencyValue))}
              />
              <Typography variant={isMinimal ? 'body2' : 'body1'}>
                <FormattedMessage
                  description="current days to finish"
                  defaultMessage="Current: {type} left"
                  values={{
                    type: frequencyType,
                  }}
                />
              </Typography>
              {frequencyValue && frequencyValue !== '0' && fromValue && fromValue !== '0' && (
                <Typography variant={isMinimal ? 'caption' : 'body2'}>
                  <FormattedMessage
                    description="rate detail"
                    defaultMessage="We'll swap {rate} {from} {frequency} for {frequencyPlural} for you"
                    values={{
                      from: fromToUse.symbol,
                      rate: fromValue,
                      frequency:
                        STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS]
                          .every,
                      frequencyPlural: getFrequencyLabel(position.swapInterval.toString(), frequencyValue),
                    }}
                  />
                </Typography>
              )}
              {showAddCaption &&
                !position.remainingLiquidity
                  .sub(BigNumber.from(frequencyValue || '0').mul(parseUnits(fromValue || '0', fromToUse.decimals)))
                  .eq(BigNumber.from(0)) && (
                  <Typography variant={isMinimal ? 'caption' : 'body2'}>
                    {isIncreasingPosition ? (
                      <FormattedMessage
                        description="rate add detail"
                        defaultMessage="You will need to provide an aditional {addAmmount} {from}"
                        values={{
                          from: fromToUse.symbol,
                          addAmmount: formatUnits(
                            position.remainingLiquidity
                              .sub(
                                BigNumber.from(frequencyValue || '0').mul(
                                  parseUnits(fromValue || '0', fromToUse.decimals)
                                )
                              )
                              .abs(),
                            fromToUse.decimals
                          ),
                        }}
                      />
                    ) : (
                      <FormattedMessage
                        description="rate withdraw detail"
                        defaultMessage="We will return {returnAmmount} {from} to you"
                        values={{
                          from: fromToUse.symbol,
                          returnAmmount: formatUnits(
                            position.remainingLiquidity
                              .sub(
                                BigNumber.from(frequencyValue || '0').mul(
                                  parseUnits(fromValue || '0', fromToUse.decimals)
                                )
                              )
                              .abs(),
                            fromToUse.decimals
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
          <div>
            {activeStep === 1 && (needsToApprove || hasPendingApproval) && (
              <StyledApproveButton
                color="primary"
                variant="contained"
                onClick={() => onApprove(fromToUse, position.to)}
                disabled={hasPendingApproval}
              >
                {hasPendingApproval ? (
                  <FormattedMessage
                    description="waiting for approval"
                    defaultMessage="Waiting for your {token} to be approved"
                    values={{
                      token: fromToUse.symbol,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    description="Allow us to use your coin"
                    defaultMessage="Approve {token}"
                    values={{
                      token: fromToUse.symbol,
                    }}
                  />
                )}
              </StyledApproveButton>
            )}
            <Button
              color={activeStep === 0 ? 'secondary' : 'primary'}
              variant="contained"
              onClick={handleNext}
              disabled={
                !!hasError || isEmpty || !!cantFund || (activeStep === 1 && needsToApprove) || hasPendingApproval
              }
            >
              {activeStep === 0 && <FormattedMessage description="next" defaultMessage="Next" />}
              {activeStep !== 0 && !cantFund && (
                <FormattedMessage description="modify rate frequency" defaultMessage="Modify position" />
              )}
              {activeStep !== 0 && cantFund && (
                <FormattedMessage description="no balance" defaultMessage="Insufficient balance" />
              )}
            </Button>
          </div>
        </StyledActionContainer>
      </StyledStepContents>
    </>
  );
};

export default ModifyRateAndSwaps;
