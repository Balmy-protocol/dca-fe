import { parseAllStrategies } from '@common/utils/earn/parsing';
import useTokenList from '@hooks/useTokenList';
import React from 'react';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { Strategy } from 'common-types';
import { useIntl } from 'react-intl';

export function useAllStrategies() {
  const earnService = useEarnService();
  const intl = useIntl();
  const tokenList = useTokenList({ curateList: true });

  const allStrategies = useServiceEvents<EarnServiceData, EarnService, 'getAllStrategies'>(
    earnService,
    'getAllStrategies'
  );
  const isLoadingAllStrategies = useServiceEvents<EarnServiceData, EarnService, 'getIsLoadingAllStrategies'>(
    earnService,
    'getIsLoadingAllStrategies'
  );

  const parsedAllStrategies = React.useMemo<Strategy[]>(
    () => parseAllStrategies({ strategies: allStrategies, tokenList, intl }),
    [allStrategies, tokenList, intl]
  );

  return React.useMemo(
    () => ({ strategies: parsedAllStrategies, isLoadingAllStrategies }),
    [parsedAllStrategies, isLoadingAllStrategies]
  );
}
