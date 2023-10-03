import React from 'react';
import { Token } from '@types';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { useTokensLists } from '@state/token-lists/hooks';
import useSelectedNetwork from './useSelectedNetwork';

function useTokenListUnfiltered(tokenAddress?: string, filterByLogoUri = false) {
  const currentNetwork = useSelectedNetwork();
  const tokensLists = useTokensLists();

  const tokenList: Token | null = React.useMemo(() => {
    if (!tokenAddress) {
      return null;
    }
    if (tokenAddress === PROTOCOL_TOKEN_ADDRESS) {
      return getProtocolToken(currentNetwork.chainId);
    }

    const lists = orderBy(Object.values(tokensLists), ['priority'], ['desc']);

    // eslint-disable-next-line no-restricted-syntax
    for (const fullList of lists) {
      const foundToken = find(fullList.tokens, { address: tokenAddress });

      if (foundToken && (!filterByLogoUri || foundToken.logoURI)) {
        return foundToken;
      }
    }

    return null;
  }, [currentNetwork.chainId, filterByLogoUri, tokenAddress, tokensLists]);

  return tokenList;
}

export default useTokenListUnfiltered;
