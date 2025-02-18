import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';

const useReferrals = () => {
  const tierService = useTierService();
  const referrals = useServiceEvents<TierServiceData, TierService, 'getReferrals'>(tierService, 'getReferrals');

  return referrals;
};

export default useReferrals;
