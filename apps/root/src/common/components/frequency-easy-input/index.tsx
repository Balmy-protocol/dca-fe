import React from 'react';
import styled from 'styled-components';
import { SetStateCallback } from '@types';
import findIndex from 'lodash/findIndex';
import { FilledInput, createStyles, Button } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import { defineMessage, useIntl } from 'react-intl';
import { DCA_PREDEFINED_RANGES } from '@constants/dca';

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
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

const StyledFilledInput = withStyles(FilledInput, () =>
  createStyles({
    root: {
      paddingLeft: '8px',
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
);

const FrequencyEasyInput = ({ id, onChange, value, isMinimal }: FrequencyEasyInputProps) => {
  const tabIndex = findIndex(DCA_PREDEFINED_RANGES, { value });
  const [setByUser, setSetByUser] = React.useState(false);
  const intl = useIntl();
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
      setSetByUser(true);
    }
  };

  const handleChange = (index: number) => {
    onChange(DCA_PREDEFINED_RANGES[index].value);
    setSetByUser(false);
  };

  if (isMinimal) {
    return (
      <StyledInputContainer>
        <StyledFilledInput
          id={id}
          placeholder={intl.formatMessage(
            defineMessage({ defaultMessage: 'Custom', description: 'freqEasyInputCustom' })
          )}
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
        placeholder={intl.formatMessage(
          defineMessage({ defaultMessage: 'Custom', description: 'freqEasyInputCustom' })
        )}
        onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
        value={tabIndex === -1 || setByUser ? value : ''}
        fullWidth
        disableUnderline
        type="text"
        margin="none"
      />
      <StyledTabContainer>
        {DCA_PREDEFINED_RANGES.map((predefinedRangeOption: SelectOption, index) => (
          <StyledButton
            color="primary"
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
