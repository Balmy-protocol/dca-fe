import React from 'react';
import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components';
import isNaN from 'lodash/isNaN';
import isFinite from 'lodash/isFinite';
import { Token } from '@types';
import {
  FilledInput,
  Typography,
  FormHelperText,
  KeyboardArrowDownIcon,
  createStyles,
  Button,
  baseColors,
  colors,
} from 'ui-library';
import { withStyles, makeStyles } from 'tss-react/mui';
import TokenIcon from '@common/components/token-icon';
import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';

const StyledAmountInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledControls = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
`;

const StyledSelectorContainer = styled.div`
  display: flex;
`;

const StyledFirstPartContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledSecondPartContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
`;

const StyledButton = styled(Button)`
  padding: 4px 8px;
  align-self: flex-start;

  .MuiButton-endIcon {
    margin: 0;
  }
  .MuiButton-startIcon {
    margin: 0;
    margin-right: 4px;
  }
`;

const StyledFilledInput = withStyles(FilledInput, () =>
  createStyles({
    root: {
      paddingLeft: '0px',
      background: 'none !important',
    },
    input: {
      paddingTop: '0px',
      paddingBottom: '0px',
      textAlign: 'right',
      paddingRight: '0px',
    },
  })
);

const StyledAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
`;

const StyledFormControl = styled.div`
  display: flex;
  border-radius: 8px;
  cursor: text;
  justify-content: center;
  flex: 1;
  flex-direction: column;
  padding: 10px 20px 10px 10px;
`;

const StyledUsdContainer = styled.div`
  display: flex;
  gap: 5px;
  padding-left: 12px;
`;

const typographyStyles = {
  fontWeight: '400',
  fontSize: '1.25rem',
  lineHeight: '1.6',
};

const useButtonStyles = makeStyles()({
  root: {
    ...typographyStyles,
  },
});

interface AmountInputProps {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (newValue: string) => void;
  token: Token | null;
  error?: string;
  fullWidth?: boolean;
  usdValue?: string;
  onTokenSelect: () => void;
  impact?: string | null | boolean;
  isLoadingPrice?: boolean;
}

const AmountInput = ({
  id,
  onChange,
  value,
  disabled,
  token,
  error,
  fullWidth,
  usdValue,
  onTokenSelect,
  impact,
  isLoadingPrice,
}: AmountInputProps) => {
  const mode = useThemeMode();
  const inputRef = React.createRef();
  const validator = (nextValue: string) => {
    // sanitize value
    const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d{0,${(token && token.decimals) || 18}}$`);

    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      onChange(nextValue.startsWith('.') ? `0${nextValue}` : nextValue);
    }
  };

  const onFocusInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (inputRef.current as any).focus();
  };

  const { classes: buttonClasses } = useButtonStyles();
  return (
    <StyledAmountInputContainer>
      <StyledControls>
        <StyledFormControl onClick={onFocusInput}>
          <Typography variant="h6" component={StyledFirstPartContainer}>
            <StyledSelectorContainer>
              <StyledButton
                size="large"
                color="secondary"
                variant="text"
                startIcon={<TokenIcon size={6} token={token || undefined} />}
                endIcon={<KeyboardArrowDownIcon fontSize="small" />}
                onClick={onTokenSelect}
                classes={buttonClasses}
              >
                {token?.symbol ?? <FormattedMessage description="select" defaultMessage="Select" />}
              </StyledButton>
            </StyledSelectorContainer>
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
                  style: { paddingBottom: usdValue ? '0px' : '8px', ...typographyStyles },
                }}
              />
            </StyledAmountContainer>
          </Typography>
          <StyledSecondPartContainer>
            <Typography variant="bodySmall">{token?.name}</Typography>
            <StyledUsdContainer>
              {isUndefined(usdValue) &&
                !isLoadingPrice &&
                !!value &&
                value !== '0' &&
                value !== '...' &&
                Number(value) !== 0 && (
                  <Typography variant="bodySmall">
                    <FormattedMessage description="unkown" defaultMessage="Unknown price" />
                  </Typography>
                )}
              {!isUndefined(usdValue) && (
                <>
                  <Typography variant="bodySmall">${usdValue}</Typography>
                  {impact && !isNaN(impact) && isFinite(Number(impact)) && (
                    <Typography
                      variant="bodySmall"
                      color={
                        // eslint-disable-next-line no-nested-ternary
                        Number(impact) < -2.5
                          ? colors[mode].semantic.error.primary
                          : Number(impact) > 0
                          ? colors[mode].semantic.success.primary
                          : baseColors.disabledText
                      }
                    >
                      ({Number(impact) > 0 ? '+' : ''}
                      {impact}%)
                    </Typography>
                  )}
                </>
              )}
            </StyledUsdContainer>
          </StyledSecondPartContainer>
        </StyledFormControl>
      </StyledControls>
      {!!error && (
        <FormHelperText error id="component-error-text">
          {error}
        </FormHelperText>
      )}
    </StyledAmountInputContainer>
  );
};
export default AmountInput;
