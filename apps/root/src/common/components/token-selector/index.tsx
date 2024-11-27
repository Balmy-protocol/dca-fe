import styled from 'styled-components';
import React from 'react';
import find from 'lodash/find';
import { ContainerBox, Select, Skeleton, Typography, colors, SPACING } from 'ui-library';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useActiveWallet from '@hooks/useActiveWallet';
import { Token, TokenListId } from '@types';
import { useWalletBalances } from '@state/balances/hooks';
import useTokenList from '@hooks/useTokenList';
import { formatUnits, isAddress } from 'viem';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { orderBy } from 'lodash';
import useAddCustomTokenToList from '@hooks/useAddCustomTokenToList';
import { useCustomTokens } from '@state/token-lists/hooks';
import { getTokenListId } from '@common/utils/parsing';
import { SelectedTokenSelectorItem, TokenSelectorItem, TokenSelectorOption } from './token-items';

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

export const SkeletonTokenSelectorItem = () => {
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

const searchFunction = ({ token }: TokenSelectorOption, search: string) =>
  token.name.toLowerCase().includes(search.toLowerCase()) ||
  token.symbol.toLowerCase().includes(search.toLowerCase()) ||
  token.address.toLowerCase().includes(search.toLowerCase());

const TokenSelector = ({ handleChange, selectedToken }: TokenSelectorProps) => {
  const activeWallet = useActiveWallet();
  const intl = useIntl();
  const selectedNetwork = useSelectedNetwork();
  const { balances } = useWalletBalances(activeWallet?.address, selectedNetwork.chainId);
  const { addCustomTokenToList, isLoadingCustomToken } = useAddCustomTokenToList();
  const tokens = useTokenList({ chainId: selectedNetwork.chainId, filter: false });
  const customTokens = useCustomTokens(selectedNetwork.chainId);

  const availableTokens = React.useMemo(
    () =>
      Object.keys(balances).map<TokenSelectorOption>((tokenAddress) => ({
        ...balances[tokenAddress],
        key: tokenAddress,
        token: tokens[`${selectedNetwork.chainId}-${tokenAddress.toLowerCase()}` as TokenListId],
      })),
    [balances]
  );

  const items: TokenSelectorOption[] = React.useMemo(() => {
    const parsedWithCustomTokens = availableTokens.map((tokenOption) => {
      const tokenKey = getTokenListId({
        chainId: tokenOption.token.chainId,
        tokenAddress: tokenOption.token.address,
      });

      return {
        ...tokenOption,
        token: {
          ...tokenOption.token,
          isCustomToken: !!customTokens[tokenKey] && !tokens[tokenKey],
        },
      };
    });

    return orderBy(
      parsedWithCustomTokens,
      [({ balanceUsd, token }) => Number(formatUnits(balanceUsd || 0n, token.decimals + 18))],
      ['desc']
    );
  }, [availableTokens, customTokens, tokens]);

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
      void addCustomTokenToList(searchTerm, selectedNetwork.chainId);
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
          RenderItem={TokenSelectorItem}
          RenderSelectedValue={SelectedTokenSelectorItem}
          SkeletonItem={SkeletonTokenSelectorItem}
          isLoading={isLoadingCustomToken}
          onSearchChange={onSearchChange}
          selectedItem={selectedItem}
          onChange={({ token }: TokenSelectorOption) => handleChange(token)}
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
