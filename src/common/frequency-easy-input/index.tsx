import React from 'react';
import styled from 'styled-components';
import { SetStateCallback } from 'types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { maximalAppleTabsStylesHook } from 'common/tabs';
import findIndex from 'lodash/findIndex';

interface FrequencyEasyInputProps {
  id: string;
  value: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
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

const StyledTabContainer = styled.div`
  flex-grow: 1;
`;

const StyledCustomContainer = styled.div`
  ${({ theme }) => `
    flex-grow: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20px;
    background-color: ${theme.palette.type === 'light' ? '#eee' : 'rgba(255, 255, 255, 0.12)'};
    border-radius: 50px;
    max-width: 100px;
    min-width: 100px;
    padding: 0px 10px;
  `}
`;

const StyledInput = styled.input`
  ${({ theme }) => `
    border: 0;
    outline: 0;
    text-align: center;
    margin: 0px;
    max-width: 60px;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.75;
    white-space: normal;
    letter-spacing: 0.02857;
    color: ${theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#fff'};
    background-color: transparent;
    ::placeholder {
      color: ${theme.palette.type === 'light' ? '#a8a8a8' : '#a1a1a1'};
    }
  `}
`;

const FrequencyEasyInput = ({ id, onChange, value }: FrequencyEasyInputProps) => {
  const [tabIndex, setTabIndex] = React.useState(findIndex(PREDEFINED_RANGES, { value }));
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
      setTabIndex(-1);
    }
  };

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
          {PREDEFINED_RANGES.map((predefinedRangeOption: SelectOption) => (
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
