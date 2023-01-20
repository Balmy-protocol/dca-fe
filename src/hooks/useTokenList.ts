import React from 'react';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import keyBy from 'lodash/keyBy';
import { ALLOWED_YIELDS, TOKEN_BLACKLIST } from 'config/constants';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenList(filter = true) {
  const currentNetwork = useCurrentNetwork();
  const tokensLists = useTokensLists();
  const savedTokenLists = ['Mean Finance Graph Allowed Tokens'];
  const reducedYieldTokens = React.useMemo(
    () =>
      ALLOWED_YIELDS[currentNetwork.chainId].reduce(
        (acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()],
        []
      ),
    [currentNetwork.chainId]
  );

  const tokenList: TokenList = React.useMemo(
    () =>
      reduce(
        tokensLists,
        (acc, tokensList, key) =>
          !filter || savedTokenLists.includes(key)
            ? {
                ...acc,
                ...keyBy(
                  tokensList.tokens.filter(
                    (token) =>
                      token.chainId === currentNetwork.chainId &&
                      !Object.keys(acc).includes(token.address) &&
                      !reducedYieldTokens.includes(token.address) &&
                      (!filter || !TOKEN_BLACKLIST.includes(token.address))
                  ),
                  'address'
                ),
              }
            : acc,
        { [PROTOCOL_TOKEN_ADDRESS]: getProtocolToken(currentNetwork.chainId) }
      ),
    [currentNetwork.chainId, savedTokenLists, reducedYieldTokens]
  );

  return tokenList;
}

export default useTokenList;
