import React from 'react';
import useAccountService from '@hooks/useAccountService';
import { ElegibilityConfirmationStatus } from '@pages/earn-access-now/components/elegibility-confirmation/use-cases';
import { Address } from 'viem';
import { Wallet } from 'common-types';
import useWallets from '@hooks/useWallets';

export type ElegibilityAchievementsResponse = Record<
  Address,
  { id: ElegibilityAchievements; achieved: number | boolean }[]
>;

enum ElegibilityAchievements {
  AGG_SWAPS = 'agg-swaps',
  LOBSTER_NFT_HOLDER = 'lobster-nft-holder',
  DCA_POSITIONS = 'dca-positions',
}

const processAchievements = (achievements: ElegibilityAchievementsResponse, wallets: Wallet[]): Wallet[] =>
  wallets.filter(
    (wallet) =>
      (achievements[wallet.address].find((achievement) => achievement.id === ElegibilityAchievements.AGG_SWAPS)
        ?.achieved as number) >= 100 ||
      (achievements[wallet.address].find((achievement) => achievement.id === ElegibilityAchievements.LOBSTER_NFT_HOLDER)
        ?.achieved as boolean) ||
      (achievements[wallet.address].find((achievement) => achievement.id === ElegibilityAchievements.DCA_POSITIONS)
        ?.achieved as number) >= 1
  );

export type ElegibilityStatus = {
  status: ElegibilityConfirmationStatus;
  elegibleAndOwnedAddress?: Address;
};

export default function useElegibilityCriteria(): {
  fetchElegibilityAchievements: () => Promise<void>;
  elegibilityStatus: ElegibilityStatus;
  setElegibilityStatus: (status: ElegibilityStatus) => void;
  elegibleWallets: Wallet[];
} {
  const [elegibilityStatus, setElegibilityStatus] = React.useState<ElegibilityStatus>({
    status: ElegibilityConfirmationStatus.LOADING,
  });
  const [elegibleWallets, setElegibleWallets] = React.useState<Wallet[]>([]);
  const accountService = useAccountService();
  const wallets = useWallets();

  const fetchElegibilityAchievements = async () => {
    setElegibilityStatus({ status: ElegibilityConfirmationStatus.LOADING });
    const fetchedAchievements = await accountService.getElegibilityAchievements();
    const processedElegibleWallets = processAchievements(fetchedAchievements, wallets);
    setElegibleWallets(processedElegibleWallets);

    if (processedElegibleWallets.length === 0) {
      setElegibilityStatus({ status: ElegibilityConfirmationStatus.NOT_ELIGIBLE });
    } else if (processedElegibleWallets.some((wallet) => wallet.isOwner)) {
      setElegibilityStatus({
        status: ElegibilityConfirmationStatus.ELIGIBLE,
        elegibleAndOwnedAddress: processedElegibleWallets[0].address,
      });
    } else {
      setElegibilityStatus({
        status: ElegibilityConfirmationStatus.NEEDS_SIGNATURE,
      });
    }
  };

  return React.useMemo(
    () => ({ fetchElegibilityAchievements, elegibilityStatus, setElegibilityStatus, elegibleWallets }),
    [fetchElegibilityAchievements, elegibilityStatus, elegibleWallets]
  );
}
