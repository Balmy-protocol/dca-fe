import useTierLevel from '@hooks/tiers/useTierLevel';
import usePrevious from '@hooks/usePrevious';
import useAnalytics from '@hooks/useAnalytics';
import { TIER_LEVEL_OPTIONS, TIER_LEVEL_UP_REWARDS } from '@pages/tier-view/constants';
import React from 'react';
import { useIntl, defineMessage, FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ActiveTiersIcons, colors, ContainerBox, Modal, ModalProps, Typography } from 'ui-library';
import { maxUint256 } from 'viem';
import confetti from 'canvas-confetti';
import { isNil } from 'lodash';

const StyledTierLevelSpan = styled(Typography).attrs({ variant: 'h3Bold' })`
  ${({ theme: { palette } }) => `
    background: ${palette.gradient.tierLevel};
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const LevelUpModal = ({}) => {
  const intl = useIntl();
  const { tierLevel } = useTierLevel();
  const previousTierLevel = usePrevious(tierLevel);
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (tierLevel !== previousTierLevel && !isNil(tierLevel) && tierLevel > (previousTierLevel ?? maxUint256)) {
      setIsOpen(true);
      // give it a bit to render correctly
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        confetti({
          spread: 70,
          angle: 60,
          origin: { x: 0 },
          zIndex: 2000,
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        confetti({
          spread: 70,
          angle: 120,
          origin: { x: 1 },
          zIndex: 2000,
        });
      }, 100);
    }
  }, [tierLevel, previousTierLevel]);

  const actions = React.useMemo(
    () =>
      [
        {
          label: intl.formatMessage(
            defineMessage({
              defaultMessage: 'Got it!',
              description: 'level-up-modal.got-it',
            })
          ),
          onClick: () => {
            trackEvent('Level up modal - close');
            setIsOpen(false);
          },
          variant: 'contained',
        },
      ] as ModalProps['actions'],
    [intl]
  );

  if (isNil(tierLevel)) return null;

  const tierName = TIER_LEVEL_OPTIONS[tierLevel].title;
  const TierIcon = ActiveTiersIcons[tierLevel];

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      showCloseButton={false}
      showCloseIcon={false}
      actions={actions}
      maxWidth="sm"
      actionsAlignment="horizontal"
    >
      <ContainerBox gap={6} flexDirection="column">
        <ContainerBox gap={2} flexDirection="column" justifyContent="center">
          <Typography
            variant="h3Bold"
            textAlign="center"
            color={({ palette }) => colors[palette.mode].typography.typo1}
          >
            <FormattedMessage
              description="level-up-modal.title"
              defaultMessage="Congratulations! You have reached <span>Tier {tierLevel} · {tierName}</span>"
              values={{
                tierLevel,
                tierName: intl.formatMessage(tierName),
                span: (chunks: React.ReactNode) => <StyledTierLevelSpan>{chunks}</StyledTierLevelSpan>,
              }}
            />
          </Typography>
          <Typography
            variant="bodyLargeRegular"
            textAlign="center"
            color={({ palette }) => colors[palette.mode].typography.typo2}
          >
            <FormattedMessage
              description="level-up-modal.subtitle"
              defaultMessage="You have unlocked your new tier, you are getting so much cool stuff! <b>All your {previousTier} benefits plus:</b>"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                previousTier: intl.formatMessage(TIER_LEVEL_OPTIONS[tierLevel].title),
              }}
            />
          </Typography>
        </ContainerBox>
        <ContainerBox gap={8} alignItems="center" justifyContent="center">
          <TierIcon size="5.375rem" />
          <ContainerBox gap={2} flexDirection="column" alignItems="flex-start">
            {TIER_LEVEL_UP_REWARDS[tierLevel].map((reward, index) => (
              <ContainerBox key={index} gap={2} alignItems="center">
                {reward.icon}
                <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
                  {intl.formatMessage(reward.description)}
                </Typography>
              </ContainerBox>
            ))}
          </ContainerBox>
        </ContainerBox>
      </ContainerBox>
    </Modal>
  );
};

export default LevelUpModal;
