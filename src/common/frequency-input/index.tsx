import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { SetStateCallback } from 'types';

interface FrequencyInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
}

const inputRegex = RegExp(/^[0-9]*$/);

const FrequencyInput = ({ id, label, onChange, value, disabled, error }: FrequencyInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
    }
  };

  return (
    <TextField
      id={id}
      value={value}
      error={!!error}
      helperText={error}
      placeholder="0"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      type="text"
      margin={'normal'}
      disabled={disabled}
      spellCheck="false"
      onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
      InputProps={{
        endAdornment: <InputAdornment position="end">{label || ''}</InputAdornment>,
      }}
      inputProps={{
        pattern: '^[0-9]*$',
        minLength: 1,
        maxLength: 79,
      }}
    />
  );
};
export default FrequencyInput;
