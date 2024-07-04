import { parseUserStrategies } from '@common/utils/earn/parsing';
import useTokenList from '@hooks/useTokenList';
import React from 'react';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { EarnPosition } from 'common-types';
import useAllStrategies from './useAllStrategies';

export default function useUserStrategies() {
  const earnService = useEarnService();
  const tokenList = useTokenList({ curateList: false });
  const { strategies } = useAllStrategies();

  const userStrategiesStrategies = useServiceEvents<EarnServiceData, EarnService, 'getUserStrategies'>(
    earnService,
    'getUserStrategies'
  );

  const hasFetchedUserStrategies = useServiceEvents<EarnServiceData, EarnService, 'getHasFetchedUserStrategies'>(
    earnService,
    'getHasFetchedUserStrategies'
  );

  const parsedUserStrategies = React.useMemo<EarnPosition[]>(
    () => parseUserStrategies({ userStrategies: userStrategiesStrategies, strategies, tokenList }),
    [userStrategiesStrategies, strategies, tokenList]
  );

  return React.useMemo(
    () => ({ userStrategies: parsedUserStrategies, hasFetchedUserStrategies }),
    [parsedUserStrategies, hasFetchedUserStrategies]
  );
}
