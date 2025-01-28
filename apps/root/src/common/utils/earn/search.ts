import { Strategy } from 'common-types';
import { uniqBy } from 'lodash';

export const searchByStrategyData = (strategy: Strategy, upperSearch: string) => {
  const search = upperSearch.toLowerCase();

  const { farm, network, formattedYieldType, asset, rewards, guardian } = strategy;
  const strategySearchParameters = [
    farm.protocol,
    network.name,
    formattedYieldType,
    ...(guardian ? [guardian.name] : []),
  ];

  const tokens = uniqBy([asset, ...rewards.tokens], (token) => `${token.chainId}-${token.address}`);
  const tokensSearchParameters = tokens.reduce<string[]>((acc, token) => {
    acc.push(token.name, token.symbol, token.address);
    return acc;
  }, []);

  return [...strategySearchParameters, ...tokensSearchParameters].some((param) => param.toLowerCase().includes(search));
};
