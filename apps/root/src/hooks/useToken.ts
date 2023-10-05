import findIndex from 'lodash/findIndex';
import useTokenList from './useTokenList';

function useToken(tokenAddress?: string, checkForSymbol = false, isAggregator = false) {
  const tokenList = useTokenList(isAggregator);

  if (!tokenAddress) {
    return undefined;
  }

  const foundToken = tokenList[tokenAddress];

  if (foundToken || !checkForSymbol) {
    return foundToken;
  }

  const tokenValues = Object.values(tokenList);
  const values = tokenValues.map((token) => ({ ...token, symbol: token.symbol.toLowerCase() }));

  const index = findIndex(values, { symbol: tokenAddress.toLowerCase() });

  return tokenValues[index];
}

export default useToken;
