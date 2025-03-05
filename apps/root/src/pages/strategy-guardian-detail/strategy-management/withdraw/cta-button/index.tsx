import React from 'react';
import { Button, ContainerBox } from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { maxUint256, parseUnits } from 'viem';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import { DisplayStrategy, EarnPermission, NetworkStruct, WalletStatus, WithdrawType } from '@types';
import useActiveWallet from '@hooks/useActiveWallet';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useWallets from '@hooks/useWallets';
import { getDisplayWallet } from '@common/utils/parsing';
import useAnalytics from '@hooks/useAnalytics';
import { useEarnManagementState } from '@state/earn-management/hooks';
import useHasFetchedUserStrategies from '@hooks/earn/useHasFetchedUserStrategies';
import { isSameToken } from '@common/utils/currency';
import { getProtocolToken } from '@common/mocks/tokens';
import { WalletActionType } from '@services/accountService';
import useContractService from '@hooks/useContractService';

interface EarnWithdrawCTAButtonProps {
  strategy?: DisplayStrategy;
  onWithdraw: (assetWithdrawType: WithdrawType) => void;
  onHandleProceed: (assetWithdrawType: WithdrawType) => void;
  onShowMarketWithdrawModal: () => void;
}

const EarnWithdrawCTAButton = ({
  strategy,
  onWithdraw,
  onHandleProceed,
  onShowMarketWithdrawModal,
}: EarnWithdrawCTAButtonProps) => {
  const { withdrawAmount, withdrawRewards } = useEarnManagementState();
  const asset = strategy?.asset;
  const activeWallet = useActiveWallet();
  const hasFetchedUserStrategies = useHasFetchedUserStrategies();
  const network = strategy?.network;
  const actualCurrentNetwork = useCurrentNetwork();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === network?.chainId;
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const wallets = useWallets();
  const intl = useIntl();
  const reconnectingWallet = activeWallet || find(wallets, { isAuth: true });
  const reconnectingWalletDisplay = getDisplayWallet(reconnectingWallet);
  const openConnectModal = useOpenConnectModal();
  const { trackEvent } = useAnalytics();
  const contractService = useContractService();
  const position = strategy?.userPositions?.find((userPosition) => userPosition.owner === activeWallet?.address);

  const positionBalance = React.useMemo(
    () =>
      strategy?.userPositions
        ?.find((userPosition) => userPosition.owner === activeWallet?.address)
        ?.balances.find((balance) => isSameToken(balance.token, strategy.asset)),
    [activeWallet?.address, strategy]
  );

  const isLoading = !strategy || !hasFetchedUserStrategies;

  const notEnoughPositionAssetBalance =
    !!asset &&
    withdrawAmount &&
    positionBalance &&
    positionBalance.amount.amount !== 0n &&
    withdrawAmount !== maxUint256.toString() &&
    parseUnits(withdrawAmount, asset.decimals) > positionBalance.amount.amount;

  const shouldDisableProceedButton =
    !asset ||
    !positionBalance ||
    isLoading ||
    notEnoughPositionAssetBalance ||
    (Number(withdrawAmount || '0') === 0 && !withdrawRewards);

  // User can just withdraw if they have rewards
  const shouldDisabledButton = !withdrawRewards && shouldDisableProceedButton;

  const protocolToken = strategy && getProtocolToken(strategy.farm.chainId);
  const companionAddress = strategy && contractService.getEarnCompanionAddress(strategy.network.chainId);
  const companionHasPermission =
    strategy &&
    position &&
    companionAddress &&
    position.permissions[companionAddress]?.includes(EarnPermission.WITHDRAW);
  const requireCompanionSignature =
    // Since this is the underlying the wrapped protocol token we need to check for protocol token
    protocolToken?.address === strategy?.asset.address &&
    !!withdrawAmount &&
    !companionHasPermission &&
    !!companionAddress;

  const shouldHandleDelayWithdraw =
    strategy?.asset.withdrawTypes.includes(WithdrawType.DELAYED) && Number(withdrawAmount) > 0;

  const shouldShowMarketWithdraw = strategy?.asset.withdrawTypes.includes(WithdrawType.MARKET);

  const onChangeNetwork = (chainId?: number) => {
    if (!chainId) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Earn Vault Withdraw - Change network button');
  };

  const onConnectWallet = () => {
    trackEvent('Earn Vault Withdraw - Connect wallet');

    openConnectModal(WalletActionType.connect);
  };

  const onReconnectWallet = () => {
    trackEvent('Earn Vault Withdraw - Reconnect wallet');

    openConnectModal(WalletActionType.reconnect);
  };

  const NoWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onConnectWallet}>
      <FormattedMessage
        description="earn.strategy-management.withdraw.button.connect-wallet"
        defaultMessage="Connect wallet"
      />
    </Button>
  );

  const ReconnectWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onReconnectWallet}>
      <FormattedMessage
        description="earn.strategy-management.withdraw.button.reconnect-wallet"
        defaultMessage="Switch to {wallet}'s Wallet"
        values={{
          wallet: reconnectingWalletDisplay
            ? `${reconnectingWalletDisplay}`
            : intl.formatMessage(
                defineMessage({
                  description: 'reconnectWalletFallback',
                  defaultMessage: 'Owner',
                })
              ),
        }}
      />
    </Button>
  );

  const IncorrectNetworkButton = (
    <Button size="large" variant="contained" onClick={() => onChangeNetwork(network?.chainId)} fullWidth>
      <FormattedMessage
        description="earn.strategy-management.withdraw.button.wrong-network"
        defaultMessage="Change network to {network}"
        values={{ network: network?.name }}
      />
    </Button>
  );

  const ProceedButton = (
    <Button
      size="large"
      variant="contained"
      disabled={!!shouldDisableProceedButton}
      fullWidth
      onClick={() => onHandleProceed(WithdrawType.IMMEDIATE)}
    >
      <FormattedMessage
        description="earn.strategy-management.withdraw.button.continue"
        defaultMessage="Continue to Withdraw"
      />
    </Button>
  );

  const ImmediateWithdrawButton = (
    <Button
      size="large"
      variant="contained"
      disabled={!!shouldDisabledButton}
      fullWidth
      onClick={() => onWithdraw(WithdrawType.IMMEDIATE)}
    >
      <FormattedMessage description="earn.strategy-management.withdraw.button.withdraw" defaultMessage="Withdraw" />
    </Button>
  );

  const DelayWithdrawButtons = (
    <ContainerBox flexDirection="column" gap={3} alignItems="center" fullWidth>
      <Button
        size="large"
        variant="contained"
        disabled={!!shouldDisableProceedButton}
        fullWidth
        onClick={() => onWithdraw(WithdrawType.DELAYED)}
      >
        <FormattedMessage
          description="earn.strategy-management.withdraw.button.initiate-delayed-withdraw"
          defaultMessage="Initiate Withdraw"
        />
      </Button>
      {shouldShowMarketWithdraw && (
        <Button
          size="large"
          variant="outlined"
          disabled={!!shouldDisableProceedButton}
          fullWidth
          onClick={onShowMarketWithdrawModal}
        >
          <FormattedMessage
            description="earn.strategy-management.withdraw.button.initiate-market-withdraw"
            defaultMessage="Instant Withdraw"
          />
        </Button>
      )}
    </ContainerBox>
  );

  const NoEnoughPositionBalanceButton = (
    <Button size="large" variant="contained" fullWidth disabled>
      <FormattedMessage
        description="earn.strategy-management.withdraw.button.insufficient-funds"
        defaultMessage="Insufficient funds"
      />
    </Button>
  );

  let ButtonToShow;

  if (!activeWallet?.address && !wallets.length) {
    ButtonToShow = NoWalletButton;
  } else if (
    (!activeWallet?.address && wallets.length > 0) ||
    (activeWallet && activeWallet.status === WalletStatus.disconnected)
  ) {
    ButtonToShow = ReconnectWalletButton;
  } else if (!isOnCorrectNetwork && !activeWallet?.canAutomaticallyChangeNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (notEnoughPositionAssetBalance) {
    ButtonToShow = NoEnoughPositionBalanceButton;
  } else if (shouldHandleDelayWithdraw) {
    ButtonToShow = DelayWithdrawButtons;
  } else if (requireCompanionSignature) {
    ButtonToShow = ProceedButton;
  } else {
    ButtonToShow = ImmediateWithdrawButton;
  }

  return ButtonToShow;
};

export default EarnWithdrawCTAButton;
