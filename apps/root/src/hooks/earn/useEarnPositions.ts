import { parseUserStrategies } from '@common/utils/earn/parsing';
import useTokenList from '@hooks/useTokenList';
import React from 'react';
import useEarnService from './useEarnService';
import useServiceEvents from '@hooks/useServiceEvents';
import { EarnService, EarnServiceData } from '@services/earnService';
import { EarnPosition, UserStatus } from 'common-types';
import useAllStrategies from './useAllStrategies';
import useUser from '@hooks/useUser';
export default function useEarnPositions() {
  const earnService = useEarnService();
  const tokenList = useTokenList({ curateList: false });
  const strategies = useAllStrategies();
  const user = useUser();

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
    () => ({
      userStrategies: parsedUserStrategies,
      hasFetchedUserStrategies: hasFetchedUserStrategies || user?.status !== UserStatus.loggedIn,
    }),
    [parsedUserStrategies, hasFetchedUserStrategies, user?.status]
  );
}
