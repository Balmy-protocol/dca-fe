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
import { Address } from 'viem';
import useWallets from '@hooks/useWallets';
import styled from 'styled-components';
import confetti from 'canvas-confetti';
import { StyledElegibilityCriteriaBackgroundPaper } from '../elegibility-criteria';

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
  setStatus: (status: ElegibilityConfirmationStatus) => void;
}

interface NeedsSignatureProps extends ElegibilityConfirmationBaseProps {
  elegibleWallets: Address[];
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
  ElegibilityConfirmationStatus.NOT_ELIGIBLE,
  ElegibilityConfirmationStatus.ELIGIBLE,
  ElegibilityConfirmationStatus.NEEDS_SIGNATURE,
  ElegibilityConfirmationStatus.OWNERSHIP_CONFIRMED,
];

const StatusWithSuccessAnimation: ElegibilityConfirmationStatus[] = [
  ElegibilityConfirmationStatus.NOT_ELIGIBLE,
  ElegibilityConfirmationStatus.ELIGIBLE,
  ElegibilityConfirmationStatus.NEEDS_SIGNATURE,
];

const ElegibilityConfirmation = () => {
  const [status, setStatus] = React.useState(ElegibilityConfirmationStatus.LOADING);
  const wallets = useWallets();
  const elegibleWallets: Address[] = wallets.map((wallet) => wallet.address);
  React.useEffect(() => {
    setTimeout(() => {
      // TODO: Implement eligibility check
      setStatus(ElegibilityConfirmationStatus.NEEDS_SIGNATURE);
    }, 3500);
  }, [wallets]);

  const StatusComponent = STATUS_MAP[status];
  return (
    <StyledElegibilityCriteriaBackgroundPaper>
      <ContainerBox flexDirection="column" gap={6} justifyContent="center" alignItems="center">
        <StatusComponent setStatus={setStatus} elegibleWallets={elegibleWallets} />
      </ContainerBox>
      {StatusWithElipse.includes(status) && (
        <StyledAnimatedElipse showAnimation={StatusWithSuccessAnimation.includes(status)} />
      )}
    </StyledElegibilityCriteriaBackgroundPaper>
  );
};

export default ElegibilityConfirmation;
