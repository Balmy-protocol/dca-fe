import { IntervalSetActions } from '@constants/timing';
import { useAppDispatch } from '@hooks/state';
import useInterval from '@hooks/useInterval';
import { fetchBalances } from './actions';

const BalancesUpdater = () => {
  const dispatch = useAppDispatch();

  const updateBalancesAndPrices = async () => {
    await dispatch(fetchBalances());
  };

  useInterval(updateBalancesAndPrices, IntervalSetActions.balance);

  return null;
};

export default BalancesUpdater;
