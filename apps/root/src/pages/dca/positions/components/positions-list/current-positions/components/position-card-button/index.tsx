import * as React from 'react';
import find from 'lodash/find';
import { Typography, Link, OpenInNewIcon, Button, ContainerBox, colors } from 'ui-library';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import { NetworkStruct, Position, Token, TokenListId, Wallet, WalletStatus } from '@types';
import { NETWORKS, OLD_VERSIONS, VERSIONS_ALLOWED_MODIFY, shouldEnableFrequency, DCA_PAIR_BLACKLIST } from '@constants';

import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import { setNetwork } from '@state/config/actions';
import useAnalytics from '@hooks/useAnalytics';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { getDisplayWallet } from '@common/utils/parsing';
import useDcaTokens from '@hooks/useDcaTokens';
import { WalletActionType } from '@services/accountService';

const StyledCardFooterButton = styled(Button).attrs({ variant: 'outlined' })``;

const StyledCallToActionContainer = styled(ContainerBox).attrs({ fullWidth: true, justifyContent: 'center' })``;

interface PositionProp extends DistributiveOmit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface PositionCardButtonProps {
  position: PositionProp;
  handleOnWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  wallet: Wallet | undefined;
  showSwitchAction: boolean;
}

const PositionCardButton = ({
  position,
  handleOnWithdraw,
  onReusePosition,
  disabled,
  hasSignSupport,
  wallet,
  showSwitchAction,
}: PositionCardButtonProps) => {
  const { pendingTransaction, toWithdraw, chainId } = position;
  const walletIsConnected = wallet?.status === WalletStatus.connected;
  const openConnectModal = useOpenConnectModal();
  const dcaTokens = useDcaTokens(chainId, true);

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);
  const { trackEvent } = useAnalytics();
  const intl = useIntl();

  const onChangeNetwork = () => {
    trackEvent('DCA - Position List - Change network', { chainId });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, position.user, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
  };

  const handleReusePosition = () => {
    onReusePosition(position);
    trackEvent('DCA - Position List - Add funds');
  };

  if (isPending) {
    return (
      <StyledCallToActionContainer>
        <StyledCardFooterButton fullWidth size="large">
          <Link
            href={buildEtherscanTransaction(pendingTransaction, positionNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
            underline="none"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography
              variant="bodySmallRegular"
              component="span"
              color={({ palette }) => colors[palette.mode].typography.typo2}
            >
              <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </Link>
        </StyledCardFooterButton>
      </StyledCallToActionContainer>
    );
  }

  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;

  const canAddFunds = VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const disabledIncrease =
    disabled ||
    !dcaTokens[`${chainId}-${position.from.address.toLowerCase()}` as TokenListId] ||
    !dcaTokens[`${chainId}-${position.to.address.toLowerCase()}` as TokenListId] ||
    (fromHasYield &&
      !dcaTokens[`${chainId}-${position.from.underlyingTokens[0]?.address.toLowerCase()}` as TokenListId]) ||
    (toHasYield && !dcaTokens[`${chainId}-${position.to.underlyingTokens[0]?.address.toLowerCase()}` as TokenListId]) ||
    DCA_PAIR_BLACKLIST.includes(position.pairId) ||
    !shouldEnableFrequency(
      position.swapInterval.toString(),
      position.from.address,
      position.to.address,
      position.chainId
    );

  const reconnectingWalletDisplay = getDisplayWallet(wallet);

  return (
    <StyledCallToActionContainer>
      {!walletIsConnected && (
        <Button onClick={() => openConnectModal(WalletActionType.reconnect)} variant="contained" fullWidth size="large">
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
      )}
      {showSwitchAction && (
        <StyledCardFooterButton onClick={onChangeNetwork} fullWidth size="large">
          <FormattedMessage
            description="incorrect network"
            defaultMessage="Switch to {network}"
            values={{ network: positionNetwork.name }}
          />
        </StyledCardFooterButton>
      )}
      {!OLD_VERSIONS.includes(position.version) && walletIsConnected && !showSwitchAction && (
        <>
          {!disabled && (
            <StyledCardFooterButton onClick={handleReusePosition} disabled={disabledIncrease} fullWidth size="large">
              <FormattedMessage description="addFunds" defaultMessage="Add funds" />
            </StyledCardFooterButton>
          )}
        </>
      )}
      {OLD_VERSIONS.includes(position.version) && walletIsConnected && !showSwitchAction && (
        <>
          {canAddFunds ? (
            <StyledCardFooterButton onClick={handleReusePosition} fullWidth disabled={disabled} size="large">
              <FormattedMessage description="addFunds" defaultMessage="Add funds" />
            </StyledCardFooterButton>
          ) : (
            <StyledCardFooterButton
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              fullWidth
              disabled={disabled || toWithdraw.amount <= 0n}
              size="large"
            >
              <FormattedMessage
                description="withdrawToken"
                defaultMessage="Withdraw {token}"
                values={{
                  token:
                    hasSignSupport || position.to.address !== PROTOCOL_TOKEN_ADDRESS
                      ? position.to.symbol
                      : wrappedProtocolToken.symbol,
                }}
              />
            </StyledCardFooterButton>
          )}
        </>
      )}
    </StyledCallToActionContainer>
  );
};
export default PositionCardButton;
