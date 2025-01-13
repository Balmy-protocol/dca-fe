import React from 'react';
import { NetworkStruct, Position, TokenListId, WalletStatus } from '@types';
import {
  LATEST_VERSION,
  DCA_PAIR_BLACKLIST,
  shouldEnableFrequency,
  SUPPORTED_NETWORKS_DCA,
  CHAIN_CHANGING_WALLETS_WITH_REFRESH,
  NETWORKS,
} from '@constants';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { Button, ContainerBox } from 'ui-library';
import useDcaTokens from '@hooks/useDcaTokens';
import { initializeModifyRateSettings } from '@state/modify-rate-settings/actions';
import { formatUnits } from 'viem';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import ModifySettingsModal from '@common/components/modify-settings-modal';
import useWalletNetwork from '@hooks/useWalletNetwork';
import useWallets from '@hooks/useWallets';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { getDisplayWallet } from '@common/utils/parsing';
import useWalletService from '@hooks/useWalletService';
import { setNetwork } from '@state/config/actions';
import { find } from 'lodash';
import styled from 'styled-components';
import { WalletActionType } from '@services/accountService';

const ButtonContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

interface PositionDataMainButtonProps {
  position: Position;
}

const PositionDataMainButton = ({ position }: PositionDataMainButtonProps) => {
  const dcaTokens = useDcaTokens(position.chainId, true);
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const openConnectModal = useOpenConnectModal();
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const isPending = position.pendingTransaction !== null && position.pendingTransaction !== '';
  const wallets = useWallets();
  const intl = useIntl();
  const ownerWallet = wallets.find((userWallet) => userWallet.address.toLowerCase() === position.user.toLowerCase());
  const walletService = useWalletService();
  const onSwitchNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(position.chainId, ownerWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId: position.chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Position Details - Change network', { chainId: position.chainId });
  };

  const showExtendedFunctions =
    position.version === LATEST_VERSION &&
    !DCA_PAIR_BLACKLIST.includes(position.pairId) &&
    !!dcaTokens[`${position.chainId}-${position.from.address}` as TokenListId] &&
    (!fromHasYield ||
      !!dcaTokens[`${position.chainId}-${position.from.underlyingTokens[0]?.address}` as TokenListId]) &&
    (!toHasYield || !!dcaTokens[`${position.chainId}-${position.to.underlyingTokens[0]?.address}` as TokenListId]) &&
    shouldEnableFrequency(
      position.swapInterval.toString(),
      position.from.address,
      position.to.address,
      position.chainId
    );

  const onModifyRate = () => {
    const remainingLiquidityToUse = position.rate.amount * position.remainingSwaps;

    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(remainingLiquidityToUse, position.from.decimals),
        rate: formatUnits(position.rate.amount, position.from.decimals),
        frequencyValue: position.remainingSwaps.toString(),
      })
    );
    trackEvent('DCA - Position details - Show add funds modal');
    setShowModifyRateSettingsModal(true);
  };
  const connectedNetwork = useWalletNetwork(position.user);

  const isOnNetwork = connectedNetwork?.chainId === position.chainId;

  const showSwitchAction =
    !isOnNetwork && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(ownerWallet?.providerInfo?.name || '');

  const disableModifyPosition = isPending || showSwitchAction || !SUPPORTED_NETWORKS_DCA.includes(position.chainId);

  const ModifyButton = (
    <Button variant="outlined" disabled={disableModifyPosition} fullWidth onClick={onModifyRate} size="large">
      <FormattedMessage description="managePosition" defaultMessage="Manage position" />
    </Button>
  );

  const SwitchNetworkButton = (
    <Button variant="outlined" fullWidth onClick={onSwitchNetwork} size="large">
      <FormattedMessage description="switchNetwork" defaultMessage="Switch network" />
    </Button>
  );

  const reconnectingWalletDisplay = getDisplayWallet(ownerWallet);

  const ReconnectButton = (
    <Button fullWidth variant="outlined" onClick={() => openConnectModal(WalletActionType.reconnect)} size="large">
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

  let ButtonToRender = null;

  if (showSwitchAction) {
    ButtonToRender = SwitchNetworkButton;
  } else if (ownerWallet?.status === WalletStatus.disconnected) {
    ButtonToRender = ReconnectButton;
  } else if (showExtendedFunctions) {
    ButtonToRender = ModifyButton;
  }

  return (
    <ButtonContainer>
      <ModifySettingsModal
        open={showModifyRateSettingsModal}
        position={position}
        onCancel={() => setShowModifyRateSettingsModal(false)}
      />
      {ButtonToRender}
    </ButtonContainer>
  );
};

export default PositionDataMainButton;
