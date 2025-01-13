import useTokenList from './useTokenList';
import { Token, TokenListId } from 'common-types';
import React from 'react';
import { isAddress } from 'viem';
import { useAppDispatch } from '@state/hooks';
import { fetchTokenDetails } from '@state/token-lists/actions';
import { find } from 'lodash';
import { PROTOCOL_TOKEN } from '@common/mocks/tokens';
import { NETWORKS } from '@constants';
import { useAllBalances } from '@state/balances/hooks';

interface UseTokenProps {
  tokenAddress?: string;
  checkForSymbol?: boolean;
  filterForDca?: boolean;
  chainId?: number;
}
function useToken({
  tokenAddress: upperTokenAddress,
  checkForSymbol = false,
  filterForDca = false,
  chainId,
}: UseTokenProps) {
  const tokenList = useTokenList({ filterForDca, chainId, curateList: true });
  const dispatch = useAppDispatch();
  const { balances } = useAllBalances();

  const isLoadingBalanceChainPrices = React.useMemo(() => {
    if (!chainId) return false;
    return balances[chainId]?.isLoadingChainPrices;
  }, [balances, chainId]);

  const token = React.useMemo<Token | undefined>(() => {
    if (!upperTokenAddress) {
      return undefined;
    }
    const tokenAddress = upperTokenAddress.toLowerCase();

    // Try exact match first (chainId + Address)
    if (chainId && isAddress(tokenAddress)) {
      const tokenListId = `${chainId}-${tokenAddress}` as TokenListId;
      const foundByTokenListId = tokenList[tokenListId];

      if (foundByTokenListId) {
        return foundByTokenListId;
      } else {
        void dispatch(
          fetchTokenDetails({
            tokenAddress,
            chainId,
          })
        );
      }
    }

    // Try address
    const tokenByAddress = find(tokenList, (tokenListToken) => tokenListToken.address === tokenAddress);
    if (tokenByAddress) return tokenByAddress;

    // Try symbol
    if (!checkForSymbol) return;

    const nativeTokenBySymbol = find(
      Object.values(PROTOCOL_TOKEN),
      (protocol) => protocol(chainId || NETWORKS.mainnet.chainId).symbol.toLowerCase() === tokenAddress
    );
    if (nativeTokenBySymbol) return nativeTokenBySymbol(chainId || NETWORKS.mainnet.chainId);

    const erc20TokenBySymbol = find(tokenList, ({ symbol }) => symbol.toLowerCase() === tokenAddress);

    return erc20TokenBySymbol;
  }, [upperTokenAddress, chainId, checkForSymbol, filterForDca, tokenList, isLoadingBalanceChainPrices]);

  const tokenWithPrice = React.useMemo(() => {
    if (!token) return undefined;
    return {
      ...token,
      price: token.price || balances[token.chainId]?.balancesAndPrices[token.address]?.price,
    };
  }, [token, balances]);

  return tokenWithPrice;
}

export default useToken;
