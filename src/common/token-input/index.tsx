import React from 'react';
import styled from 'styled-components';
import TextField from '@mui/material/TextField';
import Button from 'common/button';
import { Token } from 'types';
import { FormattedMessage } from 'react-intl';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import Input from '@mui/material/Input';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import TokenIcon from 'common/token-icon';
import { createStyles, FilledInput } from '@mui/material';
import { withStyles } from '@mui/styles';

const StyledInput = styled(Input)`
  text-align: center;
`;

const StyledInputContainer = styled.div`
  ${({ theme }) => `
    background-color: ${theme.palette.mode === 'light' ? '#e3e3e3' : 'rgba(255, 255, 255, 0.12)'};
    padding: 5px 10px;
    border-radius: 10px;
    display: inline-flex;
    margin: 0px 6px;
  `}
`;

const StyledTokenInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledControls = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
`;

const StyledFilledInput = withStyles(() =>
  createStyles({
    root: {
      paddingLeft: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
)(FilledInput);

interface TokenInputProps {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => any;
  withBalance?: boolean;
  balance?: BigNumber;
  token: Token | null;
  error?: string;
  isMinimal?: boolean;
  fullWidth?: boolean;
  withMax?: boolean;
  withHalf?: boolean;
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
  withHalf,
  withMax,
}: TokenInputProps) => {
  const validator = (nextValue: string) => {
    // sanitize value
    const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d{0,${(token && token.decimals) || 18}}$`);

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

  const handleHalfValue = () => {
    if (balance && token) {
      if (token.address === PROTOCOL_TOKEN_ADDRESS) {
        const halfValue = balance.gte(parseUnits('1', token.decimals))
          ? balance.sub(parseUnits('0.1', token.decimals))
          : balance.div(BigNumber.from(2));
        onChange(formatUnits(halfValue, token.decimals));
      } else {
        onChange(formatUnits(balance.div(BigNumber.from(2)), token.decimals));
      }
    }
  };

  if (isMinimal) {
    return (
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
    )
  }

  return (
    <StyledTokenInputContainer>
      <StyledControls>
        <StyledFilledInput
          id={id}
          value={value}
          error={!!error}
          placeholder="0"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          type="text"
          margin="none"
          disabled={disabled}
          spellCheck="false"
          fullWidth={fullWidth}
          onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
          startAdornment={
            token && (
              <InputAdornment position="start">
                <TokenIcon token={token} />
              </InputAdornment>
            )
          }
        />

        { withMax && (
          <Button
            color="default"
            variant="outlined"
            size="small"
            onClick={handleMaxValue}
          >
            <FormattedMessage description="max" defaultMessage="Max" />
          </Button>
        )}
        { withHalf && (
          <Button
            color="default"
            variant="outlined"
            size="small"
            onClick={handleHalfValue}
          >
            <FormattedMessage description="half" defaultMessage="Half" />
          </Button>
        )}
      </StyledControls>
      {!!error && <FormHelperText error id="component-error-text">{error}</FormHelperText>}
    </StyledTokenInputContainer>
  );
};
export default TokenInput;
