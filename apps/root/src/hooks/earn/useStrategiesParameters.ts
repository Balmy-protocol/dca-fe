import React from 'react';
import useTokenList from '@hooks/useTokenList';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { StrategyFarm, StrategyGuardian, NetworkStruct, StrategyYieldType, Token, TokenListId } from 'common-types';
import { sdkStrategyTokenToToken, yieldTypeFormatter } from '@common/utils/earn/parsing';
import { useIntl } from 'react-intl';
import { removeEquivalentFromTokensArray } from '@common/utils/currency';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';

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

export function useStrategiesParameters(variant: StrategiesTableVariants): ParsedStrategiesParameters {
  const earnService = useEarnService();
  const intl = useIntl();
  const tokenList = useTokenList({ curateList: true });

  const strategiesParameters = useServiceEvents<EarnServiceData, EarnService, 'getStrategiesParameters'>(
    earnService,
    'getStrategiesParameters'
  );

  const earnPositionsParameters = useServiceEvents<EarnServiceData, EarnService, 'getEarnPositionsParameters'>(
    earnService,
    'getEarnPositionsParameters'
  );

  const parameters =
    variant === StrategiesTableVariants.ALL_STRATEGIES ? strategiesParameters : earnPositionsParameters;

  return React.useMemo<ParsedStrategiesParameters>(() => {
    const assets = Object.entries(parameters.tokens.assets).map(([assetKey, asset]) =>
      sdkStrategyTokenToToken(asset, assetKey as TokenListId, tokenList)
    );
    const rewards = Object.entries(parameters.tokens.rewards).map(([rewardKey, reward]) =>
      sdkStrategyTokenToToken(reward, rewardKey as TokenListId, tokenList)
    );

    const yieldTypes = parameters.yieldTypes.map((yieldType) => ({
      value: yieldType,
      label: intl.formatMessage(yieldTypeFormatter(yieldType)),
    }));

    return {
      farms: Object.values(parameters.farms),
      networks: Object.values(parameters.networks),
      assets: removeEquivalentFromTokensArray(assets),
      rewards: removeEquivalentFromTokensArray(rewards),
      yieldTypes,
      guardians: Object.values(parameters.guardians),
    };
  }, [parameters, tokenList, intl]);
}