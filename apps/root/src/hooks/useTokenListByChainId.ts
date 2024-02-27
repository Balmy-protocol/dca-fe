import React from 'react';
import { TokenListByChainId, TokenListId } from '@types';
import toPairs from 'lodash/toPairs';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { DCA_TOKEN_BLACKLIST, TOKEN_BLACKLIST } from '@constants';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS, TOKEN_MAP_SYMBOL } from '@common/mocks/tokens';
import { useSavedAllTokenLists, useTokensLists } from '@state/token-lists/hooks';

function useTokenListByChainId({ filter = false } = {}) {
  const tokensLists = useTokensLists();
  const savedAllTokenLists = useSavedAllTokenLists();

  const tokenListByChainId: TokenListByChainId = React.useMemo(() => {
    const filteredLists = orderBy(
      compact(toPairs(tokensLists).map(([key, list]) => (!filter || savedAllTokenLists.includes(key) ? list : null))),
      ['priority'],
      ['desc']
    );

    return filteredLists.reduce<TokenListByChainId>((acc, tokensList) => {
      const newAcc = { ...acc };

      tokensList.tokens.forEach((token) => {
        if (!filter || !(savedAllTokenLists ? TOKEN_BLACKLIST : DCA_TOKEN_BLACKLIST).includes(token.address)) {
          const { chainId } = token;
          if (!newAcc[chainId]) {
            newAcc[chainId] = {
              [PROTOCOL_TOKEN_ADDRESS]: getProtocolToken(chainId),
            };
          }
          newAcc[chainId][`${chainId}-${token.address.toLowerCase()}` as TokenListId] = {
            ...token,
            name: TOKEN_MAP_SYMBOL[token.address] || token.name,
          };
        }
      });

      return newAcc;
    }, {});
  }, [tokensLists, savedAllTokenLists, filter]);

  return tokenListByChainId;
}

export default useTokenListByChainId;
