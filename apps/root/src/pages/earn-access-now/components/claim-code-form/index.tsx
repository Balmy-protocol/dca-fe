import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useUser from '@hooks/useUser';
import { WalletActionType } from '@services/accountService';
import useAccountService from '@hooks/useAccountService';
import useAnalytics from '@hooks/useAnalytics';
import confetti from 'canvas-confetti';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  BackgroundPaper,
  Button,
  CircularProgress,
  colors,
  ContainerBox,
  TextField,
  Typography,
  Zoom,
} from 'ui-library';
import { CodeSuccessfullyClaimed } from '../elegibility-confirmation/use-cases';
import { useSearchParams } from 'react-router-dom';

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({
  variant: 'outlined',
})`
  min-height: ${({ theme: { spacing } }) => spacing(77)};
  display: flex;
  justify-content: center;
  height: 100%;
  background-color: ${({ theme: { palette } }) => colors[palette.mode].background.tertiary};
`;

const ClaimCodeForm = () => {
  const intl = useIntl();
  const user = useUser();
  const accountService = useAccountService();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');
  const [accessCode, setAccessCode] = React.useState(inviteCode || '');
  const [validationState, setValidationState] = React.useState<{
    isSuccess: boolean;
    error: boolean;
    helperText: string;
    isLoading: boolean;
  }>({
    isSuccess: false,
    error: false,
    helperText: '',
    isLoading: false,
  });
  const { trackEvent } = useAnalytics();

  const openConnectWalletModal = useOpenConnectModal();

  const isLoggedIn = !!user;

  const onConnectWallet = React.useCallback(() => {
    openConnectWalletModal(WalletActionType.connect);
    trackEvent('Earn Early Access - Claim code form - Connect wallet');
  }, [openConnectWalletModal]);

  const handleChangeAccessCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessCode(e.target.value);
    if (validationState.error) {
      setValidationState((prev) => ({ ...prev, error: false, helperText: '' }));
    }
  };

  const validateCode = React.useCallback(async () => {
    if (accessCode.length < 9) {
      setValidationState({
        isSuccess: false,
        error: true,
        helperText: intl.formatMessage(
          defineMessage({
            description: 'earn-access-now.claim-code-form.error.invalid',
            defaultMessage: 'The code entered is invalid.',
          })
        ),
        isLoading: false,
      });
      return;
    }

    trackEvent('Earn - Early Access - Attempt to claim code');
    setValidationState((prev) => ({ ...prev, isLoading: true }));
    const response = await accountService.claimEarnInviteCode({ inviteCode: accessCode });
    switch (response.status) {
      case 200:
        trackEvent('Earn - Early Access - Code claimed');

        setValidationState({
          isSuccess: true,
          error: false,
          helperText: '',
          isLoading: false,
        });
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
        break;
      case 404:
        trackEvent('Earn - Early Access - Code claim invalid');
        setValidationState({
          isSuccess: false,
          error: true,
          helperText: intl.formatMessage(
            defineMessage({
              description: 'earn-access-now.claim-code-form.error.invalid',
              defaultMessage: 'The code entered is invalid.',
            })
          ),
          isLoading: false,
        });
        break;
      case 400:
        trackEvent('Earn - Early Access - Code already claimed');
        setValidationState({
          isSuccess: false,
          error: true,
          helperText: intl.formatMessage(
            defineMessage({
              description: 'earn-access-now.claim-code-form.error.claimed',
              defaultMessage: 'This code has already been redeemed.',
            })
          ),
          isLoading: false,
        });
        break;
      default:
        trackEvent('Earn - Early Access - Code claim unknown error');
        setValidationState({
          isSuccess: false,
          error: true,
          helperText: intl.formatMessage(
            defineMessage({
              description: 'earn-access-now.claim-code-form.error.unknown',
              defaultMessage: 'An unknown error occurred.',
            })
          ),
          isLoading: false,
        });
    }
  }, [intl, accessCode]);

  return (
    <StyledBackgroundPaper>
      {validationState.isSuccess ? (
        <Zoom in={validationState.isSuccess}>
          <ContainerBox flexDirection="column" gap={8} alignItems="center" justifyContent="center">
            <CodeSuccessfullyClaimed />
          </ContainerBox>
        </Zoom>
      ) : (
        <ContainerBox flexDirection="column" gap={6} justifyContent="space-between">
          <ContainerBox flexDirection="column" gap={6}>
            <ContainerBox flexDirection="column" gap={2}>
              <Typography variant="h5Bold" color={({ palette }) => colors[palette.mode].typography.typo1}>
                <FormattedMessage
                  description="earn-access-now.claim-code-form.title"
                  defaultMessage="Do you have an Access Code?"
                />
              </Typography>
              <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
                <FormattedMessage
                  description="earn-access-now.claim-code-form.description"
                  defaultMessage="Enter the code you received <b>via email or a referral code</b> to access to Earn and start exploring its benefits."
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                  }}
                />
              </Typography>
            </ContainerBox>
            <ContainerBox flexDirection="column" gap={2}>
              <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
                <FormattedMessage description="earn-access-now.claim-code-form.label" defaultMessage="Access Code" />
              </Typography>
              <TextField
                id="accessCode"
                value={accessCode}
                onChange={handleChangeAccessCode}
                placeholder={intl.formatMessage(
                  defineMessage({
                    description: 'earn-access-now.claim-code-form.placeholder',
                    defaultMessage: 'Enter code',
                  })
                )}
                autoComplete="off"
                autoCorrect="off"
                error={validationState.error}
                helperText={validationState.helperText}
                disabled={validationState.isLoading}
                fullWidth
                type="text"
              />
            </ContainerBox>
          </ContainerBox>
          <ContainerBox justifyContent="flex-start" alignItems="center" gap={2}>
            {isLoggedIn ? (
              <Button variant="contained" onClick={validateCode} disabled={validationState.isLoading}>
                <FormattedMessage description="earn-access-now.claim-code-form.button" defaultMessage="Validate Code" />
              </Button>
            ) : (
              <Button variant="contained" onClick={onConnectWallet}>
                <FormattedMessage
                  description="earn-access-now.claim-code-form.connect-wallet"
                  defaultMessage="Connect Wallet"
                />
              </Button>
            )}
            {validationState.isLoading && <CircularProgress size={20} />}
          </ContainerBox>
        </ContainerBox>
      )}
    </StyledBackgroundPaper>
  );
};

export default ClaimCodeForm;
