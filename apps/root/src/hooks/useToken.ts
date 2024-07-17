import findIndex from 'lodash/findIndex';
import useTokenList from './useTokenList';
import findKey from 'lodash/findKey';
import { Token, TokenListId } from 'common-types';
import React from 'react';
import { isAddress } from 'viem';
import { useAppDispatch } from '@state/hooks';
import { fetchTokenDetails } from '@state/token-lists/actions';

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
      const foundByTokenListId = chainId && tokenList[tokenListId];

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
    const key = findKey(tokenList, (token) => token.address === tokenAddress) as TokenListId;

    const foundToken = tokenList[key];
    if (foundToken) {
      return foundToken;
    }

    // Try symbol
    if (!checkForSymbol) return;
    const tokenValues = Object.values(tokenList);
    const index = findIndex(tokenValues, ({ symbol }) => symbol.toLowerCase() === tokenAddress);

    return tokenValues[index];
  }, [upperTokenAddress, chainId, checkForSymbol, filterForDca, tokenList]);
}

export default useToken;
