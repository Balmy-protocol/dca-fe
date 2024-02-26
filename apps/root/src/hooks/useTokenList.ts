import React from 'react';
import { Token, TokenList } from '@types';
import toPairs from 'lodash/toPairs';
import orderBy from 'lodash/orderBy';
import { getAllChains } from '@mean-finance/sdk';
import { ALLOWED_YIELDS, DCA_TOKEN_BLACKLIST, TOKEN_BLACKLIST } from '@constants';
import { getProtocolToken, TOKEN_MAP_SYMBOL } from '@common/mocks/tokens';
import { useTokensLists } from '@state/token-lists/hooks';
import { keyBy } from 'lodash';

function useTokenList({
  filter = true,
  chainId,
  filterForDca = false,
}: {
  filter?: boolean;
  chainId?: number;
  filterForDca?: boolean;
}) {
  const tokensLists = useTokensLists();

  const reducedYieldTokens = React.useMemo(
    () =>
      ALLOWED_YIELDS[chainId || 1].reduce((acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()], []),
    [chainId]
  );

  const tokenList: TokenList = React.useMemo(() => {
    const orderedLists = orderBy(
      toPairs(tokensLists).map(([, list]) => list),
      ['priority'],
      ['asc']
    );

    const tokens = orderedLists
      .reduce<Token[]>((acc, list) => [...acc, ...list.tokens], [])
      .filter(
        (token) =>
          (!chainId || token.chainId === chainId) &&
          // !Object.keys(acc).includes(token.address) &&
          (!filterForDca || !reducedYieldTokens.includes(token.address)) &&
          (!filter || !(filterForDca ? TOKEN_BLACKLIST : DCA_TOKEN_BLACKLIST).includes(token.address))
      )
      .map((token) => ({ ...token, name: TOKEN_MAP_SYMBOL[token.address] || token.name }));

    const protocols = chainId
      ? [getProtocolToken(chainId)]
      : getAllChains().map((chain) => getProtocolToken(chain.chainId));

    return keyBy([...tokens, ...protocols], ({ address, chainId: tokenChainId }) => `${tokenChainId}-${address}`);
  }, [filterForDca, reducedYieldTokens, filter, chainId]);

  return tokenList;
}

export default useTokenList;
