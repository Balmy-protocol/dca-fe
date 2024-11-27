import React from 'react';
import {
  Button,
  colors,
  ContainerBox,
  EyeIcon,
  EyeSlashIcon,
  IconButton,
  OptionsMenu,
  ChevronDownIcon,
  Typography,
} from 'ui-library';
import UnlinkWalletModal from '../unlink-wallet-modal';
import EditWalletLabelModal from '../edit-label-modal';
import { WalletSelectorMainProps, WalletSelectorNavProps, WalletSelectorProps, WalletSelectorVariants } from './types';
import useWalletSelectorState from './useWalletSelectorState';
import { FormattedMessage } from 'react-intl';
import NetWorthNumber from '../networth-number';
import styled from 'styled-components';

const StyledNavSelectedOptionLabelContainer = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(0.5)} ${spacing(1)};
  `}
`;

const WalletSelectorConnectButtonContent = () => (
  <Typography variant="bodySmallBold" color="inherit">
    <FormattedMessage defaultMessage="Connect your wallet" description="connectWallet" />
  </Typography>
);

const WalletSelectorNavVariant = ({
  options,
  size,
  isLoadingSomePrices,
  isLoggingUser,
  totalAssetValue,
  onToggleShowBalances,
  showBalances,
}: WalletSelectorNavProps) => {
  const {
    selectedWallet,
    openEditLabelModal,
    onCloseEditLabelModal,
    onCloseUnlinkModal,
    onUnlinkWallet,
    openUnlinkModal,
    selectedOptionLabel,
    menuOptions,
    onConnectWallet,
    wallets,
  } = useWalletSelectorState({ options, showWalletCounter: true });

  const navToggleHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleShowBalances();
  };

  const optionsMenuMainDisplay = (
    <ContainerBox flexDirection="column" gap={1}>
      <StyledNavSelectedOptionLabelContainer>{selectedOptionLabel}</StyledNavSelectedOptionLabelContainer>
      <ContainerBox gap={1}>
        <NetWorthNumber
          isLoading={isLoadingSomePrices || isLoggingUser}
          withAnimation
          value={totalAssetValue}
          variant="bodyBold"
          size="large"
        />
        <IconButton onClick={navToggleHandler} sx={{ padding: 0, margin: 0 }}>
          <Typography
            variant="bodyLargeRegular"
            sx={{ color: ({ palette: { mode } }) => colors[mode].typography.typo3, display: 'inline-flex' }}
          >
            {showBalances ? <EyeIcon /> : <EyeSlashIcon />}
          </Typography>
        </IconButton>
      </ContainerBox>
    </ContainerBox>
  );

  if (!wallets.length) {
    return (
      <Button onClick={onConnectWallet} variant="outlined" size="small" endIcon={<ChevronDownIcon />}>
        <WalletSelectorConnectButtonContent />
      </Button>
    );
  }

  return (
    <>
      <EditWalletLabelModal walletToEdit={selectedWallet} open={openEditLabelModal} onCancel={onCloseEditLabelModal} />
      <UnlinkWalletModal
        walletToRemove={selectedWallet}
        open={openUnlinkModal}
        onUnlinkWallet={onUnlinkWallet}
        onCancel={onCloseUnlinkModal}
      />
      <OptionsMenu options={menuOptions} mainDisplay={optionsMenuMainDisplay} size={size} fullWidth />
    </>
  );
};

const WalletSelectorMainVariant = ({ options, size }: WalletSelectorMainProps) => {
  const {
    selectedWallet,
    openEditLabelModal,
    onCloseEditLabelModal,
    onCloseUnlinkModal,
    onUnlinkWallet,
    openUnlinkModal,
    selectedOptionLabel,
    menuOptions,
    onConnectWallet,
    wallets,
  } = useWalletSelectorState({ options });

  if (!wallets.length) {
    return (
      <Button onClick={onConnectWallet} variant="text" size="small" endIcon={<ChevronDownIcon />}>
        <WalletSelectorConnectButtonContent />
      </Button>
    );
  }

  return (
    <>
      <EditWalletLabelModal walletToEdit={selectedWallet} open={openEditLabelModal} onCancel={onCloseEditLabelModal} />
      <UnlinkWalletModal
        walletToRemove={selectedWallet}
        open={openUnlinkModal}
        onUnlinkWallet={onUnlinkWallet}
        onCancel={onCloseUnlinkModal}
      />
      <OptionsMenu options={menuOptions} mainDisplay={selectedOptionLabel} alwaysUseTypography size={size} />
    </>
  );
};

const WalletSelector = (props: WalletSelectorProps) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.variant === WalletSelectorVariants.nav) {
    return <WalletSelectorNavVariant {...props} />;
  }
  // eslint-disable-next-line react/destructuring-assignment
  if (props.variant === WalletSelectorVariants.main) {
    return <WalletSelectorMainVariant {...props} />;
  }

  return null;
};

export default WalletSelector;
