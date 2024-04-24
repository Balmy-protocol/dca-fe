import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import {
  Typography,
  FormHelperText,
  Button,
  ContainerBox,
  TokenPickerButton,
  colors,
  EmptyWalletIcon,
  Skeleton,
  FormControl,
  InputContainer,
  Input,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { amountValidator, emptyTokenWithAddress } from '@common/utils/currency';

import { AmountsOfToken, Token } from '@types';
import { getMaxDeduction, getMinAmountForMaxDeduction } from '@constants';
import { formatUnits } from 'viem';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import TokenIcon from '../token-icon';
import { useThemeMode } from '@state/config/hooks';
import { buildTypographyVariant } from 'ui-library/src/theme/typography';
import { SPACING } from 'ui-library/src/theme/constants';

const StyledInputContainer = styled(InputContainer)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(5)};
  `}
`;

type TokenAmountInputProps = {
  id: string;
  label: React.ReactNode;
  cantFund?: boolean;
  balance?: AmountsOfToken;
  tokenAmount: AmountsOfToken;
  isLoadingRoute?: boolean;
  isLoadingBalance?: boolean;
  selectedToken?: Token;
  startSelectingCoin: (newToken: Token) => void;
  onSetTokenAmount: (newAmount: string) => void;
  maxBalanceBtn?: boolean;
  priceImpact?: string;
};

const TokenAmountInput = ({
  id,
  label,
  cantFund,
  balance,
  tokenAmount,
  isLoadingRoute,
  isLoadingBalance,
  selectedToken,
  onSetTokenAmount,
  startSelectingCoin,
  maxBalanceBtn,
  priceImpact,
}: TokenAmountInputProps) => {
  const mode = useThemeMode();
  const [isFocused, setIsFocused] = React.useState(false);
  const onSetMaxBalance = () => {
    if (balance && selectedToken) {
      if (selectedToken.address === PROTOCOL_TOKEN_ADDRESS) {
        const maxValue =
          BigInt(balance.amount) >= getMinAmountForMaxDeduction(selectedToken.chainId)
            ? BigInt(balance.amount) - getMaxDeduction(selectedToken.chainId)
            : BigInt(balance.amount);
        onSetTokenAmount(formatUnits(maxValue, selectedToken.decimals));
      } else {
        onSetTokenAmount(formatUnits(BigInt(balance.amount), selectedToken.decimals));
      }
    }
  };

  const token =
    (selectedToken && {
      ...selectedToken,
      icon: <TokenIcon token={selectedToken} />,
    }) ||
    undefined;

  return (
    <StyledInputContainer disabled={isLoadingRoute} isFocused={isFocused} flexDirection="column" gap={2}>
      <ContainerBox>
        <ContainerBox flexDirection="column" gap={2} alignItems="flex-start" justifyContent="center">
          <Typography variant="body1">{label}</Typography>
          <TokenPickerButton
            disabled={isLoadingRoute}
            token={token}
            showAction
            onClick={() => startSelectingCoin(selectedToken || emptyTokenWithAddress('token'))}
          />
          {!isUndefined(balance) && token && (
            <ContainerBox alignItems="center" gap={1}>
              <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
                <EmptyWalletIcon />
              </Typography>
              <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
                {isLoadingBalance ? (
                  <Skeleton variant="text" sx={{ minWidth: '10ch' }} />
                ) : (
                  <>
                    {balance.amountInUnits}
                    {balance.amountInUSD && ` / ≈$${balance.amountInUSD}`}
                  </>
                )}
              </Typography>
            </ContainerBox>
          )}
        </ContainerBox>
        <ContainerBox flexDirection="column" flex="1" alignItems="flex-end">
          {maxBalanceBtn && !isUndefined(balance) && selectedToken && (
            <Button
              onClick={onSetMaxBalance}
              disabled={isLoadingRoute}
              variant="text"
              sx={{ padding: 0, minWidth: '10px', marginTop: SPACING(2) }}
            >
              <FormattedMessage description="maxWallet" defaultMessage="Max" />
            </Button>
          )}
          <ContainerBox flexDirection="column" flex="1" alignItems="flex-end" justifyContent="center">
            <FormControl variant="standard" fullWidth>
              <Input
                id={id}
                onChange={(evt) =>
                  amountValidator({
                    onChange: onSetTokenAmount,
                    nextValue: evt.target.value,
                    decimals: token?.decimals || 18,
                  })
                }
                value={tokenAmount.amountInUnits}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
                placeholder="0"
                disableUnderline
                inputProps={{
                  style: {
                    textAlign: 'right',
                    height: 'auto',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  },
                }}
                sx={{
                  ...buildTypographyVariant(mode).h3,
                  fontWeight: '700',
                  color: 'inherit',
                  textAlign: 'right',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              />
            </FormControl>
            <ContainerBox gap={1}>
              <Typography variant="bodyRegular">{` $${Number(tokenAmount.amountInUSD).toFixed(2) || '0'}`}</Typography>
              {priceImpact &&
                !isNaN(Number(priceImpact)) &&
                isFinite(Number(priceImpact)) &&
                tokenAmount.amountInUnits !== '...' && (
                  <Typography
                    variant="bodyRegular"
                    color={
                      // eslint-disable-next-line no-nested-ternary
                      Number(priceImpact) < -2.5
                        ? colors[mode].semantic.error.darker
                        : Number(priceImpact) > 0
                        ? colors[mode].semantic.success.darker
                        : 'inherit'
                    }
                  >
                    {` `}({Number(priceImpact) > 0 ? '+' : ''}
                    {priceImpact}%)
                  </Typography>
                )}
            </ContainerBox>
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
      {!!cantFund && (
        <FormHelperText error id="component-error-text">
          <FormattedMessage description="cantFund" defaultMessage="Amount cannot exceed balance" />
        </FormHelperText>
      )}
    </StyledInputContainer>
  );
};

export default TokenAmountInput;
