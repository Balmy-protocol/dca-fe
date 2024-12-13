import React from 'react';
import {
  Button,
  CheckCircleOutlineIcon,
  colors,
  ContainerBox,
  DividerBorder1,
  DividerBorder2,
  Radio,
  Typography,
} from 'ui-library';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import styled from 'styled-components';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { WalletActionType } from '@services/accountService';
import useTrackEvent from '@hooks/useTrackEvent';
import usePushToHistory from '@hooks/usePushToHistory';
import { EARN_ROUTE } from '@constants/routes';
import useWallets from '@hooks/useWallets';
import { Address as ViemAddress } from 'viem';
import Address from '@common/components/address';
import useWallet from '@hooks/useWallet';
import { WalletStatus } from '@types';
import { getDisplayWallet } from '@common/utils/parsing';

export enum ElegibilityConfirmationStatus {
  LOADING = 'LOADING',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ELIGIBLE = 'ELIGIBLE',
  NEEDS_SIGNATURE = 'NEEDS_SIGNATURE',
  OWNERSHIP_CONFIRMED = 'OWNERSHIP_CONFIRMED',
}

const TitleContainer = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 2,
})``;

const StyledTitle = styled(Typography).attrs({ variant: 'h3Bold', textAlign: 'center' })`
  color: ${({ theme }) => colors[theme.palette.mode].typography.typo1};
`;

const StyledDescription = styled(Typography).attrs({ variant: 'bodyRegular', textAlign: 'center', maxWidth: '40ch' })`
  color: ${({ theme }) => colors[theme.palette.mode].typography.typo2};
`;

const StyledViewableButton = styled(Button).attrs({ variant: 'contained' })`
  background-color: ${({ theme }) => colors[theme.palette.mode].accent.accent600};
  cursor: default;
  pointer-events: none;
`;

const ClaimEarnButton = () => {
  const pushToHistory = usePushToHistory();

  const onEnterEarnNow = () => {
    pushToHistory(`/${EARN_ROUTE.key}`);
  };

  return (
    <Button variant="contained" onClick={onEnterEarnNow}>
      <FormattedMessage
        description="earn-access-now.eligibility.confirmation.eligible.button"
        defaultMessage="Enter Earn Now!"
      />
    </Button>
  );
};

export const LoadingCase = () => (
  <>
    <CenteredLoadingIndicator size={55} />
    <StyledViewableButton>
      <FormattedMessage
        description="earn-access-now.eligibility.confirmation.loading.button"
        defaultMessage="Checking your eligibility..."
      />
    </StyledViewableButton>
  </>
);

export const NotEligibleStatus = () => {
  const openConnectWalletModal = useOpenConnectModal();
  const trackEvent = useTrackEvent();

  const onConnectWallet = React.useCallback(() => {
    openConnectWalletModal(WalletActionType.link);
    trackEvent('Earn Early Access - Elegibility confirmation - Link wallet');
  }, [openConnectWalletModal, trackEvent]);
  return (
    <>
      <TitleContainer>
        <StyledTitle>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.not-eligible.title"
            defaultMessage="You're Not Eligible 😔"
          />
        </StyledTitle>
        <StyledDescription>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.not-eligible.description"
            defaultMessage="It seems none of your wallets meet the criteria for Earn Early Access. Don't worry! You can still join by trying another wallet or finding a referral code on our Discord or Twitter!"
          />
        </StyledDescription>
      </TitleContainer>
      <Button variant="outlined" onClick={onConnectWallet}>
        <FormattedMessage
          description="earn-access-now.eligibility.confirmation.not-eligible.button"
          defaultMessage="Try with another wallet"
        />
      </Button>
    </>
  );
};

export const ElegibleCase = () => {
  // TODO: Specify elegible wallet address if isAuth

  return (
    <>
      <TitleContainer>
        <StyledTitle>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.eligible.title"
            defaultMessage="You're Eligible for Earn Early Access! 🎉"
          />
        </StyledTitle>
        <StyledDescription>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.eligible.description"
            defaultMessage="Your wallet meets the eligibility criteria. <b>You now have full access to Earn with all your connected wallets</b>. Start exploring yield strategies today!"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
            }}
          />
        </StyledDescription>
      </TitleContainer>
      <ClaimEarnButton />
    </>
  );
};

export const NeedsSignatureCase = ({
  elegibleWallets,
  setStatus,
}: {
  elegibleWallets: ViemAddress[];
  setStatus: (status: ElegibilityConfirmationStatus) => void;
}) => {
  const intl = useIntl();
  const wallets = useWallets();
  const [walletToSign, setWalletToSign] = React.useState<ViemAddress | undefined>();
  const wallet = useWallet(walletToSign || '');
  const openConnectWalletModal = useOpenConnectModal();
  const trackEvent = useTrackEvent();

  const isWalletConnected = wallet?.status === WalletStatus.connected;
  const selectedWalletDisplay = getDisplayWallet(wallet);

  React.useEffect(() => {
    if (elegibleWallets.length === 1) {
      setWalletToSign(elegibleWallets[0]);
    }
  }, [elegibleWallets]);

  const requestSignature = () => {
    if (!walletToSign) return;
    trackEvent('Earn Early Access - Elegibility needs signature - Request signature');
    // TODO: Request signature
    setStatus(ElegibilityConfirmationStatus.OWNERSHIP_CONFIRMED);
  };

  const onConnectWallet = () => {
    openConnectWalletModal(WalletActionType.link);
    trackEvent('Earn Early Access - Elegibility needs signature - Link wallet');
  };

  return (
    <>
      <TitleContainer>
        <StyledTitle>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.needs-signature.title"
            defaultMessage="You're Eligible for Earn Early Access! 🎉"
          />
        </StyledTitle>
        <StyledDescription>
          {wallets.length === 1 ? (
            <FormattedMessage
              description="earn-access-now.eligibility.confirmation.needs-signature.description"
              defaultMessage="Your wallet {walletAddress} meets the eligibility criteria. <b>Please sign to confirm ownership</b>, and you'll unlock Earn Early Access for all your connected wallets."
              values={{
                walletAddress: getDisplayWallet(wallets[0]),
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              }}
            />
          ) : (
            <FormattedMessage
              description="earn-access-now.eligibility.confirmation.needs-signature.description"
              defaultMessage="The following wallets meet the eligibility criteria. <b>Please choose one and sign to confirm ownership</b>, and you'll unlock Earn Early Access for all your connected wallets."
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              }}
            />
          )}
        </StyledDescription>
      </TitleContainer>
      <ContainerBox flexDirection="column" gap={4} fullWidth>
        {elegibleWallets.length > 1 &&
          elegibleWallets.map((walletAddress, index) => (
            <>
              <ContainerBox
                key={walletAddress}
                justifyContent="space-between"
                alignItems="center"
                onClick={() => setWalletToSign(walletAddress)}
                style={{ cursor: 'pointer' }}
                fullWidth
              >
                <ContainerBox gap={2} alignItems="center">
                  <Radio checked={walletAddress === walletToSign} />
                  <DividerBorder2 orientation="vertical" flexItem />
                  <Typography variant="bodyRegular" color={({ palette }) => colors[palette.mode].typography.typo3}>
                    <Address address={walletAddress} trimAddress showDetailsOnHover />
                  </Typography>
                </ContainerBox>
                <CheckCircleOutlineIcon
                  sx={({ palette }) => ({ color: colors[palette.mode].semantic.success.darker })}
                />
              </ContainerBox>
              {index < elegibleWallets.length - 1 && <DividerBorder1 key={`divider-${index}`} />}
            </>
          ))}
      </ContainerBox>
      {isWalletConnected || !walletToSign ? (
        <Button variant="contained" onClick={requestSignature} disabled={!walletToSign}>
          <FormattedMessage
            description="earn-access-now.eligibility.confirmation.needs-signature.button"
            defaultMessage="Sign to confirm ownership"
          />
        </Button>
      ) : (
        <Button variant="contained" onClick={onConnectWallet}>
          <FormattedMessage
            description="reconnect wallet"
            defaultMessage="Switch to {wallet}'s Wallet"
            values={{
              wallet: selectedWalletDisplay
                ? `${selectedWalletDisplay}`
                : intl.formatMessage(
                    defineMessage({
                      description: 'reconnectWalletFallback',
                      defaultMessage: 'Owner',
                    })
                  ),
            }}
          />
        </Button>
      )}
    </>
  );
};

export const OwnershipConfirmedCase = () => (
  <>
    <TitleContainer>
      <StyledTitle>
        <FormattedMessage
          description="earn-access-now.eligibility.confirmation.ownership-confirmed.title"
          defaultMessage="Ownership confirmed! 💪🏼"
        />
      </StyledTitle>
      <StyledDescription>
        <FormattedMessage
          description="earn-access-now.eligibility.confirmation.ownership-confirmed.description"
          defaultMessage="You now have Early Access with all your connected wallets. Welcome to Earn!"
        />
      </StyledDescription>
    </TitleContainer>
    <ClaimEarnButton />
  </>
);

export const CodeSuccessfullyClaimed = () => (
  <>
    <TitleContainer>
      <StyledTitle>
        <FormattedMessage
          description="earn-access-now.eligibility.confirmation.code-successfully-claimed.title"
          defaultMessage="Early Access Unlocked! 🎉"
        />
      </StyledTitle>
      <StyledDescription>
        <FormattedMessage
          description="earn-access-now.eligibility.confirmation.code-successfully-claimed.description"
          defaultMessage="Start exploring exclusive strategies, secure your investments, and grow your returns."
        />
      </StyledDescription>
    </TitleContainer>
    <ClaimEarnButton />
  </>
);
