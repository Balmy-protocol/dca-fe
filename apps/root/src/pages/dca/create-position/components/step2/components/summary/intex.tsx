import styled from 'styled-components';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Typography } from 'ui-library';
import { useCreatePositionState } from '@state/create-position/hooks';
import { STRING_SWAP_INTERVALS } from '@constants';
import TokenInput from '@common/components/token-input';
import FrequencyInput from '@common/components/frequency-easy-input';

const StyledSummaryContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
`;

const StyledInputContainer = styled.div`
  margin: 6px 0px;
  display: inline-flex;
`;

type Props = {
  handleFromValueChange: (newFromValue: string) => void;
  handleRateValueChange: (newRateValue: string) => void;
  handleFrequencyChange: (newValue: string) => void;
  rateUsdPrice: number;
  yieldEnabled: boolean;
  fromCanHaveYield: boolean;
  fromValueUsdPrice: number;
};

const Summary = ({
  handleFromValueChange,
  handleFrequencyChange,
  handleRateValueChange,
  rateUsdPrice,
  yieldEnabled,
  fromCanHaveYield,
  fromValueUsdPrice,
}: Props) => {
  const { from, fromValue, rate, frequencyValue, fromYield, frequencyType } = useCreatePositionState();
  const intl = useIntl();

  return (
    <>
      <StyledSummaryContainer>
        <Typography variant="body1" component="span">
          <FormattedMessage description="invest detail" defaultMessage="You'll invest" />
        </Typography>
        <StyledInputContainer>
          <TokenInput
            id="from-minimal-value"
            value={fromValue || '0'}
            onChange={handleFromValueChange}
            withBalance={false}
            token={from}
            isMinimal
            maxWidth="210px"
            usdValue={fromValueUsdPrice.toFixed(2)}
          />
        </StyledInputContainer>
      </StyledSummaryContainer>
      <StyledSummaryContainer>
        <Typography variant="body1" component="span">
          <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
        </Typography>
        <StyledInputContainer>
          <TokenInput
            id="rate-value"
            value={rate}
            onChange={handleRateValueChange}
            withBalance={false}
            token={from}
            isMinimal
            usdValue={rateUsdPrice.toFixed(2)}
          />
        </StyledInputContainer>
        {yieldEnabled && fromCanHaveYield && fromYield !== null && (
          <Typography variant="body1" component="span">
            <FormattedMessage description="yield detail" defaultMessage="+ yield" />
          </Typography>
        )}
        <Typography variant="body1" component="span">
          <FormattedMessage
            description="rate detail"
            defaultMessage="{frequency} for you for"
            values={{
              frequency: intl.formatMessage(
                STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].every
              ),
            }}
          />
        </Typography>
        <StyledInputContainer>
          <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} isMinimal />
        </StyledInputContainer>
        {intl.formatMessage(
          STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
        )}
      </StyledSummaryContainer>
    </>
  );
};

export default Summary;
