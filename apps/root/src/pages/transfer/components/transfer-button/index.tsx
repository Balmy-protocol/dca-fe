import { NETWORKS } from '@constants';
import useActiveWallet from '@hooks/useActiveWallet';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useAnalytics from '@hooks/useAnalytics';
import useWalletService from '@hooks/useWalletService';
import useWallets from '@hooks/useWallets';
import { setNetwork } from '@state/config/actions';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { NetworkStruct, WalletStatus } from 'common-types';
import { find } from 'lodash';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button } from 'ui-library';
import { getDisplayWallet } from '@common/utils/parsing';
import { WalletActionType } from '@services/accountService';

interface TransferButtonProps {
  onTransferClick: () => void;
  disableTransfer: boolean;
  isValidAddress: boolean;
}

const TransferButton = ({ disableTransfer, onTransferClick, isValidAddress }: TransferButtonProps) => {
  const { network, amount, recipient } = useTransferState();
  const actualCurrentNetwork = useCurrentNetwork();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === network;
  const reconnectingWallet = activeWallet || find(wallets, { isAuth: true });
  const reconnectingWalletDisplay = getDisplayWallet(reconnectingWallet);
  const openConnectModal = useOpenConnectModal();
  const tokenNetwork = find(NETWORKS, { chainId: network });
  const onChangeNetwork = (chainId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Transfer - Change network', { chainId });
  };

  const TransferTokenButton = (
    <Button fullWidth onClick={onTransferClick} disabled={disableTransfer} variant="contained" size="large">
      {!amount && !recipient ? (
        <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
      ) : !isValidAddress ? (
        <FormattedMessage description="transferInvalidRecipient" defaultMessage="Invalid recipient" />
      ) : disableTransfer ? (
        <FormattedMessage description="enterAmount" defaultMessage="Enter an amount" />
      ) : (
        <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
      )}
    </Button>
  );

  const IncorrectNetworkButton = (
    <Button fullWidth variant="contained" onClick={() => onChangeNetwork(network)} size="large">
      <FormattedMessage
        description="incorrect network"
        defaultMessage="Change network to {network}"
        values={{ network: tokenNetwork?.name }}
      />
    </Button>
  );

  const ReconnectButton = (
    <Button fullWidth variant="contained" onClick={() => openConnectModal(WalletActionType.reconnect)} size="large">
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

  let buttonToShow;

  if (!isOnCorrectNetwork && !disableTransfer) {
    buttonToShow = IncorrectNetworkButton;
  } else if (
    (!activeWallet && wallets.length > 0) ||
    (activeWallet && activeWallet.status === WalletStatus.disconnected)
  ) {
    buttonToShow = ReconnectButton;
  } else {
    buttonToShow = TransferTokenButton;
  }

  return buttonToShow;
};

export default TransferButton;
