import React from 'react';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import keyBy from 'lodash/keyBy';
import { useAllTransactions } from 'state/transactions/hooks';
import { NETWORKS } from 'config/constants';
import { DEFAULT_TOKEN_LIST, PROTOCOL_TOKEN, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useSavedTokenLists, useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenList(filter = true) {
  const currentNetwork = useCurrentNetwork();
  const transactions = useAllTransactions();
  const tokensLists = useTokensLists();
  const savedTokenLists = useSavedTokenLists();

  const tokenList: TokenList = React.useMemo(() => {
    if (currentNetwork.chainId !== NETWORKS.mainnet.chainId) {
      if (DEFAULT_TOKEN_LIST[currentNetwork.chainId]) {
        return DEFAULT_TOKEN_LIST[currentNetwork.chainId] || {};
      }

      // return web3Service.getTokenList();
    }

    return reduce(
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
      { [PROTOCOL_TOKEN_ADDRESS]: PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId) }
    );
  }, [transactions, currentNetwork.chainId]);

  return tokenList;
}

export default useTokenList;
