import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from 'common/button';
import { SetStateCallback } from 'types';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';

interface TokenInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void | SetStateCallback<string>;
  withBalance?: boolean;
  isLoadingBalance?: boolean;
  balance?: string;
  error?: string;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

const TokenInput = ({ id, onChange, value, disabled, withBalance, balance, error }: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
    }
  };

  return (
    <>
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
          endAdornment:
            withBalance && balance ? (
              <Button
                color="tertiary"
                variant="contained"
                size="small"
                onClick={() => onChange(balance)}
                style={{ marginBottom: '5px', minWidth: '41px' }}
              >
                <FormattedMessage description="max" defaultMessage="MAX" />
              </Button>
            ) : null,
        }}
        inputProps={{
          pattern: '^[0-9]*[.,]?[0-9]*$',
          minLength: 1,
          maxLength: 79,
        }}
      />
    </>
  );
};
export default TokenInput;
