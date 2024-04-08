import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import styled from 'styled-components';

type Value = string | bigint | number;

interface BaseOption {
  text?: string;
  value: Value;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)<{ $columns: number }>`
  display: inline-grid;
  grid-template-columns: ${({ $columns }) => `repeat(${$columns}, 1fr)`};
`;

interface OptionsButtonsProps {
  activeOption: Value;
  setActiveOption: (newValue: Value) => void;
  options: BaseOption[];
}

const OptionsButtons = ({ options, activeOption, setActiveOption }: OptionsButtonsProps) => {
  const handleSelection = (_event: React.MouseEvent<HTMLElement>, newValue: Value) => {
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
          <Typography variant="body" fontWeight={500}>
            {option.text || option.value.toString()}
          </Typography>
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

export { OptionsButtons, OptionsButtonsProps };
