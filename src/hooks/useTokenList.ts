import React from 'react';
import WalletContext from 'common/wallet-context';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import { useAllTransactions } from 'state/transactions/hooks';
import { NETWORKS } from 'config/constants';
import { ETH } from 'mocks/tokens';
import { useSavedTokenLists } from 'state/token-lists/hooks';
import useTokensLists from './useTokensLists';
import useCurrentNetwork from './useCurrentNetwork';

function useTokenList() {
  const { web3Service } = React.useContext(WalletContext);
  const currentNetwork = useCurrentNetwork();
  const transactions = useAllTransactions();
  const tokensLists = useTokensLists();
  const savedTokenLists = useSavedTokenLists();

  const tokenList: TokenList = React.useMemo(() => {
    if (currentNetwork.chainId !== NETWORKS.mainnet.chainId) {
      return web3Service.getTokenList();
    }

    return reduce(
      tokensLists,
      (acc, tokensList, key) => (savedTokenLists[key] ? { ...acc, ...tokensList.tokens } : acc),
      { [ETH.address]: ETH }
    );
  }, [transactions, currentNetwork.chainId]);

  return tokenList;
}

export default useTokenList;
