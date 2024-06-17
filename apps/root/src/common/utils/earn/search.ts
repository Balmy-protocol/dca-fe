import { Strategy } from 'common-types';
import { uniqBy } from 'lodash';

const searchByStrategyData = (strategy: Strategy, search: string) => {
  const { farm, network, formattedYieldType, asset, rewards, guardian } = strategy;
  const strategySearchParameters = [farm.name, network.name, formattedYieldType, ...(guardian ? [guardian.name] : [])];

  const tokens = uniqBy([asset, ...rewards.tokens], (token) => `${token.chainId}-${token.address}`);
  const tokensSearchParameters = tokens.reduce<string[]>((acc, token) => {
    acc.push(token.name, token.symbol, token.address);
    return acc;
  }, []);

  return [...strategySearchParameters, ...tokensSearchParameters].some((param) => param.toLowerCase().includes(search));
};

export const filterStrategiesBySearch = (strategies: Strategy[], upperSearch: string) => {
  const search = upperSearch.toLowerCase();

  return strategies.filter((strategy) => searchByStrategyData(strategy, search));
};
