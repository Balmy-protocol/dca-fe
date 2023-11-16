import { TokenListByChainId } from '@types';
import useTokenList from './useTokenList';

function useTokenListByChainId() {
  const tokenList = useTokenList({ allowAllTokens: true, filterChainId: false });
  const allTokens = Object.values(tokenList);
  const tokenListsByChain: TokenListByChainId = allTokens.reduce((acc, token) => {
    const existingTokensForChain = acc[token.chainId] || [];
    return {
      ...acc,
      [token.chainId]: { ...existingTokensForChain, [token.address]: token },
    };
  }, {} as TokenListByChainId);
  return tokenListsByChain;
}

export default useTokenListByChainId;
