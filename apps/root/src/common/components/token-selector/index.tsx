import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { Chip, ContainerBox, Select, Typography, colors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { formatCurrencyAmount } from '@common/utils/currency';
import useActiveWallet from '@hooks/useActiveWallet';
import { Token } from '@types';
import { TokenBalance, useWalletBalances } from '@state/balances/hooks';
import useTokenList from '@hooks/useTokenList';
import { formatUnits } from 'viem';
import { useThemeMode } from '@state/config/hooks';
import { defineMessage, useIntl } from 'react-intl';

interface TokenSelectorProps {
  handleChange: (token: Token) => void;
  selectedToken?: Nullable<Token>;
}

const StyledNetworkContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const StyledNetworkButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

type OptionWithKeyAndToken = TokenBalance & { key: string; token: Token };

const TokenItem = ({ item: { token, balance, balanceUsd, key } }: { item: OptionWithKeyAndToken }) => {
  const mode = useThemeMode();

  return (
    <ContainerBox alignItems="center" key={key} flex={1} gap={3}>
      <TokenIcon size={7} token={token} />
      <ContainerBox flexDirection="column" flex="1">
        <Typography variant="body" fontWeight={600} color={colors[mode].typography.typo2}>
          {token.name}
        </Typography>
        <Typography variant="bodySmall" color={colors[mode].typography.typo3}>
          {formatCurrencyAmount(balance, token)}
          {` `}
          {token.symbol}
        </Typography>
      </ContainerBox>
      {!!balanceUsd && (
        <Chip size="small" label={`$${parseFloat(formatUnits(balanceUsd, token.decimals + 18)).toFixed(2)}`} />
      )}
    </ContainerBox>
  );
};

const searchFunction = ({ token }: OptionWithKeyAndToken, search: string) =>
  token.name.toLowerCase().includes(search.toLowerCase()) ||
  token.symbol.toLowerCase().includes(search.toLowerCase()) ||
  token.address.toLowerCase().includes(search.toLowerCase());

const TokenSelector = ({ handleChange, selectedToken }: TokenSelectorProps) => {
  const activeWallet = useActiveWallet();
  const intl = useIntl();
  const selectedNetwork = useSelectedNetwork();
  const { balances } = useWalletBalances(activeWallet?.address, selectedNetwork.chainId);

  const tokens = useTokenList({ allowAllTokens: true, filterChainId: true, filter: false });

  const availableTokens = React.useMemo(
    () =>
      Object.keys(balances).map<OptionWithKeyAndToken>((tokenAddress) => ({
        ...balances[tokenAddress],
        key: tokenAddress,
        token: tokens[tokenAddress],
      })),
    [balances]
  );

  const selectedItem = React.useMemo(
    () => find(availableTokens, (token) => token.token.address.toLowerCase() === selectedToken?.address.toLowerCase()),
    [selectedToken, availableTokens]
  );

  return (
    <StyledNetworkContainer>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-token"
          options={availableTokens}
          placeholder={intl.formatMessage(
            defineMessage({ defaultMessage: 'Select a token to transfer', description: 'SelectTokenToTransfer' })
          )}
          RenderItem={TokenItem}
          selectedItem={selectedItem}
          onChange={(item: OptionWithKeyAndToken) => handleChange(item.token)}
          disabledSearch={false}
          searchFunction={searchFunction}
        />
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default TokenSelector;
