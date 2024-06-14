import React from 'react';
import useTokenList from '@hooks/useTokenList';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { StrategyFarm, StrategyGuardian, NetworkStruct, StrategyYieldType, Token, TokenListId } from 'common-types';

import { sdkStrategyTokenToToken, yieldTypeFormatter } from '@common/utils/earn/parsing';
import { useIntl } from 'react-intl';
import { removeEquivalentFromTokensArray } from '@common/utils/currency';
import { useAllStrategies } from './useAllStrategies';

interface ParsedStrategiesParameters {
  farms: StrategyFarm[];
  networks: NetworkStruct[];
  assets: Token[];
  rewards: Token[];
  yieldTypes: {
    value: StrategyYieldType;
    label: string;
  }[];
  guardians: StrategyGuardian[];
}

export function useStrategiesParameters(): ParsedStrategiesParameters {
  const earnService = useEarnService();
  const intl = useIntl();
  const tokenList = useTokenList({ curateList: true });
  const { isLoadingAllStrategies } = useAllStrategies();

  const strategiesParameters = useServiceEvents<EarnServiceData, EarnService, 'getStrategiesParameters'>(
    earnService,
    'getStrategiesParameters'
  );

  return React.useMemo<ParsedStrategiesParameters>(() => {
    const assets = Object.entries(strategiesParameters.tokens.assets).map(([assetKey, asset]) =>
      sdkStrategyTokenToToken(asset, assetKey as TokenListId, tokenList)
    );
    const rewards = Object.entries(strategiesParameters.tokens.rewards).map(([rewardKey, reward]) =>
      sdkStrategyTokenToToken(reward, rewardKey as TokenListId, tokenList)
    );

    const yieldTypes = strategiesParameters.yieldTypes.map((yieldType) => ({
      value: yieldType,
      label: intl.formatMessage(yieldTypeFormatter(yieldType)),
    }));

    return {
      farms: Object.values(strategiesParameters.farms),
      networks: Object.values(strategiesParameters.networks),
      assets: removeEquivalentFromTokensArray(assets),
      rewards: removeEquivalentFromTokensArray(rewards),
      yieldTypes,
      guardians: Object.values(strategiesParameters.guardians),
    };
  }, [strategiesParameters, tokenList, intl, isLoadingAllStrategies]);
}
