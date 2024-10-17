import React from 'react';
import { Button, ContainerBox } from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { parseUnits } from 'viem';
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
import useTrackEvent from '@hooks/useTrackEvent';
import { useEarnManagementState } from '@state/earn-management/hooks';
import useHasFetchedUserStrategies from '@hooks/earn/useHasFetchedUserStrategies';
import { isSameToken } from '@common/utils/currency';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { WalletActionType } from '@services/accountService';
import useContractService from '@hooks/useContractService';

interface EarnWithdrawCTAButtonProps {
  strategy?: DisplayStrategy;
  onHandleImmediateWithdraw: () => void;
  onHandleDelayedWithdraw: () => void;
  onHandleMarketWithdraw: () => void;
  onHandleProceed: () => void;
}

const EarnWithdrawCTAButton = ({
  strategy,
  onHandleImmediateWithdraw,
  onHandleDelayedWithdraw,
  onHandleMarketWithdraw,
  onHandleProceed,
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
  const trackEvent = useTrackEvent();
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
    parseUnits(withdrawAmount, asset.decimals) > positionBalance.amount.amount;

  const shouldDisableProceedButton =
    !asset || !withdrawAmount || !positionBalance || isLoading || notEnoughPositionAssetBalance;

  // User can just withdraw if they have rewards
  const shouldDisabledButton = !withdrawRewards && shouldDisableProceedButton;

  const wrappedProtocolToken = strategy && getWrappedProtocolToken(strategy.farm.chainId);
  const companionHasPermission =
    strategy &&
    position &&
    position.permissions[contractService.getEarnCompanionAddress(strategy.network.chainId)]?.includes(
      EarnPermission.WITHDRAW
    );
  const requireCompanionSignature =
    wrappedProtocolToken?.address === strategy?.asset.address && !!withdrawAmount && !companionHasPermission;

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
      onClick={onHandleProceed}
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
      onClick={onHandleImmediateWithdraw}
    >
      <FormattedMessage description="earn.strategy-management.withdraw.button.withdraw" defaultMessage="Withdraw" />
    </Button>
  );

  const DelayWithdrawButtons = (
    <ContainerBox flexDirection="column" gap={3} justifyContent="center" fullWidth>
      <Button
        size="large"
        variant="contained"
        disabled={!!shouldDisableProceedButton}
        fullWidth
        onClick={onHandleDelayedWithdraw}
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
          onClick={companionHasPermission ? onHandleMarketWithdraw : onHandleProceed}
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
  } else if (!isOnCorrectNetwork) {
    ButtonToShow = IncorrectNetworkButton;
  } else if (notEnoughPositionAssetBalance && !withdrawRewards) {
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
