import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { Chip, ContainerBox, Select, Skeleton, Typography, baseColors, colors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import useActiveWallet from '@hooks/useActiveWallet';
import { Token, TokenListId } from '@types';
import { TokenBalance, useWalletBalances } from '@state/balances/hooks';
import useTokenList from '@hooks/useTokenList';
import { formatUnits, isAddress } from 'viem';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { orderBy } from 'lodash';
import { SPACING } from 'ui-library/src/theme/constants';
import useHandleCustomTokenBalances from '@hooks/useHandleCustomTokenBalances';
import { useCustomTokens } from '@state/token-lists/hooks';

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

type TokenWithCustom = Token & { isCustomToken?: boolean };
type OptionWithKeyAndToken = TokenBalance & { key: string; token: TokenWithCustom };

const TokenItem = ({ item: { token, balance, balanceUsd, key } }: { item: OptionWithKeyAndToken }) => {
  const mode = useThemeMode();
  const intl = useIntl();

  return (
    <ContainerBox flexDirection="column" gap={1}>
      <ContainerBox alignItems="center" key={key} flex={1} gap={3}>
        <TokenIcon size={7} token={token} />
        <ContainerBox flexDirection="column" flex="1">
          <Typography variant="bodyBold" color={colors[mode].typography.typo2}>
            {token.name}
          </Typography>
          <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
            {formatCurrencyAmount({ amount: balance, token, intl })}
            {` `}
            {token.symbol}
          </Typography>
        </ContainerBox>
        {!!balanceUsd && (
          <Chip
            size="small"
            label={
              <Typography variant="bodySemibold">
                ${formatUsdAmount({ amount: formatUnits(balanceUsd, token.decimals + 18), intl })}
              </Typography>
            }
          />
        )}
      </ContainerBox>
      {token.isCustomToken && (
        <Typography variant="bodyBold" color={baseColors.disabledText}>
          <Chip
            color="warning"
            size="medium"
            label={intl.formatMessage(
              defineMessage({
                description: 'customTokenWarning',
                defaultMessage: 'This is a custom token you are importing, trade at your own risk.',
              })
            )}
          />
        </Typography>
      )}
    </ContainerBox>
  );
};

const SkeletonTokenItem = () => {
  const mode = useThemeMode();

  return (
    <ContainerBox alignItems="center" flex={1} gap={3}>
      <Skeleton variant="circular" height={SPACING(7)} width={SPACING(7)} />
      <ContainerBox flexDirection="column" flex="1">
        <Typography variant="bodyBold" color={colors[mode].typography.typo2}>
          <Skeleton variant="text" width="7ch" />
        </Typography>
        <Typography variant="bodySmallRegular" color={colors[mode].typography.typo3}>
          <Skeleton variant="text" width="10ch" />
          {` `}
          <Skeleton variant="text" width="5ch" />
        </Typography>
      </ContainerBox>
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
  const { handleCustomTokenBalances, isLoadingCustomToken } = useHandleCustomTokenBalances();
  const tokens = useTokenList({ chainId: selectedNetwork.chainId, filter: false });
  const customTokens = useCustomTokens(selectedNetwork.chainId);

  const availableTokens = React.useMemo(
    () =>
      Object.keys(balances).map<OptionWithKeyAndToken>((tokenAddress) => ({
        ...balances[tokenAddress],
        key: tokenAddress,
        token: tokens[`${selectedNetwork.chainId}-${tokenAddress.toLowerCase()}` as TokenListId],
      })),
    [balances]
  );

  const items: OptionWithKeyAndToken[] = React.useMemo(() => {
    const parsedWithCustomTokens = availableTokens.map((tokenOption) => ({
      ...tokenOption,
      token: {
        ...tokenOption.token,
        isCustomToken:
          !!customTokens[`${tokenOption.token.chainId}-${tokenOption.token.address.toLowerCase()}` as TokenListId],
      },
    }));

    return orderBy(
      parsedWithCustomTokens,
      [({ balanceUsd, token }) => parseFloat(formatUnits(balanceUsd || 0n, token.decimals + 18))],
      ['desc']
    );
  }, [availableTokens, customTokens]);

  const selectedItem = React.useMemo(
    () => find(items, (token) => token.token.address.toLowerCase() === selectedToken?.address.toLowerCase()),
    [selectedToken, items]
  );

  const onSearchChange = (searchTerm: string) => {
    if (
      searchTerm &&
      isAddress(searchTerm) &&
      !tokens[`${selectedNetwork.chainId}-${searchTerm.toLowerCase()}` as TokenListId]
    ) {
      void handleCustomTokenBalances({ tokenAddress: searchTerm, chainId: selectedNetwork.chainId });
    }
  };

  return (
    <StyledNetworkContainer>
      <StyledNetworkButtonsContainer>
        <Select
          id="choose-token"
          options={items}
          placeholder={intl.formatMessage(
            defineMessage({ defaultMessage: 'Select a token to transfer', description: 'SelectTokenToTransfer' })
          )}
          RenderItem={TokenItem}
          SkeletonItem={SkeletonTokenItem}
          isLoading={isLoadingCustomToken}
          onSearchChange={onSearchChange}
          selectedItem={selectedItem}
          onChange={(item: OptionWithKeyAndToken) => handleChange(item.token)}
          disabledSearch={false}
          searchFunction={searchFunction}
          emptyOption={
            <FormattedMessage defaultMessage="You have no tokens in this network" description="NoTokensInchain" />
          }
        />
      </StyledNetworkButtonsContainer>
    </StyledNetworkContainer>
  );
};

export default TokenSelector;
