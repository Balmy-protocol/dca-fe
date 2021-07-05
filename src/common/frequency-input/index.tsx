import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { SetStateCallback } from 'types';
import { roundTextFieldStylesHook } from '@mui-treasury/styles/textField/round';

interface TokenInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void | SetStateCallback<string>;
}

const inputRegex = RegExp(/^[1-9]+[0-9]*$/);

const Swap = ({ id, label, onChange, value, disabled }: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
    }
  };

  const inputBaseStyles = roundTextFieldStylesHook.useInputBase();
  const inputLabelStyles = roundTextFieldStylesHook.useInputLabel();
  const helperTextStyles = roundTextFieldStylesHook.useHelperText();

  // suppress MUI warnings
  if (inputBaseStyles.adornedEnd) {
    delete inputBaseStyles.adornedEnd;
  }
  if (inputBaseStyles.adornedStart) {
    delete inputBaseStyles.adornedStart;
  }

  return (
    <TextField
      id={id}
      value={value}
      placeholder="0"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      type="text"
      margin={'normal'}
      disabled={disabled}
      spellCheck="false"
      onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
      InputLabelProps={{ shrink: true, classes: inputLabelStyles }}
      InputProps={{
        classes: inputBaseStyles,
        disableUnderline: true,
        endAdornment: <InputAdornment position="end">{label || ''}</InputAdornment>,
        fullWidth: false,
      }}
      inputProps={{
        pattern: '^[0-9]*[.,]?[0-9]*$',
        minLength: 1,
        maxLength: 79,
      }}
      FormHelperTextProps={{ classes: helperTextStyles }}
    />
  );
};
export default Swap;
