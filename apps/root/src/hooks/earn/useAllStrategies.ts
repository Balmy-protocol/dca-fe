import { parseAllStrategies } from '@common/utils/earn/parsing';
import useTokenList from '@hooks/useTokenList';
import React from 'react';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { Strategy } from 'common-types';
import { useIntl } from 'react-intl';

export default function useAllStrategies() {
  const earnService = useEarnService();
  const intl = useIntl();
  const tokenList = useTokenList({ curateList: false });

  const allStrategies = useServiceEvents<EarnServiceData, EarnService, 'getAllStrategies'>(
    earnService,
    'getAllStrategies'
  );
  const hasFetchedAllStrategies = useServiceEvents<EarnServiceData, EarnService, 'getHasFetchedAllStrategies'>(
    earnService,
    'getHasFetchedAllStrategies'
  );

  const parsedAllStrategies = React.useMemo<Strategy[]>(
    () => parseAllStrategies({ strategies: allStrategies, tokenList, intl }),
    [allStrategies, tokenList, intl]
  );

  return React.useMemo(
    () => ({ strategies: parsedAllStrategies, hasFetchedAllStrategies }),
    [parsedAllStrategies, hasFetchedAllStrategies]
  );
}
