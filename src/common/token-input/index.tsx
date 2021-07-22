import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Button from 'common/button';
import { SetStateCallback, Token } from 'types';
import { FormattedMessage } from 'react-intl';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import Input from '@material-ui/core/Input';

const StyledInput = styled(Input)`
  text-align: center;
`;

const StyledInputContainer = styled.div`
  background-color: #e3e3e3;
  padding: 5px 10px;
  border-radius: 10px;
  display: inline-flex;
  margin: 0px 6px;
`;

interface TokenInputProps {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void | SetStateCallback<string>;
  withBalance?: boolean;
  isLoadingBalance?: boolean;
  balance?: BigNumber;
  token?: Token;
  error?: string;
  isMinimal?: boolean;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

const TokenInput = ({
  id,
  onChange,
  value,
  disabled,
  withBalance,
  balance,
  token,
  error,
  isMinimal,
}: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue);
    }
  };

  return (
    <>
      {isMinimal ? (
        <StyledInputContainer>
          <StyledInput
            id={id}
            value={value}
            onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
            style={{ width: `${value.length + 1}ch` }}
            type="text"
            inputProps={{
              style: { textAlign: 'center' },
            }}
          />
        </StyledInputContainer>
      ) : (
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
              withBalance && balance && token ? (
                <Button
                  color="tertiary"
                  variant="contained"
                  size="small"
                  onClick={() => onChange(formatUnits(balance, token.decimals))}
                  style={{ marginBottom: '8px', minWidth: '41px' }}
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
      )}
    </>
  );
};
export default TokenInput;
