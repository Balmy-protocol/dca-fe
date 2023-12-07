import { Typography } from 'ui-library';
import FrequencyTypeInput from '@pages/dca/components/frequency-type-input';
import { STRING_SWAP_INTERVALS } from '@constants';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FrequencyInput from '@common/components/frequency-easy-input';
import { BigNumber } from 'ethers';
import styled from 'styled-components';
import { useCreatePositionState } from '@state/create-position/hooks';
import { AvailableSwapInterval } from '@types';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { setFrequencyType } from '@state/create-position/actions';

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

type Props = {
  frequencies: AvailableSwapInterval[];
  handleFrequencyChange: (newValue: string) => void;
};

const FrecuencySelector = ({ frequencies, handleFrequencyChange }: Props) => {
  const { frequencyType, frequencyValue } = useCreatePositionState();
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();

  const intl = useIntl();

  const onSetFrequencyType = (newFrequencyType: BigNumber) => {
    dispatch(setFrequencyType(newFrequencyType));
    trackEvent('DCA - Set frequency type', {});
  };

  return (
    <StyledFrequencyContainer>
      <StyledFrequencyTypeContainer>
        <Typography variant="body">
          <FormattedMessage description="executes" defaultMessage="Executes" />
        </Typography>
        <FrequencyTypeInput options={frequencies} selected={frequencyType} onChange={onSetFrequencyType} />
      </StyledFrequencyTypeContainer>
      <StyledFrequencyValueContainer>
        <Typography variant="body">
          <FormattedMessage
            description="howManyFreq"
            defaultMessage="How many {type}?"
            values={{
              type: intl.formatMessage(
                STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
              ),
            }}
          />
        </Typography>
        <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} />
      </StyledFrequencyValueContainer>
    </StyledFrequencyContainer>
  );
};

export default FrecuencySelector;
