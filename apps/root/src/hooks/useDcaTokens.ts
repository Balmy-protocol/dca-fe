import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';
import PairService, { PairServiceData } from '@services/pairService';
import useTokenList from './useTokenList';
import { toToken } from '@common/utils/currency';
import { TokenList } from 'common-types';

function useDcaTokens(chainId: number): TokenList {
  const pairService = usePairService();
  const tokenList = useTokenList({
    filter: true,
    filterForDca: true,
    chainId,
  });

  const tokens = useServiceEvents<PairServiceData, PairService, 'getTokens'>(pairService, 'getTokens');

  const chainTokens = tokens[chainId];

  return Object.keys(chainTokens).reduce(
    (acc, tokenKey: `${number}-${string}`) => ({
      ...acc,
      [tokenKey]: tokenList[tokenKey]
        ? toToken({ ...chainTokens[tokenKey], ...tokenList[tokenKey] })
        : chainTokens[tokenKey],
    }),
    {}
  );
}

export default useDcaTokens;
