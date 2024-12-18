import React from 'react';
import { colors, ContainerBox } from 'ui-library';
import {
  ElegibilityConfirmationStatus,
  ElegibleCase,
  LoadingCase,
  NeedsSignatureCase,
  NotEligibleStatus,
  OwnershipConfirmedCase,
} from './use-cases';
import styled from 'styled-components';
import confetti from 'canvas-confetti';
import { StyledElegibilityCriteriaBackgroundPaper } from '../elegibility-criteria';
import useElegibilityCriteria, { ElegibilityStatus } from '@hooks/earn/useElegibilityCriteria';
import { Address, Wallet } from 'common-types';
import useWallets from '@hooks/useWallets';
import usePrevious from '@hooks/usePrevious';
import { isEqual } from 'lodash';

const StyledAnimatedElipse = styled(({ showAnimation, ...props }: { showAnimation?: boolean }) => {
  React.useEffect(() => {
    if (!showAnimation) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    confetti({
      particleCount: 100,
      spread: 70,
      angle: 60,
      origin: { x: 0 },
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    confetti({
      particleCount: 100,
      spread: 70,
      angle: 120,
      origin: { x: 1 },
    });
  }, [showAnimation]);
  return <div {...props} />;
})<{ showAnimation?: boolean }>`
  border-radius: 1096.31px;
  opacity: 0.2;
  background: ${({ theme }) => colors[theme.palette.mode].accent.accent600};
  filter: blur(50px);
  width: 100%;
  height: ${({ theme }) => theme.spacing(50)};
  z-index: -1;
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(-33)};
  animation: ${({ showAnimation }) => (showAnimation ? 'moveUp 2s ease-out forwards' : 'none')};

  @keyframes moveUp {
    from {
      bottom: ${({ theme }) => theme.spacing(-60)};
    }
    to {
      bottom: ${({ theme }) => theme.spacing(-33)};
    }
  }
`;

interface ElegibilityConfirmationBaseProps {
  setElegibilityStatus: (status: ElegibilityStatus) => void;
  elegibleAndOwnedAddress?: Address;
}

interface NeedsSignatureProps extends ElegibilityConfirmationBaseProps {
  elegibleWallets: Wallet[];
}

type ElegibilityConfirmationProps = NeedsSignatureProps;

const STATUS_MAP: Record<ElegibilityConfirmationStatus, React.ComponentType<ElegibilityConfirmationProps>> = {
  [ElegibilityConfirmationStatus.LOADING]: LoadingCase,
  [ElegibilityConfirmationStatus.NOT_ELIGIBLE]: NotEligibleStatus,
  [ElegibilityConfirmationStatus.ELIGIBLE]: ElegibleCase,
  [ElegibilityConfirmationStatus.NEEDS_SIGNATURE]: NeedsSignatureCase,
  [ElegibilityConfirmationStatus.OWNERSHIP_CONFIRMED]: OwnershipConfirmedCase,
};

const StatusWithElipse: ElegibilityConfirmationStatus[] = [
  ElegibilityConfirmationStatus.ELIGIBLE,
  ElegibilityConfirmationStatus.NEEDS_SIGNATURE,
  ElegibilityConfirmationStatus.OWNERSHIP_CONFIRMED,
];

const StatusWithSuccessAnimation: ElegibilityConfirmationStatus[] = [
  ElegibilityConfirmationStatus.ELIGIBLE,
  ElegibilityConfirmationStatus.NEEDS_SIGNATURE,
];

const ElegibilityConfirmation = () => {
  const { fetchElegibilityAchievements, elegibilityStatus, setElegibilityStatus, elegibleWallets } =
    useElegibilityCriteria();
  const wallets = useWallets();
  const prevWallets = usePrevious(wallets);
  React.useEffect(() => {
    const walletAddresses = wallets.map((wallet) => wallet.address);
    const prevWalletsAddresses = prevWallets?.map((wallet) => wallet.address);
    if (!isEqual(walletAddresses, prevWalletsAddresses)) {
      void fetchElegibilityAchievements();
    }
  }, [wallets]);

  const StatusComponent = STATUS_MAP[elegibilityStatus.status];
  return (
    <StyledElegibilityCriteriaBackgroundPaper>
      <ContainerBox flexDirection="column" gap={6} justifyContent="center" alignItems="center">
        <StatusComponent
          setElegibilityStatus={setElegibilityStatus}
          elegibleAndOwnedAddress={elegibilityStatus.elegibleAndOwnedAddress}
          elegibleWallets={elegibleWallets}
        />
      </ContainerBox>
      {StatusWithElipse.includes(elegibilityStatus.status) && (
        <StyledAnimatedElipse showAnimation={StatusWithSuccessAnimation.includes(elegibilityStatus.status)} />
      )}
    </StyledElegibilityCriteriaBackgroundPaper>
  );
};

export default ElegibilityConfirmation;
