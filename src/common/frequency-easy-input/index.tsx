import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { SetStateCallback } from 'types';
import { getFrequencyLabel, STRING_SWAP_INTERVALS } from 'utils/parsing';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { maximalAppleTabsStylesHook } from 'common/tabs';
import findIndex from 'lodash/findIndex';

interface FrequencyEasyInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
}

interface selectOption {
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

const StyledTabContainer = styled.div`
  flex-grow: 1;
`;

const StyledCustomContainer = styled.div`
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  background-color: #eee;
  border-radius: 50px;
  max-width: 100px;
  min-width: 100px;
  padding: 0px 10px;
`;

const StyledInput = styled.input`
  border: 0;
  outline: 0;
  text-align: center;
  background-color: transparent;
  margin: 0px;
  max-width: 60px;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.75;
  white-space: normal;
  letter-spacing: 0.02857;
  color: rgba(0, 0, 0, 0.87);
`;

const FrequencyEasyInput = ({ id, label, onChange, value }: FrequencyEasyInputProps) => {
  const frequencyType = getFrequencyLabel(label, value);

  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
      setTabIndex(-1);
    }
  };

  const [tabIndex, setTabIndex] = React.useState(findIndex(PREDEFINED_RANGES, { value }));
  const tabsStyles = maximalAppleTabsStylesHook.useTabs();
  const tabItemStyles = maximalAppleTabsStylesHook.useTabItem();
  const handleChange = (index: number) => {
    setTabIndex(index);
    onChange(PREDEFINED_RANGES[index].value);
  };

  return (
    <StyledFrequencyInputContainer>
      <StyledTabContainer>
        <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => handleChange(index)}>
          {PREDEFINED_RANGES.map((predefinedRangeOption: selectOption) => (
            <Tab
              classes={tabItemStyles}
              key={predefinedRangeOption.value}
              disableRipple
              label={predefinedRangeOption.value}
            />
          ))}
        </Tabs>
      </StyledTabContainer>
      <StyledCustomContainer>
        <StyledInput
          type="text"
          id={id}
          placeholder="Custom"
          onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
          value={tabIndex === -1 ? value : ''}
        />
      </StyledCustomContainer>
    </StyledFrequencyInputContainer>
  );
};
export default FrequencyEasyInput;
