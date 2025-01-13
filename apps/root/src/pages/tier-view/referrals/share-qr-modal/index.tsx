import useAnalytics from '@hooks/useAnalytics';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, Modal, Typography } from 'ui-library';
import { toDataURL } from 'qrcode';
import { useThemeMode } from '@state/config/hooks';

interface ShareQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string | null;
}

const DEFAULT_QR_CODE_WIDTH = 300;

const StyledImage = styled.img`
  width: ${DEFAULT_QR_CODE_WIDTH}px;
  height: ${DEFAULT_QR_CODE_WIDTH}px;
`;

const ShareQRModal = ({ isOpen, onClose, inviteCode }: ShareQRModalProps) => {
  const { trackEvent } = useAnalytics();
  const [qrCodeDataUri, setQrCodeDataUri] = React.useState<string | null>(null);
  const mode = useThemeMode();

  React.useEffect(() => {
    if (isOpen) {
      trackEvent('Share QR modal - open');
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && inviteCode) {
      toDataURL(`https://app.balmy.xyz/earn/access-now?inviteCode=${encodeURIComponent(inviteCode)}`, {
        width: DEFAULT_QR_CODE_WIDTH,
        margin: 0,
        color: {
          dark: colors[mode].accent.primary,
          light: colors[mode].background.modals,
        },
      })
        .then(setQrCodeDataUri)
        .catch((e) => console.error('Error generating QR code', e));
    }
  }, [isOpen, inviteCode, mode]);

  return (
    <Modal open={isOpen} onClose={onClose} showCloseButton showCloseIcon maxWidth="sm" actionsAlignment="horizontal">
      <ContainerBox gap={6} flexDirection="column">
        <ContainerBox gap={2} flexDirection="column">
          <Typography variant="h3Bold">
            <FormattedMessage
              description="tier-view.referrals.share-qr-modal.title"
              defaultMessage="Share your referral code"
            />
          </Typography>
          <Typography variant="h6Bold">
            <FormattedMessage
              description="tier-view.referrals.share-qr-modal.description"
              defaultMessage="Share your referral code with your friends and family to earn rewards. Optionally they can copy this code to redeem it: {inviteCode}"
              values={{ inviteCode }}
            />
          </Typography>
        </ContainerBox>
        <ContainerBox alignItems="center" justifyContent="center">
          {qrCodeDataUri && <StyledImage src={qrCodeDataUri} alt="QR Code" />}
        </ContainerBox>
      </ContainerBox>
    </Modal>
  );
};

export default ShareQRModal;
