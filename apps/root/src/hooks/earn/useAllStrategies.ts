import { parseAllStrategies } from '@common/utils/earn/parsing';
import useTokenList from '@hooks/useTokenList';
import React from 'react';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { Strategy } from 'common-types';
import { useIntl } from 'react-intl';
import { SUPPORTED_NETWORKS_EARN } from '@constants';

export default function useAllStrategies() {
  const earnService = useEarnService();
  const intl = useIntl();
  const tokenList = useTokenList({ curateList: false });

  const allStrategies = useServiceEvents<EarnServiceData, EarnService, 'getAllStrategies'>(
    earnService,
    'getAllStrategies'
  );

  return React.useMemo<Strategy[]>(
    () =>
      parseAllStrategies({ strategies: allStrategies, tokenList, intl }).filter((strategy) =>
        SUPPORTED_NETWORKS_EARN.includes(strategy.network.chainId)
      ),
    [allStrategies, tokenList, intl]
  );
}
