import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface Option {
  text?: string;
  value: string;
}

interface OptionsButtonsProps {
  activeOption: Option;
  setActiveOption: (newValue: Option) => void;
  options: Option[];
}

const OptionsButtons = ({ options, activeOption, setActiveOption }: OptionsButtonsProps) => {
  const handleSelection = (_event: React.MouseEvent<HTMLElement>, newValue: Option['value']) => {
    const selectedOption = options.find((option) => option.value === newValue);
    if (selectedOption) {
      setActiveOption(selectedOption);
    }
  };

  return (
    <ToggleButtonGroup value={activeOption.value} exclusive onChange={handleSelection} aria-label="options-buttons">
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value} aria-label={`option-${option.value}`}>
          <Typography variant="body">{option.text || option.value}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export { OptionsButtons, OptionsButtonsProps };
