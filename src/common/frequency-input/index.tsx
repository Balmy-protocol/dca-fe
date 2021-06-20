import React from 'react';
import TextField from '@material-ui/core/TextField';
import { SetFromToValueState } from 'home/swap-container/SwapContext';

interface TokenInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void | SetFromToValueState;
}

const inputRegex = RegExp(`^[1-9]\d*$`);

const Swap = ({ id, label, onChange, value, disabled }: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
    }
  };

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      variant="filled"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      type="text"
      placeholder="1"
      fullWidth
      disabled={disabled}
      inputProps={{
        pattern: '^[0-9]*[.,]?[0-9]*$',
        minLength: 1,
        maxLength: 79,
      }}
      spellCheck="false"
      onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
    />
  );
};
export default Swap;
