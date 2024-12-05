import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useTrackEvent from '@hooks/useTrackEvent';
import useUser from '@hooks/useUser';
import { WalletActionType } from '@services/accountService';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Button, CircularProgress, colors, ContainerBox, TextField, Typography } from 'ui-library';

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({
  variant: 'outlined',
})`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  gap: ${({ theme: { spacing } }) => spacing(6)};
  background-color: ${({ theme: { palette } }) => colors[palette.mode].background.tertiary};
`;

const ClaimCodeForm = () => {
  const intl = useIntl();
  const user = useUser();
  const [accessCode, setAccessCode] = React.useState('');
  const [validationState, setValidationState] = React.useState<{
    error: boolean;
    helperText: string;
    isLoading: boolean;
  }>({
    error: false,
    helperText: '',
    isLoading: false,
  });
  const trackEvent = useTrackEvent();

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
    // TODO: Differentiate between invalid code and already redeemed code
    // Simulate API call delay
    const isCodeValid = Math.random() < 0.5;
    setValidationState((prev) => ({ ...prev, isLoading: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isCodeValid) {
      setValidationState({
        error: false,
        helperText: '',
        isLoading: false,
      });
    } else {
      setValidationState({
        error: true,
        helperText: intl.formatMessage(
          defineMessage({
            description: 'earn-access-now.claim-code-form.error',
            defaultMessage: 'The code entered is either invalid or has already been redeemed.',
          })
        ),
        isLoading: false,
      });
    }
  }, [intl]);

  return (
    <StyledBackgroundPaper>
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
          <Button
            variant="contained"
            onClick={validateCode}
            disabled={validationState.isLoading || accessCode.length < 9}
          >
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
    </StyledBackgroundPaper>
  );
};

export default ClaimCodeForm;
