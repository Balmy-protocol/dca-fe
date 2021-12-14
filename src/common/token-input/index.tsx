import React from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import Button from 'common/button';
import { SetStateCallback, Token } from 'types';
import { FormattedMessage } from 'react-intl';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import Input from '@material-ui/core/Input';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';

const StyledInput = styled(Input)`
  text-align: center;
`;

const StyledInputContainer = styled.div`
  ${({ theme }) => `
    background-color: ${theme.palette.type === 'light' ? '#e3e3e3' : 'rgba(255, 255, 255, 0.12)'};
    padding: 5px 10px;
    border-radius: 10px;
    display: inline-flex;
    margin: 0px 6px;
  `}
`;

interface TokenInputProps {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void | SetStateCallback<string>;
  withBalance?: boolean;
  balance?: BigNumber;
  token: Token;
  error?: string;
  isMinimal?: boolean;
  fullWidth?: boolean;
}

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
  fullWidth,
}: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d{0,${token.decimals}}$`);

    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue.startsWith('.') ? `0${nextValue}` : nextValue);
    }
  };

  const handleMaxValue = () => {
    if (balance && token) {
      if (token.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue = balance.gte(parseUnits('1', token.decimals))
          ? balance.sub(parseUnits('0.1', token.decimals))
          : balance;
        onChange(formatUnits(maxValue, token.decimals));
      } else {
        onChange(formatUnits(balance, token.decimals));
      }
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
          margin="normal"
          disabled={disabled}
          spellCheck="false"
          fullWidth={fullWidth}
          onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
          InputProps={{
            endAdornment:
              withBalance && balance && token ? (
                <Button
                  color="tertiary"
                  variant="contained"
                  size="small"
                  onClick={handleMaxValue}
                  style={{ marginBottom: '8px', minWidth: '41px' }}
                >
                  <FormattedMessage description="max" defaultMessage="MAX" />
                </Button>
              ) : null,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
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
