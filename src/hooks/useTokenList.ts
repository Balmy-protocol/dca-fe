import React from 'react';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import { useAllTransactions } from 'state/transactions/hooks';
import { NETWORKS } from 'config/constants';
import { DEFAULT_TOKEN_LIST, ETH } from 'mocks/tokens';
import { useSavedTokenLists, useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenList() {
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
      (acc, tokensList, key) => (savedTokenLists.includes(key) ? { ...acc, ...tokensList.tokens } : acc),
      { [ETH.address]: ETH }
    );
  }, [transactions, currentNetwork.chainId]);

  return tokenList;
}

export default useTokenList;
