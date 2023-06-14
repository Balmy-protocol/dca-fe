import React from 'react';
import { TokenList } from '@types';
import reduce from 'lodash/reduce';
import toPairs from 'lodash/toPairs';
import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';
import { ALLOWED_YIELDS, DCA_TOKEN_BLACKLIST, TOKEN_BLACKLIST } from '@constants';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS, TOKEN_MAP_SYMBOL } from '@common/mocks/tokens';
import { useSavedAggregatorTokenLists, useTokensLists } from '@state/token-lists/hooks';
import useSelectedNetwork from './useSelectedNetwork';

function useTokenList(isAggregator = false, filter = true, filterChainId = true) {
  const currentNetwork = useSelectedNetwork();
  const tokensLists = useTokensLists();
  const savedDCATokenLists = ['Mean Finance Graph Allowed Tokens'];
  const savedAggregatorTokenLists = useSavedAggregatorTokenLists();

  const savedTokenLists = isAggregator ? savedAggregatorTokenLists : savedDCATokenLists;
  const reducedYieldTokens = React.useMemo(
    () =>
      ALLOWED_YIELDS[currentNetwork.chainId].reduce(
        (acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()],
        []
      ),
    [currentNetwork.chainId]
  );

  const tokenList: TokenList = React.useMemo(() => {
    const filteredLists = orderBy(
      compact(toPairs(tokensLists).map(([key, list]) => (!filter || savedTokenLists.includes(key) ? list : null))),
      ['priority'],
      ['desc']
    );

    return reduce(
      filteredLists,
      (acc, tokensList) => ({
        ...acc,
        ...keyBy(
          tokensList.tokens
            .filter(
              (token) =>
                (!filterChainId || token.chainId === currentNetwork.chainId) &&
                !Object.keys(acc).includes(token.address) &&
                (isAggregator || !reducedYieldTokens.includes(token.address)) &&
                (!filter || !(isAggregator ? TOKEN_BLACKLIST : DCA_TOKEN_BLACKLIST).includes(token.address))
            )
            .map((token) => ({ ...token, name: TOKEN_MAP_SYMBOL[token.address] || token.name })),
          'address'
        ),
      }),
      { [PROTOCOL_TOKEN_ADDRESS]: getProtocolToken(currentNetwork.chainId) }
    );
  }, [currentNetwork.chainId, savedTokenLists, reducedYieldTokens, filter, isAggregator]);

  return tokenList;
}

export default useTokenList;
