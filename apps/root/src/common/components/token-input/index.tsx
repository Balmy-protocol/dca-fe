import React from 'react';
import styled from 'styled-components';
import { Token } from '@types';
import { FormattedMessage } from 'react-intl';
import { formatUnits } from 'viem';

import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import TokenIcon from '@common/components/token-icon';
import { FilledInput, Typography, FormHelperText, createStyles, Button } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import { formatCurrencyAmount } from '@common/utils/currency';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { getMaxDeduction, getMinAmountForMaxDeduction } from '@constants';

const StyledTokenInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledControls = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
`;

const StyledFilledInput = withStyles(FilledInput, () =>
  createStyles({
    root: {
      paddingLeft: '0px',
      background: 'none !important',
    },
    input: {
      paddingTop: '8px',
      paddingBottom: '0px',
    },
  })
);

const StyledAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledFormControl = styled.div`
  display: flex;
  border-radius: 8px;
  cursor: text;
  align-items: center;
  flex: 1;
`;

const StyledFormControlMinimal = styled.div<{ maxWidth?: string }>`
  display: inline-flex;
  margin: 0px 6px;
  ${({ maxWidth }) => (maxWidth ? `max-width: ${maxWidth};` : '')}
  border-radius: 8px;
  cursor: text;
  align-items: center;
`;

const StyledTokenIconContainer = styled.div`
  padding-top: 6px;
  padding-left: 8px;
`;

const StyledUsdContainer = styled.div`
  display: flex;
  padding-left: 12px;
`;

interface TokenInputProps {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void;
  withBalance?: boolean;
  balance?: bigint;
  token: Token | null;
  error?: string;
  isMinimal?: boolean;
  fullWidth?: boolean;
  withMax?: boolean;
  withHalf?: boolean;
  maxWidth?: string;
  usdValue?: string;
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
  maxWidth,
  usdValue,
}: TokenInputProps) => {
  const inputRef = React.createRef();
  const currentNetwork = useSelectedNetwork();
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
        const minAmountForMaxDeduction = getMinAmountForMaxDeduction(currentNetwork.chainId);
        const maxDeduction = getMaxDeduction(currentNetwork.chainId);
        const maxValue = balance.gte(minAmountForMaxDeduction) ? balance.sub(maxDeduction) : balance;
        onChange(formatUnits(maxValue, token.decimals));
      } else {
        onChange(formatUnits(balance, token.decimals));
      }
    }
  };

  const handleHalfValue = () => {
    if (balance && token) {
      if (token.address === PROTOCOL_TOKEN_ADDRESS) {
        const minAmountForMaxDeduction = getMinAmountForMaxDeduction(currentNetwork.chainId);
        const maxDeduction = getMaxDeduction(currentNetwork.chainId);
        const amounToHalve =
          balance.lte(minAmountForMaxDeduction) && balance.gt(maxDeduction) ? balance.sub(maxDeduction) : balance;

        const halfValue = amounToHalve.div(BigNumber.from(2));

        onChange(formatUnits(halfValue, token.decimals));
      } else {
        onChange(formatUnits(balance.div(BigNumber.from(2)), token.decimals));
      }
    }
  };

  const onFocusInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (inputRef.current as any).focus();
  };

  if (isMinimal) {
    return (
      <StyledFormControlMinimal onClick={onFocusInput} maxWidth={maxWidth}>
        {token && (
          <StyledTokenIconContainer>
            <TokenIcon token={token} />
          </StyledTokenIconContainer>
        )}
        <StyledAmountContainer>
          <StyledFilledInput
            id={id}
            value={value}
            onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
            style={{ width: `calc(${value.length + 1}ch + 25px)` }}
            type="text"
            disableUnderline
            inputProps={{
              style: { paddingTop: usdValue ? '8px' : '0px' },
            }}
          />
          {usdValue && (
            <StyledUsdContainer>
              <Typography variant="caption">${usdValue}</Typography>
            </StyledUsdContainer>
          )}
        </StyledAmountContainer>
      </StyledFormControlMinimal>
    );
  }

  return (
    <StyledTokenInputContainer>
      <StyledControls>
        <StyledFormControl onClick={onFocusInput}>
          {token && (
            <StyledTokenIconContainer>
              <TokenIcon token={token} />
            </StyledTokenIconContainer>
          )}
          <StyledAmountContainer>
            <StyledFilledInput
              id={id}
              value={value}
              error={!!error}
              inputRef={inputRef}
              placeholder="0"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              type="text"
              margin="none"
              disabled={disabled}
              disableUnderline
              spellCheck="false"
              fullWidth={fullWidth}
              onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
              inputProps={{
                style: { paddingBottom: usdValue ? '0px' : '8px' },
              }}
            />
            {usdValue && (
              <StyledUsdContainer>
                <Typography variant="caption">${usdValue}</Typography>
              </StyledUsdContainer>
            )}
          </StyledAmountContainer>
        </StyledFormControl>

        {withMax && (
          <Button color="primary" variant="outlined" size="small" onClick={handleMaxValue}>
            <FormattedMessage description="max" defaultMessage="Max" />
          </Button>
        )}
        {withHalf && (
          <Button color="primary" variant="outlined" size="small" onClick={handleHalfValue}>
            <FormattedMessage description="half" defaultMessage="Half" />
          </Button>
        )}
      </StyledControls>
      {withBalance && token && balance && (
        <FormHelperText id="component-error-text">
          <FormattedMessage
            description="in position"
            defaultMessage="In wallet: {balance} {symbol}"
            values={{
              balance: formatCurrencyAmount(balance, token, 4),
              symbol: token.symbol,
            }}
          />
        </FormHelperText>
      )}
      {!!error && (
        <FormHelperText error id="component-error-text">
          {error}
        </FormHelperText>
      )}
    </StyledTokenInputContainer>
  );
};
export default TokenInput;
