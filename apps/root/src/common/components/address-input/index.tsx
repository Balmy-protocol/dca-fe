import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContentPasteIcon, IconButton, InputAdornment, TextField, TextFieldProps, Tooltip } from 'ui-library';

interface AddressInputProps extends Omit<TextFieldProps, 'onChange'> {
  onChange: (newValue: string) => void;
}

const AddressInput = ({ value, id, placeholder, error, helperText, onChange }: AddressInputProps) => {
  const onPasteAddress = async () => {
    const clipboardValue = await navigator.clipboard.readText();
    onChange(clipboardValue);
  };

  return (
    <TextField
      id={id}
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="off"
      error={error}
      helperText={helperText}
      fullWidth
      type="text"
      spellCheck="false"
      onChange={(e) => onChange(e.target.value)}
      inputProps={{
        pattern: '^0x[A-Fa-f0-9]*$',
        minLength: 1,
        maxLength: 79,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip
              title={<FormattedMessage description="pasteAddress" defaultMessage="Paste address from clipboard" />}
            >
              <IconButton onClick={onPasteAddress}>
                <ContentPasteIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default AddressInput;
