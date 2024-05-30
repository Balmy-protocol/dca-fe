import React from 'react';
import {
  ApiStrategy,
  NetworkStruct,
  Strategy,
  StrategyYieldType,
  TokenList,
  ApiEarnToken,
  TokenWithIcon,
} from 'common-types';
import { getTokenListId } from '../parsing';
import TokenIcon from '@common/components/token-icon';
import { find } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { toToken } from '../currency';

const earnApiTokenToTokenWithIcon = (apiToken: ApiEarnToken, chainId: number, tokenList: TokenList): TokenWithIcon => {
  const parsedToken = tokenList[getTokenListId({ tokenAddress: apiToken.address, chainId })] || toToken(apiToken);
  return {
    ...parsedToken,
    icon: <TokenIcon size={7} token={parsedToken} />,
  };
};

const yieldTypeFormatter = (yieldType: StrategyYieldType) => {
  switch (yieldType) {
    case StrategyYieldType.LENDING:
      return defineMessage({
        defaultMessage: 'Lending',
        description: 'strategyYieldTypeLending',
      });
    case StrategyYieldType.STAKING:
      return defineMessage({
        defaultMessage: 'Staking',
        description: 'strategyYieldTypeStaking',
      });
    default:
      return defineMessage({
        defaultMessage: 'Unknown',
        description: 'strategyYieldTypeUnknown',
      });
  }
};

export const parseAllStrategies = ({
  strategies,
  tokenList,
  intl,
}: {
  strategies: ApiStrategy[];
  tokenList: TokenList;
  intl: ReturnType<typeof useIntl>;
}): Strategy[] =>
  strategies.map((strategy) => {
    const network = find(NETWORKS, { chainId: strategy.chainId }) as NetworkStruct;

    return {
      id: strategy.id,
      asset: earnApiTokenToTokenWithIcon(strategy.asset, strategy.chainId, tokenList),
      rewards: Object.values(strategy.rewards).map((reward) => ({
        token: earnApiTokenToTokenWithIcon(reward.token, strategy.chainId, tokenList),
        apy: reward.apy,
      })),
      network,
      guardian: strategy.guardian,
      farm: strategy.farm,
      formattedYieldType: intl.formatMessage(yieldTypeFormatter(strategy.farm.yieldType)),
    };
  });
