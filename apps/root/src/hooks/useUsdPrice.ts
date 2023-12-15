import React from 'react';
import { Token } from '@types';

import { parseUsdPrice } from '@common/utils/currency';
import useRawUsdPrice from './useUsdRawPrice';

function useUsdPrice(
  from: Token | undefined | null,
  amount: bigint | null,
  date?: string
): [number | undefined, boolean, string?] {
  const isValueZero = !!amount && amount.eq(0);
  const [result, isLoading, error] = useRawUsdPrice(from, date, isValueZero);

  return React.useMemo(
    () => [parseUsdPrice(from, amount, result), isLoading, error],
    [result, from, amount, isLoading, error]
  );
}

export default useUsdPrice;
