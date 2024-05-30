import React from 'react';
import { ApiStrategy, NetworkStruct, Strategy, StrategyYieldType, TokenList } from 'common-types';
import { getTokenListId } from '../parsing';
import TokenIcon from '@common/components/token-icon';
import { find } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';

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
    const assetToken = tokenList[getTokenListId({ tokenAddress: strategy.asset, chainId: strategy.chainId })];
    const network = find(NETWORKS, { chainId: strategy.chainId }) as NetworkStruct;

    return {
      id: strategy.id,
      asset: {
        ...assetToken,
        icon: <TokenIcon size={7} token={assetToken} />,
      },
      rewards: strategy.rewards.map((reward) => ({
        token: {
          ...tokenList[getTokenListId({ tokenAddress: reward.token, chainId: strategy.chainId })],
          icon: (
            <TokenIcon
              size={7}
              token={tokenList[getTokenListId({ tokenAddress: reward.token, chainId: strategy.chainId })]}
            />
          ),
        },
        apy: reward.apy,
      })),
      network,
      guardian: strategy.guardian,
      yieldType: intl.formatMessage(yieldTypeFormatter(strategy.farm.yieldType)),
      farm: strategy.farm,
    };
  });
