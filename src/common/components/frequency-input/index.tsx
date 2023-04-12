import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { STRING_SWAP_INTERVALS } from 'config/constants';
import { useIntl } from 'react-intl';

interface FrequencyInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (newValue: string) => void;
}

const inputRegex = RegExp(/^[0-9]*$/);

const FrequencyInput = ({ id, label, onChange, value, disabled, error }: FrequencyInputProps) => {
  const intl = useIntl();
  const frequencyType = intl.formatMessage(STRING_SWAP_INTERVALS[label as keyof typeof STRING_SWAP_INTERVALS].subject);

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
