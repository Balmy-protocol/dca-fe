import React from 'react';
import { Button } from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { parseUnits } from 'viem';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import find from 'lodash/find';
import { NETWORKS, PERMIT_2_ADDRESS } from '@constants';
import { setNetwork } from '@state/config/actions';
import { AmountsOfToken, DisplayStrategy, NetworkStruct, WalletStatus } from '@types';
import useActiveWallet from '@hooks/useActiveWallet';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useWallets from '@hooks/useWallets';
import { getDisplayWallet } from '@common/utils/parsing';
import useAnalytics from '@hooks/useAnalytics';
import useSpecificAllowance from '@hooks/useSpecificAllowance';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { WalletActionType } from '@services/accountService';

interface EarnDepositCTAButtonProps {
  balance?: AmountsOfToken;
  strategy?: DisplayStrategy;
  onHandleDeposit: () => void;
  onHandleProceed: (isApproved: boolean) => void;
  requiresCompanionSignature?: boolean;
  isIncrease?: boolean;
}

const EarnDepositCTAButton = ({
  balance,
  strategy,
  onHandleProceed,
  onHandleDeposit,
  requiresCompanionSignature,
  isIncrease,
}: EarnDepositCTAButtonProps) => {
  const { depositAmount } = useEarnManagementState();
  const asset = strategy?.asset;
  const activeWallet = useActiveWallet();
  const [allowance, , allowanceErrors] = useSpecificAllowance(
    asset,
    activeWallet?.address || '',
    (strategy && PERMIT_2_ADDRESS[strategy?.network.chainId]) || PERMIT_2_ADDRESS[NETWORKS.mainnet.chainId]
  );
  const network = strategy?.network;

  const isApproved =
    !asset ||
    (asset &&
      (!depositAmount
        ? true
        : (allowance.allowance &&
            allowance.token.address === asset.address &&
            parseUnits(allowance.allowance, asset.decimals) >= parseUnits(depositAmount, asset.decimals)) ||
          asset.address === PROTOCOL_TOKEN_ADDRESS));

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

  const isLoading = !strategy;

  const cantFund =
    !!asset && !!depositAmount && !!balance && parseUnits(depositAmount, asset.decimals) > BigInt(balance.amount);

  const shouldDisableApproveButton =
    true ||
    !asset ||
    !depositAmount ||
    cantFund ||
    !balance ||
    isLoading ||
    allowanceErrors ||
    Number(depositAmount) === 0;

  const shouldDisableButton = shouldDisableApproveButton || !isApproved;

  const onChangeNetwork = (chainId?: number) => {
    if (!chainId) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Earn Vault Deposit - Change network button');
  };

  const onConnectWallet = () => {
    trackEvent('Earn Vault Deposit - Connect wallet');

    openConnectModal(WalletActionType.connect);
  };

  const onReconnectWallet = () => {
    trackEvent('Earn Vault Deposit - Reconnect wallet');

    openConnectModal(WalletActionType.reconnect);
  };
  const NoWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onConnectWallet}>
      <FormattedMessage
        description="earn.strategy-management.deposit.button.connect-wallet"
        defaultMessage="Connect wallet"
      />
    </Button>
  );

  const ReconnectWalletButton = (
    <Button size="large" variant="contained" fullWidth onClick={onReconnectWallet}>
      <FormattedMessage
        description="earn.strategy-management.deposit.button.reconnect-wallet"
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
        description="earn.strategy-management.deposit.button.insufficient-funds"
        defaultMessage="Change network to {network}"
        values={{ network: network?.name }}
      />
    </Button>
  );

  const ProceedButton = (
    <Button
      size="large"
      variant="contained"
      disabled={!!shouldDisableApproveButton}
      fullWidth
      onClick={() => onHandleProceed(isApproved)}
    >
      <FormattedMessage
        description="earn.strategy-management.deposit.button.continue"
        defaultMessage="Continue to Deposit"
      />
    </Button>
  );

  const ActualDepositButton = (
    <Button size="large" variant="contained" disabled={!!shouldDisableButton} fullWidth onClick={onHandleDeposit}>
      <FormattedMessage description="earn.strategy-management.deposit.button.deposit" defaultMessage="Deposit" />
    </Button>
  );

  const NoFundsButton = (
    <Button size="large" variant="contained" fullWidth disabled>
      <FormattedMessage
        description="earn.strategy-management.deposit.button.insufficient-funds"
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
  } else if (cantFund) {
    ButtonToShow = NoFundsButton;
  } else if (
    (!isApproved && !cantFund) ||
    asset?.address !== PROTOCOL_TOKEN_ADDRESS ||
    (!!strategy?.tos && !isIncrease) ||
    requiresCompanionSignature
  ) {
    ButtonToShow = ProceedButton;
  } else {
    ButtonToShow = ActualDepositButton;
  }

  return ButtonToShow;
};

export default EarnDepositCTAButton;
