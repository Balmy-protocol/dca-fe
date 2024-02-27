import findIndex from 'lodash/findIndex';
import useTokenList from './useTokenList';
import findKey from 'lodash/findKey';
import { TokenListId } from 'common-types';

function useToken(tokenAddress?: string, checkForSymbol = false, filterForDca = false, chainId?: number) {
  const tokenList = useTokenList({ filterForDca, chainId });

  if (!tokenAddress) {
    return undefined;
  }

  const key = findKey(tokenList, (token) => token.address === tokenAddress) as TokenListId;

  const foundToken = tokenList[key];

  if (foundToken || !checkForSymbol) {
    return foundToken;
  }

  const tokenValues = Object.values(tokenList);

  const index = findIndex(tokenValues, ({ symbol }) => symbol.toLowerCase() === tokenAddress.toLowerCase());

  return tokenValues[index];
}

export default useToken;
