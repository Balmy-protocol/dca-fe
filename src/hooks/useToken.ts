import find from 'lodash/find';
import useTokenList from './useTokenList';

function useToken(tokenAddress: string, checkForSymbol = false, isAggregator = false) {
  const tokenList = useTokenList(isAggregator);

  if (!tokenAddress) {
    return undefined;
  }

  const foundToken = tokenList[tokenAddress];

  if (foundToken || !checkForSymbol) {
    return foundToken;
  }

  const values = Object.values(tokenList);

  return find(values, { symbol: tokenAddress.toUpperCase() });
}

export default useToken;
