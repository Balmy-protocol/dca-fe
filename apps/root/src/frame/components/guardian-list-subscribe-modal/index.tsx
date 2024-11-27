import useMeanApiService from '@hooks/useMeanApiService';
import useUser from '@hooks/useUser';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  Modal,
  SPACING,
  TextField,
  Typography,
  BalmyLogoSmallDark,
  ModalProps,
  LinearProgress,
  DonutShape,
  CoinStar,
} from 'ui-library';

interface GuardianListSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum ModalStatus {
  confirm = 'confirm',
  loading = 'loading',
  success = 'success',
  error = 'error',
}

const StyledContainer = styled(ContainerBox).attrs({ gap: 6, flexDirection: 'column' })`
  ${({ theme: { spacing } }) => `
    margin-top: ${spacing(7)};
    padding-top: ${spacing(6)};
  `}
`;

const StyledHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between' })`
  background: linear-gradient(180deg, #eadbff 25.13%, rgba(211, 180, 255, 0.8) 100%);
  ${({ theme: { spacing } }) => `
    height: ${spacing(24)};
  `}
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
`;

const StyledHeaderContent = styled(ContainerBox).attrs({ gap: 3, alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(5)} ${spacing(12)};
  `}
`;

export const validateEmailAddress = (address: string) => {
  const validRegex = RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/);
  return validRegex.test(address);
};

const GuardianListSubscribeModal = ({ isOpen, onClose }: GuardianListSubscribeModalProps) => {
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
                  defineMessage({ description: 'earn.subscribe.modal.confirm', defaultMessage: 'Request Early Access' })
                ),
                onClick: handleConfirm,
                variant: 'contained',
              },
            ]
          : []),
      ] as ModalProps['actions'],
    [status, handleConfirm, intl]
  );

  const showErrorMessage = isSubmitted && !validateEmailAddress(email);

  return (
    <Modal open={isOpen} onClose={onClose} showCloseIcon maxWidth="sm" actions={actions}>
      <StyledContainer>
        <StyledHeader>
          <StyledHeaderContent>
            <BalmyLogoSmallDark size={SPACING(7)} />
            <ContainerBox alignItems="center">
              <Typography variant="h3Bold" color={({ palette: { mode } }) => colors[mode].accent.primary}>
                <FormattedMessage description="earn.subscribe.modal.title.earn" defaultMessage="Earn's" />
              </Typography>
              <Typography
                variant="h3Bold"
                color={({ palette: { mode } }) => colors[mode].typography.typo1}
                sx={({ spacing }) => ({ paddingLeft: spacing(2) })}
              >
                <FormattedMessage description="earn.subscribe.modal.title" defaultMessage="Early Access" />
              </Typography>
            </ContainerBox>
          </StyledHeaderContent>
          <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
            <div style={{ position: 'absolute' }}>
              <DonutShape width="120px" height="120px" top={SPACING(10)} />
            </div>
            <div style={{ position: 'absolute', bottom: '5px' }}>
              <CoinStar right={SPACING(25)} />
            </div>
          </ContainerBox>
        </StyledHeader>
        <Typography
          variant="bodyRegular"
          textAlign="center"
          color={({ palette: { mode } }) => colors[mode].typography.typo2}
        >
          <FormattedMessage
            description="earn.subscribe.modal.description"
            defaultMessage="<b>Be among the first to experience our new Earn feature</b>. Help us test, provide feedback, and shape the final product. By joining, you'll get early access, exclusive features, and the opportunity to influence how we develop Earn."
            values={{
              b: (chunks) => <b>{chunks}</b>,
            }}
          />
        </Typography>
        {(status === ModalStatus.confirm || status === ModalStatus.error) && (
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage
                description="earn.subscribe.modal.enter-email.label"
                defaultMessage="Enter your email to participate"
              />
            </Typography>
            <TextField
              fullWidth
              placeholder={intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Your Email Address',
                  description: 'earn.subscribe.modal.enter-email.input.placeholder',
                })
              )}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status !== ModalStatus.confirm}
              error={showErrorMessage}
              helperText={
                showErrorMessage
                  ? intl.formatMessage(
                      defineMessage({
                        description: 'earn.subscribe.modal.enter-email.input.error',
                        defaultMessage: 'The email address is not valid',
                      })
                    )
                  : undefined
              }
            />
            <Typography variant="bodyExtraSmall" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
              <FormattedMessage
                description="earn.subscribe.modal.disclaimer"
                defaultMessage="Once you're in, you'll receive access, and we'll notify you as soon as it's ready."
              />
            </Typography>
            {status === ModalStatus.error && (
              <Typography
                variant="bodySmallSemibold"
                textAlign="center"
                color={({ palette: { mode } }) => colors[mode].semantic.error.darker}
              >
                <FormattedMessage
                  description="earn.subscribe.modal.error"
                  defaultMessage="There was a problem subscribing you, please try again later"
                />
              </Typography>
            )}
          </ContainerBox>
        )}
        {status === ModalStatus.loading && (
          <>
            <Typography variant="bodyBold" textAlign="center">
              <FormattedMessage
                description="earn.subscribe.modal.loading"
                defaultMessage="Subscribing you! Please wait..."
              />
            </Typography>
            <LinearProgress variant="indeterminate" />
          </>
        )}
        {status === ModalStatus.success && (
          <Typography
            variant="bodyBold"
            textAlign="center"
            color={({ palette: { mode } }) => colors[mode].semantic.success.darker}
          >
            <FormattedMessage
              description="earn.subscribe.modal.success"
              defaultMessage="Thank you! You're now on the list. We'll notify you as soon as it's ready."
            />
          </Typography>
        )}
      </StyledContainer>
    </Modal>
  );
};

export default GuardianListSubscribeModal;
