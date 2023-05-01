import React from 'react';
import styled from 'styled-components';
import isNaN from 'lodash/isNaN';
import { SetStateCallback } from '@types';
import findIndex from 'lodash/findIndex';
import FilledInput from '@mui/material/FilledInput';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import Button from '@common/components/button';
import { DEFAULT_AGGREGATOR_SETTINGS } from '@constants/aggregator';

interface SlippageInputProps {
  id: string;
  value: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
}

interface SelectOption {
  value: string;
}

const inputRegex = RegExp(/^((100)|(\d{1,2}(\.\d{0,2})?))%?$/);

const PREDEFINED_RANGES = [
  {
    value: '0.1',
  },
  {
    value: '0.3',
  },
  {
    value: '1',
  },
];

const StyledFrequencyInputContainer = styled.div`
  display: flex;
  flex-grow: 1;
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

const SlippageInput = ({ id, onChange, value }: SlippageInputProps) => {
  const tabIndex = findIndex(PREDEFINED_RANGES, { value });
  const [setByUser, setSetByUser] = React.useState(false);
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[*+?^${}()|[\]\\]/g, '\\$&')) || !nextValue) {
      onChange(nextValue);
      setSetByUser(true);
    }
  };

  const handleChange = (index: number) => {
    onChange(PREDEFINED_RANGES[index].value);
    setSetByUser(false);
  };

  const handleBlur = () => {
    if (isNaN(parseFloat(value))) {
      onChange(DEFAULT_AGGREGATOR_SETTINGS.slippage.toString());
    }
  };

  return (
    <StyledFrequencyInputContainer>
      <StyledFilledInput
        id={id}
        placeholder="Custom"
        onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
        value={tabIndex === -1 || setByUser ? value : ''}
        disableUnderline
        type="text"
        margin="none"
        onBlur={handleBlur}
        endAdornment="%"
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
            {predefinedRangeOption.value}%
          </StyledButton>
        ))}
      </StyledTabContainer>
    </StyledFrequencyInputContainer>
  );
};
export default SlippageInput;
