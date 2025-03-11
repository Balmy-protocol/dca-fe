import React from 'react';
import { ArrowForwardIcon, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { NetworkStruct, WalletStatus } from 'common-types';
import { WalletActionType } from '@services/accountService';
import useAnalytics from '@hooks/useAnalytics';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { DisplayWallet } from '@hooks/useWallets';
import { getDisplayWallet } from '@common/utils/parsing';
interface WithdrawRewardsCardCTAButtonProps {
  requireCompanionSignature: boolean;
  handleWithdraw: () => void;
  isOnCorrectNetwork: boolean;
  onChangeNetwork: (chainId: number) => void;
  network: NetworkStruct;
  activeWallet?: DisplayWallet;
}

const WithdrawRewardsCardCTAButton = ({
  requireCompanionSignature,
  handleWithdraw,
  isOnCorrectNetwork,
  onChangeNetwork,
  network,
  activeWallet,
}: WithdrawRewardsCardCTAButtonProps) => {
  const { trackEvent } = useAnalytics();
  const openConnectModal = useOpenConnectModal();
  const WithdrawRewardsButton = (
    <Button
      variant="text"
      color="primary"
      onClick={handleWithdraw}
      size="small"
      endIcon={requireCompanionSignature ? <ArrowForwardIcon /> : undefined}
    >
      <FormattedMessage
        defaultMessage="Claim Rewards"
        description="earn.strategy-management.withdraw-rewards-card.button.claim-rewards"
      />
    </Button>
  );

  const IncorrectNetworkButton = (
    <Button variant="text" size="small" color="primary" onClick={() => onChangeNetwork(network?.chainId)}>
      <FormattedMessage
        description="earn.strategy-management.withdraw-rewards-card.button.wrong-network"
        defaultMessage="Change to {network}"
        values={{ network: network?.name }}
      />
    </Button>
  );

  const onReconnectWallet = () => {
    trackEvent('Earn Vault Withdraw Rewards Card - Reconnect wallet');

    openConnectModal(WalletActionType.reconnect);
  };

  const ReconnectWalletButton = (
    <Button size="small" variant="contained" onClick={onReconnectWallet}>
      <FormattedMessage
        description="earn.strategy-management.withdraw-rewards-card.button.reconnect-wallet"
        defaultMessage="Connect {wallet}"
        values={{
          wallet: getDisplayWallet(activeWallet),
        }}
      />
    </Button>
  );

  let buttonToShow = WithdrawRewardsButton;

  if (activeWallet && activeWallet.status === WalletStatus.disconnected) {
    buttonToShow = ReconnectWalletButton;
  } else if (!isOnCorrectNetwork) {
    buttonToShow = IncorrectNetworkButton;
  }

  return buttonToShow;
};

export default WithdrawRewardsCardCTAButton;
