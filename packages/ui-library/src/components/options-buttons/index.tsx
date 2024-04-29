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
  width: max-content;
`;

interface OptionsButtonsProps {
  activeOption: Value;
  setActiveOption: (newValue: Value) => void;
  options: BaseOption[];
  size?: 'small' | 'medium';
}

const OptionsButtons = ({ options, activeOption, setActiveOption, size = 'medium' }: OptionsButtonsProps) => {
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
        <ToggleButton
          key={option.value}
          value={option.value}
          aria-label={`option-${option.value}`}
          sx={{ minWidth: '95px', minHeight: '56px' }}
        >
          <Typography variant={size === 'medium' ? 'bodyRegular' : 'bodySmallRegular'}>
            {option.text || option.value.toString()}
          </Typography>
        </ToggleButton>
      ))}
    </StyledToggleButtonGroup>
  );
};

export { OptionsButtons, OptionsButtonsProps };
