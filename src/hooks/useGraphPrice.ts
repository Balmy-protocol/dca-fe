import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import usePriceService from './usePriceService';

function useGraphPrice(
  from: Token | undefined | null,
  to: Token | undefined | null,
  isMonth = false
): [{ rate: number; timestamp: number }[] | undefined, boolean, string?] {
  const priceService = usePriceService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result: { rate: number; timestamp: number }[] | undefined;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevIsMonth = usePrevious(isMonth);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const prices = await priceService.getPriceForGraph(from, to, isMonth);
          setState({ result: prices, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      } else {
        setState({ result: undefined, error: undefined, isLoading: false });
      }
    }

    if (
      (!isLoading && isUndefined(result) && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevIsMonth, isMonth)
    ) {
      setState({ result: undefined, error: undefined, isLoading: true });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, prevFrom, to, prevTo, isLoading, result, error, isMonth, prevIsMonth]);

  return [result || prevResult, isLoading, error];
}

export default useGraphPrice;
