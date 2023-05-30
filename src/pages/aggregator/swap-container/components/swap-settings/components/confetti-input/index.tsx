import React from 'react';
import styled from 'styled-components';
import isNaN from 'lodash/isNaN';
import { SetStateCallback } from '@types';
import FilledInput from '@mui/material/FilledInput';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';

interface ConfettiInputProps {
  id: string;
  value: number;
  onChange: (newValue: number) => void | SetStateCallback<number>;
}

const inputRegex = RegExp(/^(\d*)$/);

const StyledFrequencyInputContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
`;

const StyledFilledInput = withStyles(() =>
  createStyles({
    root: {
      paddingLeft: '8px',
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
)(FilledInput);

const ConfettiInput = ({ id, onChange, value }: ConfettiInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[*+?^${}()|[\]\\]/g, '\\$&')) || !nextValue) {
      onChange(Number(nextValue));
    }
  };

  const handleBlur = () => {
    if (isNaN(value)) {
      onChange(DEFAULT_AGGREGATOR_SETTINGS.confetti);
    }
  };

  return (
    <StyledFrequencyInputContainer>
      <StyledFilledInput
        id={id}
        placeholder="Custom"
        onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
        value={value}
        disableUnderline
        type="number"
        margin="none"
        onBlur={handleBlur}
      />
    </StyledFrequencyInputContainer>
  );
};
export default ConfettiInput;
