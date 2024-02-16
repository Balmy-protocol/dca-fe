import PairService, { PairServiceData } from '@services/pairService';
import usePairService from './usePairService';
import useServiceEvents from './useServiceEvents';
import { STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP } from '@constants';
import { AvailableSwapInterval } from 'common-types';
import { useIntl } from 'react-intl';

function useAvailableSwapIntervals(chainId: number) {
  const pairService = usePairService();
  const intl = useIntl();

  const minSwapInterval = useServiceEvents<PairServiceData, PairService, 'getMinSwapInterval'>(
    pairService,
    'getMinSwapInterval'
  );

  const availableSwapIntervals: AvailableSwapInterval[] = SWAP_INTERVALS_MAP.filter(
    (interval) => interval.value >= minSwapInterval[chainId]
  ).map<AvailableSwapInterval>((swapInterval) => ({
    label: {
      singular: intl.formatMessage(
        STRING_SWAP_INTERVALS[swapInterval.value.toString() as keyof typeof STRING_SWAP_INTERVALS].singular
      ),
      adverb: intl.formatMessage(
        STRING_SWAP_INTERVALS[swapInterval.value.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
      ),
    },
    value: swapInterval.value,
  }));

  return availableSwapIntervals;
}

export default useAvailableSwapIntervals;
