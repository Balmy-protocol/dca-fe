import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import styled from 'styled-components';

interface BaseOption {
  text?: string;
  value: string;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)<{ $columns: number }>`
  display: inline-grid;
  grid-template-columns: ${({ $columns }) => '1fr '.repeat($columns)};
  align-self: flex-start;
`;

interface OptionsButtonsProps<Option extends BaseOption> {
  activeOption: Option['value'];
  setActiveOption: (newValue: Option['value']) => void;
  options: Option[];
}

const OptionsButtons = <Option extends BaseOption = BaseOption>({
  options,
  activeOption,
  setActiveOption,
}: OptionsButtonsProps<Option>) => {
  const handleSelection = (_event: React.MouseEvent<HTMLElement>, newValue: Option['value']) => {
    if (newValue) {
      setActiveOption(newValue);
    }
  };

  return (
    <StyledToggleButtonGroup
      $columns={options.length}
      value={activeOption}
      exclusive
      onChange={handleSelection}
      aria-label="options-buttons"
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value} aria-label={`option-${option.value}`}>
          <Typography variant="body">{option.text || option.value}</Typography>
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

export { OptionsButtons, OptionsButtonsProps };
