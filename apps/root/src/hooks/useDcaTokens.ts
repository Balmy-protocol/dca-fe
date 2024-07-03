import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';
import PairService, { PairServiceData } from '@services/pairService';
import useTokenList from './useTokenList';
import { toToken } from '@common/utils/currency';
import { TokenList, TokenListId, TokenType } from 'common-types';

function useDcaTokens(chainId: number, includeYield: boolean = false): TokenList {
  const pairService = usePairService();
  const tokenList = useTokenList({
    filter: true,
    filterForDca: !includeYield,
    chainId,
  });

  const tokens = useServiceEvents<PairServiceData, PairService, 'getTokens'>(pairService, 'getTokens');

  const chainTokens = tokens[chainId] || {};

  return Object.keys(chainTokens)
    .filter(
      (key) => includeYield || chainTokens[key as keyof typeof chainTokens].type !== TokenType.YIELD_BEARING_SHARE
    )
    .reduce<TokenList>((acc, tokenKey: TokenListId) => {
      // eslint-disable-next-line no-param-reassign
      acc[tokenKey] = tokenList[tokenKey]
        ? toToken({ ...chainTokens[tokenKey], ...tokenList[tokenKey] })
        : chainTokens[tokenKey];
      return acc;
    }, {});
}

export default useDcaTokens;
