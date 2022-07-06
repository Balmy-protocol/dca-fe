import React from 'react';
import { Token } from 'types';
import find from 'lodash/find';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenListUnfiltered(tokenAddress?: string) {
  const currentNetwork = useCurrentNetwork();
  const tokensLists = useTokensLists();

  const tokenList: Token | null = React.useMemo(() => {
    if (!tokenAddress) {
      return null;
    }
    if (tokenAddress === PROTOCOL_TOKEN_ADDRESS) {
      return getProtocolToken(currentNetwork.chainId);
    }

    const lists = Object.keys(tokensLists);

    // eslint-disable-next-line no-restricted-syntax
    for (const list of lists) {
      const fullList = tokensLists[list];

      const foundToken = find(fullList.tokens, { address: tokenAddress });

      if (foundToken) {
        return foundToken;
      }
    }

    return null;
  }, [currentNetwork.chainId, tokenAddress]);

  return tokenList;
}

export default useTokenListUnfiltered;
