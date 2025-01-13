import TierService, { TierServiceData } from '@services/tierService';
import useServiceEvents from '@hooks/useServiceEvents';
import useTierService from './useTierService';
import { EarnInviteCode } from '@types';

export type InviteCodeWithReferralStatus = EarnInviteCode & {
  isReferralActive: boolean;
};

const useInviteCodes = () => {
  const tierService = useTierService();
  const inviteCodes = useServiceEvents<TierServiceData, TierService, 'getInviteCodes'>(tierService, 'getInviteCodes');
  const referrals = useServiceEvents<TierServiceData, TierService, 'getReferrals'>(tierService, 'getReferrals');

  return inviteCodes.map((inviteCode) => ({
    ...inviteCode,
    isReferralActive: !!referrals.find((referral) => referral === inviteCode.claimedBy),
  }));
};

export default useInviteCodes;
