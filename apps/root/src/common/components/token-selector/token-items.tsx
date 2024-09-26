import React from 'react';
import { Token } from 'common-types';
import { TokenBalance } from '@state/balances/hooks';
import { BalanceToken } from '@hooks/useMergedTokensBalances';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { baseColors, Chip, colors, ContainerBox, Skeleton, Typography } from 'ui-library';
import TokenIconMultichain from '@pages/home/components/token-icon-multichain';
import TokenIcon from '../token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { formatUnits } from 'viem';
import styled from 'styled-components';

const StyledTokenSelectorItemContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  flex: 1,
  gap: 1,
})``;

const StyledTokenSelectorContent = styled(ContainerBox).attrs({
  alignItems: 'center',
  flex: 1,
  gap: 3,
})``;

const CustomTokenChip = () => (
  <Typography variant="bodyBold" color={baseColors.disabledText}>
    <Chip
      color="warning"
      size="medium"
      label={
        <FormattedMessage
          id="customTokenWarning"
          defaultMessage="This is a custom token you are importing, trade at your own risk."
        />
      }
    />
  </Typography>
);

export const BalanceUsdChip = ({
  balanceUsd,
  intl,
  isLoading,
}: {
  balanceUsd: string | number;
  intl: IntlShape;
  isLoading?: boolean;
}) => (
  <Chip
    size="small"
    color="primary"
    variant="outlined"
    label={
      isLoading ? (
        <Skeleton animation="wave" variant="text" width="4ch" />
      ) : (
        <Typography variant="bodyBold">${formatUsdAmount({ amount: balanceUsd, intl })}</Typography>
      )
    }
  />
);

type TokenWithCustom = Token & { isCustomToken?: boolean };
export type TokenSelectorOption = TokenBalance & {
  key: string;
  token: TokenWithCustom;
  multichainBalances?: BalanceToken[];
};

export const TokenSelectorItem = ({
  item: { token, balance, balanceUsd, key, multichainBalances },
}: {
  item: TokenSelectorOption;
}) => {
  const mode = useThemeMode();
  const intl = useIntl();

  return (
    <StyledTokenSelectorItemContainer key={key}>
      <StyledTokenSelectorContent>
        {multichainBalances && multichainBalances.length > 0 ? (
          <TokenIconMultichain balanceTokens={multichainBalances} withShadow />
        ) : (
          <TokenIcon size={8} token={token} withShadow />
        )}
        <ContainerBox flexDirection="column" flex="1">
          <Typography variant="bodySmallBold" color={colors[mode].typography.typo2}>
            {token.name}
          </Typography>
          <Typography variant="labelRegular">
            {!!balance ? `${formatCurrencyAmount({ amount: balance, token, intl })} ` : ''}
            {token.symbol}
          </Typography>
        </ContainerBox>
        {!!balanceUsd && <BalanceUsdChip balanceUsd={formatUnits(balanceUsd, token.decimals + 18)} intl={intl} />}
      </StyledTokenSelectorContent>
      {token.isCustomToken && <CustomTokenChip />}
    </StyledTokenSelectorItemContainer>
  );
};

export const SelectedTokenSelectorItem = ({
  item: { token, balance, balanceUsd, key, multichainBalances },
}: {
  item: TokenSelectorOption;
}) => {
  const mode = useThemeMode();
  const intl = useIntl();

  return (
    <StyledTokenSelectorItemContainer key={key}>
      <StyledTokenSelectorContent>
        {multichainBalances && multichainBalances.length > 0 ? (
          <TokenIconMultichain balanceTokens={multichainBalances} />
        ) : (
          <TokenIcon size={6} token={token} />
        )}
        <ContainerBox flexDirection="column" flex="1">
          <Typography variant="bodySemibold" color={colors[mode].typography.typo1}>
            {token.name}
          </Typography>
          <Typography variant="bodySmallRegular">
            {!!balance ? `${formatCurrencyAmount({ amount: balance, token, intl })} ` : ''}
            {token.symbol}
          </Typography>
        </ContainerBox>
        {!!balanceUsd && <BalanceUsdChip balanceUsd={formatUnits(balanceUsd, token.decimals + 18)} intl={intl} />}
      </StyledTokenSelectorContent>
      {token.isCustomToken && <CustomTokenChip />}
    </StyledTokenSelectorItemContainer>
  );
};
