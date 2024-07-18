import useTokenList from './useTokenList';
import { Token, TokenListId } from 'common-types';
import React from 'react';
import { isAddress } from 'viem';
import { useAppDispatch } from '@state/hooks';
import { fetchTokenDetails } from '@state/token-lists/actions';
import { find } from 'lodash';

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
  return React.useMemo<Token | undefined>(() => {
    const tokenAddress = upperTokenAddress?.toLowerCase();
    if (!tokenAddress) {
      return undefined;
    }

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
    const tokenByAddress = find(tokenList, (token) => token.address === tokenAddress);
    if (tokenByAddress) return tokenByAddress;

    // Try symbol
    if (!checkForSymbol) return;
    const tokenBySymbol = find(tokenList, ({ symbol }) => symbol.toLowerCase() === tokenAddress);

    return tokenBySymbol;
  }, [upperTokenAddress, chainId, checkForSymbol, filterForDca, tokenList]);
}

export default useToken;
