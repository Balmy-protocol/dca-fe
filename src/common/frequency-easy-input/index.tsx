import React from 'react';
import styled from 'styled-components';
import { SetStateCallback } from 'types';
import findIndex from 'lodash/findIndex';
import FilledInput from '@mui/material/FilledInput';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import Button from 'common/button';

interface FrequencyEasyInputProps {
  id: string;
  value: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
  isMinimal?: boolean;
}

interface SelectOption {
  value: string;
}

const inputRegex = RegExp(/^[0-9]*$/);

const PREDEFINED_RANGES = [
  {
    value: '5',
  },
  {
    value: '15',
  },
  {
    value: '30',
  },
];

const StyledFrequencyInputContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

const StyledInputContainer = styled.div`
  display: inline-flex;
  margin: 0px 6px;
`;

const StyledButton = styled(Button)<{ $isSelected: boolean }>`
  min-width: 45px;
  border-color: ${({ $isSelected }) => ($isSelected ? '#3076F6' : 'rgba(255,255,255,0.5)')} !important;
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
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

const FrequencyEasyInput = ({ id, onChange, value, isMinimal }: FrequencyEasyInputProps) => {
  const tabIndex = findIndex(PREDEFINED_RANGES, { value });
  const [setByUser, setSetByUser] = React.useState(false);
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
      setSetByUser(true);
    }
  };

  const handleChange = (index: number) => {
    onChange(PREDEFINED_RANGES[index].value);
    setSetByUser(false);
  };

  if (isMinimal) {
    return (
      <StyledInputContainer>
        <StyledFilledInput
          id={id}
          placeholder="Custom"
          onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
          style={{ width: `calc(${value.length + 1}ch + 29px)` }}
          value={value}
          fullWidth
          disableUnderline
          type="text"
          margin="none"
        />
      </StyledInputContainer>
    );
  }

  return (
    <StyledFrequencyInputContainer>
      <StyledFilledInput
        id={id}
        placeholder="Custom"
        onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
        value={tabIndex === -1 || setByUser ? value : ''}
        fullWidth
        disableUnderline
        type="text"
        margin="none"
      />
      <StyledTabContainer>
        {PREDEFINED_RANGES.map((predefinedRangeOption: SelectOption, index) => (
          <StyledButton
            color="default"
            variant="outlined"
            $isSelected={index === tabIndex && !setByUser}
            size="small"
            key={index}
            onClick={() => handleChange(index)}
          >
            {predefinedRangeOption.value}
          </StyledButton>
        ))}
      </StyledTabContainer>
    </StyledFrequencyInputContainer>
  );
};
export default FrequencyEasyInput;
