import React from 'react';
import { Button } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';

import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { parseUnits } from 'viem';
import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import { useAggregatorState } from '@state/aggregator/hooks';
import useLoadedAsSafeApp from '@hooks/useLoadedAsSafeApp';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';
import { AmountsOfToken, NetworkStruct, WalletStatus } from '@types';
import useIsPermit2Enabled from '@hooks/useIsPermit2Enabled';
import useActiveWallet from '@hooks/useActiveWallet';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useWallets from '@hooks/useWallets';
import { getDisplayWallet } from '@common/utils/parsing';
import useAnalytics from '@hooks/useAnalytics';
import { WalletActionType } from '@services/accountService';

interface SwapButtonProps {
  fromValue: string;
  cantFund: boolean;
  balance?: AmountsOfToken;
  allowanceErrors?: string;
  isLoadingRoute: boolean;
  transactionWillFail: boolean;
  isApproved: boolean;
  handleMultiSteps: () => void;
  handleSwap: () => void;
  handleSafeApproveAndSwap: () => void;
}

const SwapButton = ({
  cantFund,
  fromValue,
  isApproved,
  allowanceErrors,
  balance,
  isLoadingRoute,
  transactionWillFail,
  handleMultiSteps,
  handleSwap,
  handleSafeApproveAndSwap,
}: SwapButtonProps) => {
  const { from, to, selectedRoute } = useAggregatorState();
  const currentNetwork = useSelectedNetwork();
  const isPermit2Enabled = useIsPermit2Enabled(currentNetwork.chainId);
  const actualCurrentNetwork = useCurrentNetwork();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === currentNetwork.chainId;
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const intl = useIntl();
  const reconnectingWallet = activeWallet || find(wallets, { isAuth: true });
  const reconnectingWalletDisplay = getDisplayWallet(reconnectingWallet);
  const openConnectModal = useOpenConnectModal();
  const { trackEvent } = useAnalytics();

  const shouldDisableApproveButton =
    !from ||
    !to ||
    !fromValue ||
    cantFund ||
    !balance ||
    !selectedRoute ||
    allowanceErrors ||
    parseUnits(fromValue, selectedRoute?.sellToken.decimals || from.decimals) <= 0n ||
    isLoadingRoute;

  const shouldDisableButton = shouldDisableApproveButton || !isApproved || !selectedRoute.tx || transactionWillFail;

  const onChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Aggregator - Change network button');
  };

  const onConnectWallet = () => {
    trackEvent('Aggregator - Connect wallet');

    openConnectModal(WalletActionType.connect);
  };

  const onReconnectWallet = () => {
    trackEvent('Aggregator - Reconnect wallet');

    openConnectModal(WalletActionType.reconnect);
  };
  const NoWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onConnectWallet}>
      <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
    </Button>
  );

  const ReconnectWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onReconnectWallet}>
      <FormattedMessage
        description="reconnect wallet"
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
    <Button size="large" variant="contained" onClick={() => onChangeNetwork(currentNetwork.chainId)} fullWidth>
      <FormattedMessage
        description="incorrect network"
        defaultMessage="Change network to {network}"
        values={{ network: currentNetwork.name }}
      />
    </Button>
  );

  const ProceedButton = (
    <Button
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      fullWidth
      onClick={handleMultiSteps}
    >
      {isLoadingRoute && <CenteredLoadingIndicator size={36} color="secondary" />}
      {!isLoadingRoute && <FormattedMessage description="proceed agg" defaultMessage="Continue to Swap" />}
    </Button>
  );

  const ActualSwapButton = (
    <Button size="large" variant="contained" disabled={!!shouldDisableButton} fullWidth onClick={handleSwap}>
      {isLoadingRoute && <CenteredLoadingIndicator size={36} color="secondary" />}
      {!isLoadingRoute && <FormattedMessage description="swap agg" defaultMessage="Swap" />}
    </Button>
  );

  const ApproveAndSwapSafeButton = (
    <Button
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      fullWidth
      onClick={handleSafeApproveAndSwap}
    >
      {isLoadingRoute && <CenteredLoadingIndicator size={36} color="secondary" />}
      {!isLoadingRoute && (
        <>
          {/* // Wrap and Unwrap wont require approval */}
          {(from?.address === PROTOCOL_TOKEN_ADDRESS && to?.address === wrappedProtocolToken.address) ||
          (from?.address === wrappedProtocolToken.address && to?.address === PROTOCOL_TOKEN_ADDRESS) ? (
            <FormattedMessage description="swap agg" defaultMessage="Swap" />
          ) : (
            <FormattedMessage
              description="approve and swap agg"
              defaultMessage="Authorize {from} and swap"
              values={{ from: from?.symbol || '' }}
            />
          )}
        </>
      )}
    </Button>
  );

  const NoFundsButton = (
    <Button size="large" variant="contained" fullWidth disabled>
      <FormattedMessage description="insufficient funds" defaultMessage="Insufficient funds" />
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
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (!isApproved && balance && BigInt(balance.amount) > 0n && to && loadedAsSafeApp) {
    ButtonToShow = ApproveAndSwapSafeButton;
  } else if (
    (!isApproved && balance && BigInt(balance.amount) > 0n && to) ||
    (isPermit2Enabled && from?.address !== PROTOCOL_TOKEN_ADDRESS)
  ) {
    ButtonToShow = ProceedButton;
  } else {
    ButtonToShow = ActualSwapButton;
  }

  return ButtonToShow;
};

export default SwapButton;
