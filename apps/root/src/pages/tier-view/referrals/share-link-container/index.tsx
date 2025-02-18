import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  BackgroundPaper,
  colors,
  ContainerBox,
  ContentCopyIcon,
  copyTextToClipboard,
  QrCodeIcon,
  TwitterIcon,
  Typography,
  useSnackbar,
  Zoom,
} from 'ui-library';
import ShareQRModal from '../share-qr-modal';
import useReferrals from '@hooks/tiers/useReferrals';
import useAnalytics from '@hooks/useAnalytics';

const StyledShareLinkContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledTierLevelSpan = styled.span`
  background: ${({ theme }) => theme.palette.gradient.tierLevel};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledLinkContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
  fullWidth: true,
})<{ isReferralModal?: boolean }>`
  ${({ theme, isReferralModal }) => `
    padding: ${theme.spacing(3)} ${theme.spacing(12)} ${theme.spacing(3)} ${theme.spacing(3)};
    border: 1.25px solid ${colors[theme.palette.mode].border.border1};
    border-radius: ${theme.spacing(2)};
    position: relative;
    overflow: hidden;
    ${
      isReferralModal
        ? `
    background: ${colors[theme.palette.mode].background.secondary};
    `
        : `
    border: 1.25px solid ${colors[theme.palette.mode].border.border1};
    `
    }
    ${theme.breakpoints.up('md')} {
      width: auto;
    }
  `}
`;

const TextWrapper = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ theme }) => theme.breakpoints.down('md')} {
    max-width: clamp(10ch, 50vw + 0ch, 28ch);
  }
`;

const StyledLinkItemsContainer = styled(ContainerBox).attrs({
  gap: 4,
  alignItems: 'center',
  fullWidth: true,
})`
  ${({ theme }) => `
    ${theme.breakpoints.down('lg')} {
      flex-direction: column;
      align-items: start;
    }
  `}
`;

const StyledLinkItem = styled(ContainerBox).attrs({
  justifyContent: 'center',
  alignItems: 'center',
})<{ isReferralModal?: boolean }>`
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: 100px;
  ${({ theme, isReferralModal }) =>
    !isReferralModal &&
    `
    border: 1px solid ${colors[theme.palette.mode].border.border1};
    background: ${colors[theme.palette.mode].background.secondary};
    `}
  cursor: pointer;
`;

const FeatureAsset = styled.div`
  position: absolute;
  background: url('https://ipfs.io/ipfs/QmRvtfXtN9R7ERLuSuf6TatGBj3p6Dd1b1g9KGWMpzau8w') 50% / contain no-repeat;
  width: 255px;
  height: 255px;
  transform: rotate(15deg);
  right: -50px;
  bottom: -140px;
  pointer-events: none;
  ${({ theme }) => theme.breakpoints.up('md')} {
    transform: rotate(-14deg);
    right: -46px;
    bottom: -103px;
  }
`;

const StyledContentCopyIcon = styled(ContentCopyIcon)`
  cursor: pointer;
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => colors[theme.palette.mode].typography.typo3};
`;

type ShareLinkContainerProps = {
  isReferralModal?: boolean;
};

export const ShareReferralLinkContent = ({ isReferralModal }: ShareLinkContainerProps) => {
  const [isShareQRModalOpen, setIsShareQRModalOpen] = React.useState(false);
  const { id: refId } = useReferrals();
  const intl = useIntl();
  const snackbar = useSnackbar();
  const { trackEvent } = useAnalytics();

  const onOpenQRModal = () => {
    setIsShareQRModalOpen(true);
  };

  const onCopy = () => {
    trackEvent('Referral link copied to clipboard');
    copyTextToClipboard(
      intl.formatMessage(
        defineMessage({
          description: 'tier-view.referrals.share-link-container.copy.code',
          defaultMessage: 'Hey I want to invite you to balmy!, you can use this code: {refId}',
        }),
        { refId }
      )
    );
    snackbar.enqueueSnackbar(
      intl.formatMessage(
        defineMessage({
          description: 'tier-view.referrals.share-link-container.copy.code.success',
          defaultMessage: 'Referral link copied to clipboard',
        })
      ),
      {
        variant: 'success',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        TransitionComponent: Zoom,
      }
    );
  };

  const onShareTwitter = () => {
    trackEvent('Referral link shared on Twitter');

    const twitterRef = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `I want to invite you to Balmy (@balmy_xyz), you can use my referral link:`
    )}&url=${encodeURIComponent(`https://app.balmy.xyz?refId=${refId}`)}`;

    window.open(twitterRef, '_blank');
  };

  return (
    <>
      <ShareQRModal isOpen={isShareQRModalOpen} onClose={() => setIsShareQRModalOpen(false)} refId={refId} />
      <ContainerBox flexDirection="column" gap={2} alignItems={isReferralModal ? 'center' : 'stretch'}>
        <Typography variant="h3Bold">
          <FormattedMessage
            id="tier-view.referrals.share-link-container.title.prefix"
            defaultMessage="Refer a Friend & Upgrade your"
          />{' '}
          <StyledTierLevelSpan>
            <FormattedMessage
              id="tier-view.referrals.share-link-container.title.highlight"
              defaultMessage="Tier level"
            />
          </StyledTierLevelSpan>
        </Typography>
        <Typography variant="bodyRegular" sx={{ maxWidth: { md: !isReferralModal ? '70%' : '100%' } }}>
          <FormattedMessage
            id="tier-view.referrals.share-link-container.description"
            defaultMessage="Invite your friends to join and unlock exclusive benefits as you climb the tier system. Access to premium strategies, reduced fees, and other exciting perks."
          />
        </Typography>
      </ContainerBox>
      <StyledLinkItemsContainer>
        <StyledLinkContainer isReferralModal={isReferralModal}>
          <TextWrapper>
            <Typography
              variant="bodySemibold"
              color={({ palette }) => colors[palette.mode].typography.typo1}
              whiteSpace="nowrap"
            >
              {`app.balmy.xyz?refId=${refId}`}
            </Typography>
          </TextWrapper>
          <StyledContentCopyIcon fontSize="large" onClick={onCopy} />
        </StyledLinkContainer>
        <ContainerBox gap={4} alignItems="center">
          <StyledLinkItem onClick={onOpenQRModal} isReferralModal={isReferralModal}>
            <QrCodeIcon fontSize="large" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
          </StyledLinkItem>
          <StyledLinkItem onClick={onShareTwitter} isReferralModal={isReferralModal}>
            <TwitterIcon fontSize="large" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
          </StyledLinkItem>
        </ContainerBox>
      </StyledLinkItemsContainer>
    </>
  );
};

const ShareLinkContainer = () => (
  <StyledShareLinkContainer>
    <ShareReferralLinkContent />
    <FeatureAsset />
  </StyledShareLinkContainer>
);

export default ShareLinkContainer;
