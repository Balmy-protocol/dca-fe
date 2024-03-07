import * as React from 'react';
import find from 'lodash/find';
import { Typography, Link, OpenInNewIcon, Button } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { NetworkStruct, Position, Token, TokenListId, YieldOptions } from '@types';
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
import useTokenList from '@hooks/useTokenList';
import { setNetwork } from '@state/config/actions';
import useWeb3Service from '@hooks/useWeb3Service';
import useTrackEvent from '@hooks/useTrackEvent';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const StyledCardFooterButton = styled(Button).attrs({ variant: 'outlined' })``;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface PositionCardButtonProps {
  position: PositionProp;
  handleOnWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: (position: Position) => void;
  onMigrateYield: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  yieldOptions: YieldOptions;
  walletIsConnected: boolean;
  showSwitchAction: boolean;
}

const PositionCardButton = ({
  position,
  handleOnWithdraw,
  onReusePosition,
  onSuggestMigrateYield,
  onMigrateYield,
  disabled,
  hasSignSupport,
  yieldOptions,
  walletIsConnected,
  showSwitchAction,
}: PositionCardButtonProps) => {
  const { remainingSwaps, pendingTransaction, toWithdraw, chainId } = position;
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
  const tokenList = useTokenList({});
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

  const handleSuggestMigrateYield = () => {
    onSuggestMigrateYield(position);
    trackEvent('DCA - Position List - Suggest migrate yield');
  };

  const handleMigrateYield = () => {
    onMigrateYield(position);
    trackEvent('DCA - Position List - Migrate yield');
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

  const fromIsSupportedInNewVersion =
    !!tokenList[`${position.chainId}-${position.from.address.toLowerCase()}` as TokenListId];
  const toIsSupportedInNewVersion =
    !!tokenList[`${position.chainId}-${position.to.address.toLowerCase()}` as TokenListId];
  const fromSupportsYield = find(yieldOptions, { enabledTokens: [position.from.address] });
  const toSupportsYield = find(yieldOptions, { enabledTokens: [position.to.address] });

  const fromHasYield = !!position.from.underlyingTokens.length;

  const shouldShowMigrate =
    hasSignSupport && remainingSwaps > 0n && toIsSupportedInNewVersion && fromIsSupportedInNewVersion;

  const shouldMigrateToYield =
    !!(fromSupportsYield || toSupportsYield) && toIsSupportedInNewVersion && fromIsSupportedInNewVersion;

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
                <Typography variant="bodySmall">
                  <FormattedMessage description="reconnect wallet" defaultMessage="Reconnect wallet" />
                </Typography>
              </StyledCardFooterButton>
            </>
          )}
        </ConnectButton.Custom>
      )}
      {showSwitchAction && (
        <StyledCardFooterButton onClick={onChangeNetwork} fullWidth>
          <Typography variant="bodySmall">
            <FormattedMessage
              description="incorrect network"
              defaultMessage="Switch to {network}"
              values={{ network: positionNetwork.name }}
            />
          </Typography>
        </StyledCardFooterButton>
      )}
      {!OLD_VERSIONS.includes(position.version) && walletIsConnected && !showSwitchAction && (
        <>
          {!disabled && (
            <StyledCardFooterButton onClick={handleReusePosition} disabled={disabledIncrease} fullWidth>
              <Typography variant="bodySmall">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
        </>
      )}
      {OLD_VERSIONS.includes(position.version) && walletIsConnected && !showSwitchAction && (
        <>
          {shouldShowMigrate && shouldMigrateToYield && (
            <StyledCardFooterButton onClick={handleMigrateYield} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {remainingSwaps <= 0n && shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton onClick={handleSuggestMigrateYield} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton onClick={handleReusePosition} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton onClick={handleMigrateYield} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              fullWidth
              disabled={disabled || toWithdraw <= 0n}
            >
              <Typography variant="bodySmall">
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
              </Typography>
            </StyledCardFooterButton>
          )}
        </>
      )}
    </StyledCallToActionContainer>
  );
};
export default PositionCardButton;
