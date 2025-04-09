import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useMeanApiService from '@hooks/useMeanApiService';
import useUser from '@hooks/useUser';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { colors, ContainerBox, Modal, Typography, TextField, ModalProps, SuccessCircleIcon } from 'ui-library';

enum ModalStatus {
  confirm = 'confirm',
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export const validateEmailAddress = (address: string) => {
  const validRegex = RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/);
  return validRegex.test(address);
};

const ErrorAndConfirmContent = ({
  email,
  setEmail,
  hasSubmitted,
}: {
  email: string;
  setEmail: (email: string) => void;
  hasSubmitted: boolean;
  isValidEmail: boolean;
}) => {
  const intl = useIntl();
  const showErrorMessage = React.useMemo(() => hasSubmitted && !validateEmailAddress(email), [hasSubmitted, email]);

  return (
    <>
      <ContainerBox flexDirection="column" gap={1} style={{ textAlign: 'left' }}>
        <Typography variant="h6" color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo1 })}>
          <FormattedMessage
            description="earn.all-strategies-table.notify-email-vaults.heading"
            defaultMessage="Be the First to Know"
          />
        </Typography>
        <Typography variant="bodyRegular" color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo2 })}>
          <FormattedMessage
            description="earn.all-strategies-table.notify-email-vaults.subheading"
            defaultMessage="We’re constantly launching new vault strategies. Subscribe and we’ll notify you as soon as they go live — so you never miss an opportunity to earn more."
          />
        </Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={2} style={{ textAlign: 'left' }}>
        <Typography
          variant="bodySmallSemibold"
          color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo4 })}
        >
          <FormattedMessage
            description="earn.all-strategies-table.notify-email-vaults.email-label"
            defaultMessage="Email"
          />
        </Typography>
        <TextField
          fullWidth
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Enter your email',
              description: 'earn.all-strategies-table.notify-email-vaults.email-placeholder',
            })
          )}
          value={email}
          error={showErrorMessage}
          helperText={
            showErrorMessage
              ? intl.formatMessage(
                  defineMessage({
                    description: 'earn.all-strategies-table.notify-email-vaults.invalid-email',
                    defaultMessage: 'Invalid email',
                  })
                )
              : ''
          }
          onChange={(e) => setEmail(e.target.value)}
        />
      </ContainerBox>
    </>
  );
};

const LoadingContent = () => {
  return (
    <ContainerBox flexDirection="column" gap={4} alignItems="center" justifyContent="center">
      <Typography variant="bodyBold" textAlign="center">
        <FormattedMessage
          description="earn.all-strategies-table.notify-email-vaults.loading"
          defaultMessage="Subscribing you! Please wait..."
        />
      </Typography>
      <CenteredLoadingIndicator size={40} />
    </ContainerBox>
  );
};

const SuccessContent = () => {
  return (
    <ContainerBox
      flexDirection="column"
      gap={6}
      style={{ textAlign: 'left' }}
      alignItems="center"
      justifyContent="center"
    >
      <SuccessCircleIcon size="75px" fontSize="inherit" />
      <ContainerBox flexDirection="column" gap={2} alignItems="center" justifyContent="center">
        <Typography variant="h6" textAlign="center">
          <FormattedMessage
            description="earn.all-strategies-table.notify-email-vaults.success"
            defaultMessage="You are on the list!"
          />
        </Typography>
        <Typography
          variant="bodyRegular"
          textAlign="center"
          color={({ palette: { mode } }) => ({ color: colors[mode].typography.typo2 })}
        >
          <FormattedMessage
            description="earn.all-strategies-table.notify-email-vaults.success-subtitle"
            defaultMessage="We'll notify you as soon as we launch new vault strategies."
          />
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

const NotifyEmailModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [status, setStatus] = React.useState<ModalStatus>(ModalStatus.confirm);
  const intl = useIntl();
  const [email, setEmail] = React.useState<string>('');
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const user = useUser();
  const meanApiService = useMeanApiService();

  React.useEffect(() => {
    // reset the form when the modal is closed
    if (!isOpen) {
      setEmail('');
      setIsSubmitted(false);
      setStatus(ModalStatus.confirm);
    }
  }, [isOpen]);

  const handleConfirm = React.useCallback(() => {
    const sendConfirm = async () => {
      setIsSubmitted(true);
      if (!validateEmailAddress(email)) return;

      try {
        setStatus(ModalStatus.loading);
        await meanApiService.subscribeEmailToMaillist(email, user?.id);
        setStatus(ModalStatus.success);
      } catch (e) {
        setStatus(ModalStatus.error);
      }
    };

    void sendConfirm();
  }, [email, setStatus, setEmail, user]);

  const actions = React.useMemo(
    () =>
      [
        ...(status === ModalStatus.confirm || status === ModalStatus.error
          ? [
              {
                label: intl.formatMessage(
                  defineMessage({
                    description: 'earn.all-strategies-table.notify-email-vaults.subscribe',
                    defaultMessage: 'Subscribe',
                  })
                ),
                onClick: handleConfirm,
                variant: 'contained',
              },
            ]
          : []),
      ] as ModalProps['actions'],
    [status, handleConfirm, intl]
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeOnBackdrop={status !== ModalStatus.loading}
      maxWidth="sm"
      showCloseIcon={status !== ModalStatus.loading}
      showCloseButton={status === ModalStatus.success}
      actions={actions}
    >
      <ContainerBox flexDirection="column" gap={6} style={{ textAlign: 'left' }}>
        {(status === ModalStatus.confirm || status === ModalStatus.error) && (
          <ErrorAndConfirmContent
            email={email}
            setEmail={setEmail}
            hasSubmitted={isSubmitted}
            isValidEmail={validateEmailAddress(email)}
          />
        )}
        {status === ModalStatus.loading && <LoadingContent />}
        {status === ModalStatus.success && <SuccessContent />}
      </ContainerBox>
    </Modal>
  );
};

export default NotifyEmailModal;
