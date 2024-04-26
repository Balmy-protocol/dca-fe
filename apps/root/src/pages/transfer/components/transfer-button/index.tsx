import Address from '@common/components/address';
import { NETWORKS } from '@constants';
import useActiveWallet from '@hooks/useActiveWallet';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import useTrackEvent from '@hooks/useTrackEvent';
import useWalletService from '@hooks/useWalletService';
import useWallets from '@hooks/useWallets';
import { setNetwork } from '@state/config/actions';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { NetworkStruct } from 'common-types';
import { find } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'ui-library';

interface TransferButtonProps {
  onTransferClick: () => void;
  disableTransfer: boolean;
}

const TransferButton = ({ disableTransfer, onTransferClick }: TransferButtonProps) => {
  const { network } = useTransferState();
  const actualCurrentNetwork = useCurrentNetwork();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const isOnCorrectNetwork = actualCurrentNetwork.chainId === network;
  const { openConnectModal } = useOpenConnectModal();
  const authWallet = find(wallets, { isAuth: true });

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
    <Button fullWidth onClick={onTransferClick} disabled={disableTransfer} variant="contained">
      {disableTransfer ? (
        <FormattedMessage description="enterAmount" defaultMessage="Enter an amount" />
      ) : (
        <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
      )}
    </Button>
  );

  const IncorrectNetworkButton = (
    <Button fullWidth variant="contained" onClick={() => onChangeNetwork(network)}>
      <FormattedMessage
        description="incorrect network"
        defaultMessage="Change network to {network}"
        values={{ network: tokenNetwork?.name }}
      />
    </Button>
  );

  const ReconnectButton = (
    <Button fullWidth variant="contained" onClick={() => openConnectModal()}>
      <FormattedMessage description="reconnect wallet" defaultMessage="Reconnect wallet" />
      {authWallet && (
        <>
          {' ('}
          <Address address={authWallet.address} trimAddress />
          {')'}
        </>
      )}
    </Button>
  );

  let buttonToShow;

  if (!isOnCorrectNetwork && !disableTransfer) {
    buttonToShow = IncorrectNetworkButton;
  } else if (!activeWallet && wallets.length > 0) {
    buttonToShow = ReconnectButton;
  } else {
    buttonToShow = TransferTokenButton;
  }

  return buttonToShow;
};

export default TransferButton;
