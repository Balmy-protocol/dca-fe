import React from 'react';
import { Token } from '@types';
import usePositionService from './usePositionService';

function useDcaAllowanceTarget(
  chainId: number,
  from?: Nullable<Token>,
  yieldFrom?: Nullable<string>,
  usePermit2?: boolean
) {
  const positionService = usePositionService();

  const allowanceTarget = React.useMemo(() => {
    if (from) {
      return positionService.getAllowanceTarget(chainId, from, yieldFrom, usePermit2);
    }

    return '';
  }, [chainId, from, yieldFrom, usePermit2]);

  return allowanceTarget;
}

export default useDcaAllowanceTarget;
