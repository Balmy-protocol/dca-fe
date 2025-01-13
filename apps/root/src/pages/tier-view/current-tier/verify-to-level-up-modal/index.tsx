import Address from '@common/components/address';
import { trimAddress } from '@common/utils/parsing';
import useTierLevel from '@hooks/tiers/useTierLevel';
import useWalletAchievements from '@hooks/tiers/useWalletAchievements';
import useAccountService from '@hooks/useAccountService';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useAnalytics from '@hooks/useAnalytics';
import useWallets from '@hooks/useWallets';
import { TIER_LEVEL_OPTIONS, TIER_LEVEL_UP_REWARDS } from '@pages/tier-view/constants';
import { WalletActionType } from '@services/accountService';
import { WalletStatus, Address as ViewAddress, AchievementKeys, Wallet, Achievement } from 'common-types';
import React from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import styled from 'styled-components';
import { withStyles } from 'tss-react/mui';
import {
  ActiveTiersIcons,
  Button,
  colors,
  ContainerBox,
  DividerBorder2,
  InfoCircleIcon,
  LinearProgress,
  LinearProgressProps,
  Modal,
  ModalProps,
  StyledBodySmallLabelTypography,
  SuccessCircleIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useSnackbar,
} from 'ui-library';

interface VerifyToLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum ModalStep {
  singleWallet = 'single-wallet',
  multipleWallets = 'multiple-wallets',
}

const StyledTierLevelSpan = styled(Typography).attrs({ variant: 'h3Bold' })`
  ${({ theme: { palette } }) => `
    background: ${palette.gradient.tierLevel};
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`;

const StyledInfoAddressSpan = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].semantic.informative.primary};
    font-weight: 700;
  `}
`;

const StyledProgressToNextTierSpan = styled(Typography).attrs({ variant: 'labelLarge' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo5};
  `}
`;

const SINGLE_WALLET_MESSAGE = defineMessage({
  defaultMessage:
    '<b>To proceed, please connect your <span>{address}</span> wallet and sign with it</b>. This step ensures that the progress linked to this wallet is validated.',
  description: 'tier-view.verify-to-level-up-modal.info-message-single-wallet',
});

const MULTIPLE_WALLETS_MESSAGE = defineMessage({
  defaultMessage:
    '<b>To proceed, please sign ownership with the wallet(s) that meet the Tier {tierLevel} criteria.</b> This step ensures that the progress linked to this wallet is validated.',
  description: 'tier-view.verify-to-level-up-modal.info-message-multiple-wallets',
});

const SingleWalletStep = ({
  currentTierLevel,
  walletsToVerify,
}: {
  currentTierLevel: number;
  walletsToVerify: ViewAddress[];
}) => {
  const nextTierLevel = currentTierLevel + 1;
  const NextTierIcon = ActiveTiersIcons[nextTierLevel];
  const tierName = TIER_LEVEL_OPTIONS[nextTierLevel].title;
  const intl = useIntl();

  const infoMessage = walletsToVerify.length === 1 ? SINGLE_WALLET_MESSAGE : MULTIPLE_WALLETS_MESSAGE;
  return (
    <>
      <ContainerBox gap={2} flexDirection="column" justifyContent="center">
        <Typography variant="h3Bold" textAlign="center" color={({ palette }) => colors[palette.mode].typography.typo1}>
          <FormattedMessage
            description="tier-view.verify-to-level-up-modal.single-wallet.title"
            defaultMessage="Verify ownership to unlock <span>Tier {tierLevel} · {tierName}</span>"
            values={{
              tierLevel: nextTierLevel,
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
            description="tier-view.verify-to-level-up-modal.single-wallet.subtitle"
            defaultMessage="You're one step away from unlocking your next tier! <b>All your {previousTier} benefits plus:</b>"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              previousTier: intl.formatMessage(TIER_LEVEL_OPTIONS[currentTierLevel].title),
            }}
          />
        </Typography>
      </ContainerBox>
      <ContainerBox gap={8} alignItems="center" justifyContent="center">
        <NextTierIcon size="5.375rem" />
        <ContainerBox gap={2} flexDirection="column" alignItems="flex-start">
          {TIER_LEVEL_UP_REWARDS[nextTierLevel].map((reward, index) => (
            <ContainerBox key={index} gap={2} alignItems="center">
              {reward.icon}
              <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
                {intl.formatMessage(reward.description)}
              </Typography>
            </ContainerBox>
          ))}
        </ContainerBox>
      </ContainerBox>
      <DividerBorder2 />
      <ContainerBox gap={2} alignItems="center">
        <InfoCircleIcon
          sx={({ palette }) => ({
            color: colors[palette.mode].semantic.informative.primary,
            transform: 'rotate(180deg)',
          })}
          fontSize="large"
        />
        <Typography variant="bodyRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
          {intl.formatMessage(infoMessage, {
            address: trimAddress(walletsToVerify[0] || ''),
            tierLevel: nextTierLevel,
            b: (chunks: React.ReactNode) => <b>{chunks}</b>,
            span: (chunks: React.ReactNode) => <StyledInfoAddressSpan>{chunks}</StyledInfoAddressSpan>,
          })}
        </Typography>
      </ContainerBox>
    </>
  );
};

const StyledProgressToNextTierContainer = styled(ContainerBox).attrs({ gap: 3, flex: 1, alignItems: 'center' })`
  ${({ theme: { palette, spacing } }) => `
    background: ${colors[palette.mode].background.quartery};
    padding: ${spacing(6)};
    border-radius: ${spacing(4)};
    border: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const StyledProgressToNextTierProgressBar = withStyles(
  ({ variant = 'determinate', ...props }: LinearProgressProps) => <LinearProgress variant={variant} {...props} />,
  ({ palette: { mode } }) => ({
    root: {
      background: colors[mode].border.border2,
    },
    bar: {
      background: colors[mode].accent.primary,
    },
  })
);

// This should be smarter but untill we decide to modify the tiers requirements, we dont need something that more complex
const getTierProgress = (missing: Partial<Record<AchievementKeys, { current: number; required: number }>>) => {
  if (missing[AchievementKeys.SWAP_VOLUME] && missing[AchievementKeys.MIGRATED_VOLUME]) {
    return {
      current: Math.max(missing[AchievementKeys.SWAP_VOLUME].current, missing[AchievementKeys.MIGRATED_VOLUME].current),
      required: Math.max(
        missing[AchievementKeys.SWAP_VOLUME].required,
        missing[AchievementKeys.MIGRATED_VOLUME].required
      ),
    };
  } else if (missing[AchievementKeys.SWAP_VOLUME]) {
    return {
      current: missing[AchievementKeys.SWAP_VOLUME].current,
      required: missing[AchievementKeys.SWAP_VOLUME].required,
    };
  } else if (missing[AchievementKeys.MIGRATED_VOLUME]) {
    return {
      current: missing[AchievementKeys.MIGRATED_VOLUME].current,
      required: missing[AchievementKeys.MIGRATED_VOLUME].required,
    };
  }

  return { current: 0, required: 0 };
};

const getTierProgressPrefix = (missing: Partial<Record<AchievementKeys, { current: number; required: number }>>) => {
  if (missing[AchievementKeys.SWAP_VOLUME] || missing[AchievementKeys.MIGRATED_VOLUME]) {
    return '$';
  }

  return '';
};

const StyledVerifiedPillContainer = styled(ContainerBox).attrs({
  gap: 1,
  alignItems: 'center',
  justifyContent: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    background: ${colors[palette.mode].background.secondary};
    border-radius: ${spacing(25)};
    padding: ${spacing(1)} ${spacing(2)};
    border: 1px solid ${colors[palette.mode].semantic.success.darker};
  `}
`;

const VerifiedPill = () => (
  <StyledVerifiedPillContainer>
    <SuccessCircleIcon
      fontSize="small"
      sx={({ palette }) => ({ color: colors[palette.mode].semantic.success.darker })}
    />
    <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
      <FormattedMessage
        description="tier-view.verify-to-level-up-modal.multiple-wallets.verified"
        defaultMessage="Verified"
      />
    </Typography>
  </StyledVerifiedPillContainer>
);

const ACHIEVEMENT_KEY_TO_VERB: Record<AchievementKeys, MessageDescriptor> = {
  [AchievementKeys.SWAP_VOLUME]: defineMessage({
    defaultMessage: 'Swap',
    description: 'tier-view.verify-to-level-up-modal.multiple-wallets.achievement-key-to-verb.swap-volume',
  }),
  [AchievementKeys.MIGRATED_VOLUME]: defineMessage({
    defaultMessage: 'Migrate',
    description: 'tier-view.verify-to-level-up-modal.multiple-wallets.achievement-key-to-verb.migrated-volume',
  }),
  [AchievementKeys.TWEET]: defineMessage({
    defaultMessage: 'Share',
    description: 'tier-view.verify-to-level-up-modal.multiple-wallets.achievement-key-to-verb.tweet-shared',
  }),
  [AchievementKeys.REFERRALS]: defineMessage({
    defaultMessage: 'Refer',
    description: 'tier-view.verify-to-level-up-modal.multiple-wallets.achievement-key-to-verb.referrals',
  }),
};

const ACHIEVEMENT_KEY_PREFIX: Record<AchievementKeys, string> = {
  [AchievementKeys.SWAP_VOLUME]: '$',
  [AchievementKeys.MIGRATED_VOLUME]: '$',
  [AchievementKeys.TWEET]: '',
  [AchievementKeys.REFERRALS]: '',
};

const WalletsTableHeader = () => (
  <TableRow sx={{ backgroundColor: 'transparent !important' }}>
    <TableCell sx={{ width: '38%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage
          description="tier-view.verify-to-level-up-modal.multiple-wallets.wallet"
          defaultMessage="Wallet"
        />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '38%' }}>
      <StyledBodySmallLabelTypography>
        <FormattedMessage
          description="tier-view.verify-to-level-up-modal.multiple-wallets.achievements"
          defaultMessage="Achievements"
        />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell sx={{ width: '24%' }}></TableCell>
  </TableRow>
);

const WalletsBodyItem = ({
  wallet,
  walletAchievements,
  onVerify,
  onSwitch,
  missingAchievements,
}: {
  wallet: Wallet;
  onVerify: () => void;
  onSwitch: () => void;
  walletAchievements: Achievement[];
  missingAchievements: AchievementKeys[];
}) => {
  const intl = useIntl();

  return (
    <>
      <TableCell sx={{ width: '38%' }}>
        <Typography variant="bodySmallSemibold" color={({ palette }) => colors[palette.mode].typography.typo2}>
          <Address address={wallet.address} />
        </Typography>
      </TableCell>
      <TableCell sx={{ width: '38%' }}>
        <ContainerBox gap={0.5} flexDirection="column">
          {walletAchievements
            .filter((achievement) => missingAchievements.includes(achievement.id) && achievement.achieved > 0)
            .map((achievement) => (
              <ContainerBox key={achievement.id} gap={0.5} alignItems="center">
                <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].typography.typo2}>
                  {ACHIEVEMENT_KEY_TO_VERB[achievement.id]
                    ? intl.formatMessage(ACHIEVEMENT_KEY_TO_VERB[achievement.id])
                    : achievement.id}
                </Typography>
                <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
                  {` · ${ACHIEVEMENT_KEY_PREFIX[achievement.id] ?? ''}${achievement.achieved.toFixed(0)}`}
                </Typography>
              </ContainerBox>
            ))}
        </ContainerBox>
      </TableCell>
      <TableCell sx={{ width: '24%' }}>
        <ContainerBox alignItems="center" justifyContent="center" flex={1}>
          {wallet.isOwner ? (
            <VerifiedPill />
          ) : wallet.status === WalletStatus.connected ? (
            <Button variant="text" size="small" onClick={onVerify}>
              <FormattedMessage
                description="tier-view.verify-to-level-up-modal.multiple-wallets.verify"
                defaultMessage="Verify"
              />
            </Button>
          ) : (
            <Button variant="text" size="small" onClick={onSwitch}>
              <FormattedMessage
                description="tier-view.verify-to-level-up-modal.multiple-wallets.switch"
                defaultMessage="Switch"
              />
            </Button>
          )}
        </ContainerBox>
      </TableCell>
    </>
  );
};

const MultipleWalletsStep = ({
  currentTierLevel,
  missing,
}: {
  currentTierLevel: number;
  missing: Partial<Record<AchievementKeys, { current: number; required: number }>>;
}) => {
  const nextTierLevel = currentTierLevel + 1;
  const tierName = TIER_LEVEL_OPTIONS[nextTierLevel].title;
  const intl = useIntl();
  const wallets = useWallets();
  const walletAchievements = useWalletAchievements();
  const missingAchievements = React.useMemo(() => {
    return Object.keys(missing) as AchievementKeys[];
  }, [missing]);
  const completeWalletsToVerify = React.useMemo(() => {
    return wallets.filter((wallet) => {
      const achievements = walletAchievements[wallet.address];
      if (!achievements) return false;
      return achievements.some(
        (achievement) => missingAchievements.includes(achievement.id) && achievement.achieved > 0
      );
    });
  }, [wallets, missingAchievements, walletAchievements]);
  const tierProgress = getTierProgress(missing);
  const accountService = useAccountService();
  const { enqueueSnackbar } = useSnackbar();
  const { trackEvent } = useAnalytics();
  const openConnectModal = useOpenConnectModal();

  const onVerifyOwnership = React.useCallback(
    async (address: ViewAddress) => {
      try {
        await accountService.verifyWalletOwnership(address);
        enqueueSnackbar(
          intl.formatMessage(
            defineMessage({ defaultMessage: 'Wallet verified', description: 'verify-ownership-modal.success' })
          ),
          { variant: 'success' }
        );
      } catch (e) {
        console.error(e);
        enqueueSnackbar(
          intl.formatMessage(
            defineMessage({ defaultMessage: 'Failed to verify wallet', description: 'verify-ownership-modal.error' })
          ),
          { variant: 'error' }
        );
      }
    },
    [accountService, intl, enqueueSnackbar]
  );

  const onSwitchWallet = () => {
    trackEvent('Verify to level up modal - Multiple wallets - Switch wallet');

    openConnectModal(WalletActionType.reconnect);
  };

  return (
    <>
      <ContainerBox gap={2} flexDirection="column" justifyContent="center">
        <Typography variant="h3Bold" textAlign="center" color={({ palette }) => colors[palette.mode].typography.typo1}>
          <FormattedMessage
            description="tier-view.verify-to-level-up-modal.multiple-wallets.title"
            defaultMessage="Verify ownership to unlock <span>Tier {tierLevel} · {tierName}</span>"
            values={{
              tierLevel: nextTierLevel,
              tierName: intl.formatMessage(tierName),
              span: (chunks: React.ReactNode) => <StyledTierLevelSpan>{chunks}</StyledTierLevelSpan>,
            }}
          />
        </Typography>
        <Typography
          variant="bodyRegular"
          textAlign="center"
          color={({ palette }) => colors[palette.mode].typography.typo2}
        >
          <FormattedMessage
            description="tier-view.verify-to-level-up-modal.multiple-wallets.subtitle"
            defaultMessage="You're one step away from unlocking your next tier! <b>To proceed, sign with the wallet(s) until the requirements are fully met.</b> Once completed, your progress will be validated. "
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
            }}
          />
        </Typography>
      </ContainerBox>
      <StyledProgressToNextTierContainer>
        <Typography variant="h6Bold" color={({ palette }) => colors[palette.mode].typography.typo2}>
          <FormattedMessage
            description="tier-view.verify-to-level-up-modal.multiple-wallets.progress-to-next-tier"
            defaultMessage="Progress to reach Tier {tierLevel}"
            values={{
              tierLevel: nextTierLevel,
            }}
          />
        </Typography>
        <StyledProgressToNextTierProgressBar
          value={(tierProgress.current / tierProgress.required) * 100}
          sx={{ flex: 1 }}
        />
        <Typography variant="labelLarge" color={({ palette }) => colors[palette.mode].typography.typo2}>
          <FormattedMessage
            description="tier-view.verify-to-level-up-modal.multiple-wallets.progress-to-next-tier-subtitle"
            defaultMessage="{prefix}{progress}/<span>{prefix}{total}</span>"
            values={{
              prefix: getTierProgressPrefix(missing),
              progress: tierProgress.current.toFixed(0),
              total: tierProgress.required,
              span: (chunks: React.ReactNode) => <StyledProgressToNextTierSpan>{chunks}</StyledProgressToNextTierSpan>,
            }}
          />
        </Typography>
      </StyledProgressToNextTierContainer>
      <ContainerBox flex={1}>
        <TableContainer>
          <Table sx={{ tableLayout: 'auto' }}>
            <TableHead>
              <WalletsTableHeader />
            </TableHead>
            <TableBody>
              {completeWalletsToVerify.map((wallet) => (
                <TableRow key={wallet.address}>
                  <WalletsBodyItem
                    wallet={wallet}
                    walletAchievements={walletAchievements[wallet.address]}
                    missingAchievements={missingAchievements}
                    onVerify={() => onVerifyOwnership(wallet.address)}
                    onSwitch={onSwitchWallet}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ContainerBox>
    </>
  );
};

const VerifyToLevelUpModal = ({ isOpen, onClose }: VerifyToLevelUpModalProps) => {
  const intl = useIntl();
  const { walletsToVerify, tierLevel, missing } = useTierLevel();
  const accountService = useAccountService();
  const { enqueueSnackbar } = useSnackbar();
  const wallets = useWallets();
  const openConnectModal = useOpenConnectModal();
  const { trackEvent } = useAnalytics();
  const [modalStep, setModalStep] = React.useState<ModalStep>(ModalStep.singleWallet);

  React.useEffect(() => {
    if (walletsToVerify.length === 0) {
      onClose();
    }
  }, [tierLevel, walletsToVerify]);

  const onVerifyOwnership = React.useCallback(async () => {
    if (!walletsToVerify || walletsToVerify.length !== 1) return;
    try {
      await accountService.verifyWalletOwnership(walletsToVerify[0]);
      enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ defaultMessage: 'Wallet verified', description: 'verify-ownership-modal.success' })
        ),
        { variant: 'success' }
      );
      onClose();
    } catch (e) {
      console.error(e);
      enqueueSnackbar(
        intl.formatMessage(
          defineMessage({ defaultMessage: 'Failed to verify wallet', description: 'verify-ownership-modal.error' })
        ),
        { variant: 'error' }
      );
    }
  }, [walletsToVerify]);

  const onSwitchWallet = () => {
    trackEvent('Verify to level up modal - Switch wallet');

    openConnectModal(WalletActionType.reconnect);
  };

  const actions = React.useMemo(() => {
    if (modalStep === ModalStep.singleWallet) {
      if (walletsToVerify.length === 1) {
        const wallet = wallets.find(({ address }) => address === walletsToVerify[0]);
        if (!wallet || wallet.status === WalletStatus.disconnected) {
          return [
            {
              label: intl.formatMessage(
                defineMessage({
                  description: 'tier-view.verify-to-level-up-modal.actions.connect',
                  defaultMessage: 'Connect',
                }),
                { wallet: trimAddress(wallet?.address || '') }
              ),
              onClick: onSwitchWallet,
              variant: 'contained',
            },
          ] as ModalProps['actions'];
        } else {
          return [
            {
              label: intl.formatMessage(
                defineMessage({
                  description: 'tier-view.verify-to-level-up-modal.actions.verify-ownership',
                  defaultMessage: 'Verify ownership',
                })
              ),
              onClick: onVerifyOwnership,
              variant: 'contained',
            },
          ] as ModalProps['actions'];
        }
      } else {
        return [
          {
            label: intl.formatMessage(
              defineMessage({
                description: 'tier-view.verify-to-level-up-modal.actions.continue-signing',
                defaultMessage: 'Continue signing',
              })
            ),
            onClick: () => setModalStep(ModalStep.multipleWallets),
            variant: 'contained',
          },
        ] as ModalProps['actions'];
      }
    }
    return [];
  }, [onVerifyOwnership, intl]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      showCloseButton={modalStep === ModalStep.singleWallet}
      showCloseIcon={modalStep === ModalStep.multipleWallets}
      actions={actions}
      maxWidth="sm"
      actionsAlignment="horizontal"
      closeMessage={defineMessage({
        defaultMessage: 'Maybe later',
        description: 'tier-view.verify-to-level-up-modal.close',
      })}
    >
      <ContainerBox gap={6} flexDirection="column">
        {modalStep === ModalStep.singleWallet && (
          <SingleWalletStep currentTierLevel={tierLevel ?? 0} walletsToVerify={walletsToVerify} />
        )}
        {modalStep === ModalStep.multipleWallets && (
          <MultipleWalletsStep currentTierLevel={tierLevel ?? 0} missing={missing} />
        )}
      </ContainerBox>
    </Modal>
  );
};

export default VerifyToLevelUpModal;
