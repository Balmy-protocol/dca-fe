import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { STRING_SWAP_INTERVALS } from 'config/constants';

interface FrequencyInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (newValue: string) => any;
}

const inputRegex = RegExp(/^[0-9]*$/);

const FrequencyInput = ({ id, label, onChange, value, disabled, error }: FrequencyInputProps) => {
  const frequencyType = STRING_SWAP_INTERVALS[label as keyof typeof STRING_SWAP_INTERVALS].subject;

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
      fullWidth
      type="text"
      margin="normal"
      disabled={disabled}
      spellCheck="false"
      onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
      InputProps={{
        endAdornment: <InputAdornment position="end">{frequencyType || ''}</InputAdornment>,
      }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      inputProps={{
        pattern: '^[0-9]*$',
        minLength: 1,
        maxLength: 79,
      }}
    />
  );
};
export default FrequencyInput;
