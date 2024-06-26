import React from 'react';
import {
  SdkStrategy,
  NetworkStruct,
  Strategy,
  StrategyYieldType,
  TokenList,
  SdkStrategyToken,
  StrategyRiskLevel,
  Token,
  TokenListId,
} from 'common-types';
import { find } from 'lodash';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import { toToken } from '../currency';
import { SafetyIcon } from 'ui-library';

export const sdkStrategyTokenToToken = (
  sdkToken: SdkStrategyToken,
  tokenKey: TokenListId,
  tokenList: TokenList
): Token => tokenList[tokenKey] || toToken(sdkToken);

export const yieldTypeFormatter = (yieldType: StrategyYieldType) => {
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

export const getStrategySafetyIcon = (riskLevel: StrategyRiskLevel) => {
  switch (riskLevel) {
    case StrategyRiskLevel.LOW:
      return <SafetyIcon safety="high" />;
    case StrategyRiskLevel.MEDIUM:
      return <SafetyIcon safety="medium" />;
    case StrategyRiskLevel.HIGH:
      return <SafetyIcon safety="low" />;
    default:
      return <></>;
  }
};

export const parseAllStrategies = ({
  strategies,
  tokenList,
  intl,
}: {
  strategies: SdkStrategy[];
  tokenList: TokenList;
  intl: ReturnType<typeof useIntl>;
}): Strategy[] =>
  strategies.map((strategy) => {
    const network = find(NETWORKS, { chainId: strategy.farm.chainId }) as NetworkStruct;

    return {
      id: strategy.id,
      asset: sdkStrategyTokenToToken(
        strategy.farm.asset,
        `${strategy.farm.chainId}-${strategy.farm.asset.address}` as TokenListId,
        tokenList
      ),
      rewards: {
        tokens: Object.values(strategy.farm.rewards?.tokens || []).map((reward) =>
          sdkStrategyTokenToToken(reward, `${strategy.farm.chainId}-${reward.address}` as TokenListId, tokenList)
        ),
        apy: strategy.farm.apy,
      },
      network,
      guardian: strategy.guardian,
      farm: strategy.farm,
      formattedYieldType: intl.formatMessage(yieldTypeFormatter(strategy.farm.type)),
      riskLevel: strategy.riskLevel,
    };
  });
