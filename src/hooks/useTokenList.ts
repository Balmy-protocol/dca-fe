import React from 'react';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import keyBy from 'lodash/keyBy';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useSavedTokenLists, useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenList(filter = true) {
  const currentNetwork = useCurrentNetwork();
  const tokensLists = useTokensLists();
  const savedTokenLists = ["Mean Finance Graph Allowed Tokens"];

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
                    (token) => token.chainId === currentNetwork.chainId && !Object.keys(acc).includes(token.address)
                  ),
                  'address'
                ),
              }
            : acc,
        { [PROTOCOL_TOKEN_ADDRESS]: getProtocolToken(currentNetwork.chainId) }
      ),
    [currentNetwork.chainId, savedTokenLists]
  );

  return tokenList;
}

export default useTokenList;
