import { ContainerBox, OptionsButtons, TextField } from 'ui-library';
import { DCA_PREDEFINED_RANGES, STRING_SWAP_INTERVALS } from '@constants';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCreatePositionState } from '@state/create-position/hooks';
import { AvailableSwapInterval } from '@types';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { setFrequencyType } from '@state/create-position/actions';
import { StyledDcaInputLabel } from '../..';
import { capitalize } from 'lodash';

const inputRegex = RegExp(/^[0-9]*$/);

type Props = {
  frequencies: AvailableSwapInterval[];
  handleFrequencyChange: (newValue: string) => void;
};

const FrecuencySelector = ({ frequencies, handleFrequencyChange }: Props) => {
  const { frequencyType, frequencyValue } = useCreatePositionState();
  const { trackEvent } = useAnalytics();
  const dispatch = useAppDispatch();

  const intl = useIntl();

  const onSetFrequencyType = (newFrequencyType: bigint) => {
    dispatch(setFrequencyType(newFrequencyType));
    trackEvent('DCA - Set frequency type', {});
  };

  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      handleFrequencyChange(nextValue);
    }
  };

  const frequencyValueOptions = DCA_PREDEFINED_RANGES.map((range) => ({
    value: range.value,
    text: `${range.value} ${intl.formatMessage(
      STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
    )}`,
  }));

  const frequencyTypeOptions = frequencies.map((freq) => ({
    value: freq.value,
    text: capitalize(freq.label.adverb),
  }));

  return (
    <>
      <ContainerBox justifyContent="space-between" flexWrap="wrap" gap={2}>
        <ContainerBox flexDirection="column" gap={3} flex={1}>
          <StyledDcaInputLabel>
            <FormattedMessage description="investmentDuration" defaultMessage="Investment Duration" />
          </StyledDcaInputLabel>
          <ContainerBox gap={2} flex={1} alignSelf="flex-start" alignItems="stretch">
            <TextField
              id="investment-duration-input"
              placeholder={`0 ${intl.formatMessage(
                STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject
              )}`}
              onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
              value={frequencyValue}
              sx={{ flex: 1 }}
            />
            <OptionsButtons
              options={frequencyValueOptions}
              activeOption={frequencyValue}
              setActiveOption={handleFrequencyChange}
            />
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={3}>
          <StyledDcaInputLabel>
            <FormattedMessage description="executes" defaultMessage="Executes" />
          </StyledDcaInputLabel>
          <ContainerBox gap={2} flex={1} alignSelf="stretch" alignItems="stretch">
            <OptionsButtons
              options={frequencyTypeOptions}
              activeOption={frequencyType}
              setActiveOption={onSetFrequencyType}
            />
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
    </>
  );
};

export default FrecuencySelector;
