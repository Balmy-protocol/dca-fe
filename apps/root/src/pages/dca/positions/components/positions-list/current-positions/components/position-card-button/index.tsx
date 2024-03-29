import * as React from 'react';
import find from 'lodash/find';
import { Typography, Link, OpenInNewIcon, Button, ContainerBox } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { NetworkStruct, Position, Token } from '@types';
import {
  NETWORKS,
  OLD_VERSIONS,
  VERSIONS_ALLOWED_MODIFY,
  shouldEnableFrequency,
  DCA_TOKEN_BLACKLIST,
  DCA_PAIR_BLACKLIST,
} from '@constants';

import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import { setNetwork } from '@state/config/actions';
import useWeb3Service from '@hooks/useWeb3Service';
import useTrackEvent from '@hooks/useTrackEvent';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const StyledCardFooterButton = styled(Button).attrs({ variant: 'outlined' })``;

const StyledCallToActionContainer = styled(ContainerBox).attrs({ fullWidth: true, justifyContent: 'center' })``;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface PositionCardButtonProps {
  position: PositionProp;
  handleOnWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  walletIsConnected: boolean;
  showSwitchAction: boolean;
}

const PositionCardButton = ({
  position,
  handleOnWithdraw,
  onReusePosition,
  disabled,
  hasSignSupport,
  walletIsConnected,
  showSwitchAction,
}: PositionCardButtonProps) => {
  const { pendingTransaction, toWithdraw, chainId } = position;
  const web3Service = useWeb3Service();

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);
  const trackEvent = useTrackEvent();

  const onChangeNetwork = () => {
    trackEvent('DCA - Position List - Change network', { chainId });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, position.user, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
  };

  const handleReusePosition = () => {
    onReusePosition(position);
    trackEvent('DCA - Position List - Add funds');
  };

  if (isPending) {
    return (
      <StyledCallToActionContainer>
        <StyledCardFooterButton fullWidth>
          <Link
            href={buildEtherscanTransaction(pendingTransaction, positionNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
            underline="none"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography variant="bodySmall" component="span">
              <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </Link>
        </StyledCardFooterButton>
      </StyledCallToActionContainer>
    );
  }

  const fromHasYield = !!position.from.underlyingTokens.length;

  const canAddFunds = VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const disabledIncrease =
    disabled ||
    DCA_TOKEN_BLACKLIST.includes(position.from.address) ||
    DCA_PAIR_BLACKLIST.includes(position.pairId) ||
    DCA_TOKEN_BLACKLIST.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '') ||
    !shouldEnableFrequency(
      position.swapInterval.toString(),
      position.from.address,
      position.to.address,
      position.chainId
    );

  return (
    <StyledCallToActionContainer>
      {!walletIsConnected && (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <>
              <StyledCardFooterButton onClick={openConnectModal} fullWidth>
                <FormattedMessage description="reconnect wallet" defaultMessage="Reconnect wallet" />
              </StyledCardFooterButton>
            </>
          )}
        </ConnectButton.Custom>
      )}
      {showSwitchAction && (
        <StyledCardFooterButton onClick={onChangeNetwork} fullWidth>
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
            <StyledCardFooterButton onClick={handleReusePosition} disabled={disabledIncrease} fullWidth>
              <FormattedMessage description="addFunds" defaultMessage="Add funds" />
            </StyledCardFooterButton>
          )}
        </>
      )}
      {OLD_VERSIONS.includes(position.version) && walletIsConnected && !showSwitchAction && (
        <>
          {canAddFunds ? (
            <StyledCardFooterButton onClick={handleReusePosition} fullWidth disabled={disabled}>
              <FormattedMessage description="addFunds" defaultMessage="Add funds" />
            </StyledCardFooterButton>
          ) : (
            <StyledCardFooterButton
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              fullWidth
              disabled={disabled || toWithdraw.amount <= 0n}
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