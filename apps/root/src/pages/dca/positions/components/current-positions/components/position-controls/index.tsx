import * as React from 'react';
import find from 'lodash/find';
import {
  Typography,
  Link,
  IconButton,
  Menu,
  MenuItem,
  OpenInNewIcon,
  MoreVertIcon,
  createStyles,
  Button,
} from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { NetworkStruct, Position, Token, TokenListId, WalletStatus, YieldOptions } from '@types';
import {
  NETWORKS,
  OLD_VERSIONS,
  VERSIONS_ALLOWED_MODIFY,
  shouldEnableFrequency,
  DISABLED_YIELD_WITHDRAWS,
  DCA_TOKEN_BLACKLIST,
  DCA_PAIR_BLACKLIST,
  CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH,
} from '@constants';

import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { withStyles } from 'tss-react/mui';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import { setPosition } from '@state/position-details/actions';
import { changePositionDetailsTab } from '@state/tabs/actions';
import useTokenList from '@hooks/useTokenList';
import usePushToHistory from '@hooks/usePushToHistory';
import { setNetwork } from '@state/config/actions';
import useWeb3Service from '@hooks/useWeb3Service';
// import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useTrackEvent from '@hooks/useTrackEvent';
import useWallet from '@hooks/useWallet';
import useWalletNetwork from '@hooks/useWalletNetwork';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const StyledCardFooterButton = styled(Button)``;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

const PositionControlsContainer = styled.div`
  display: flex;
  border-radius: 20px;
`;

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      border: '2px solid',
      borderRadius: '8px',
    },
  })
);

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface PositionControlsProps {
  position: PositionProp;
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  onReusePosition: (position: Position) => void;
  onMigrateYield: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  onTerminate: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  yieldOptions: YieldOptions;
}

const PositionControls = ({
  position,
  onWithdraw,
  onReusePosition,
  onSuggestMigrateYield,
  onMigrateYield,
  onTerminate,
  disabled,
  hasSignSupport,
  yieldOptions,
}: PositionControlsProps) => {
  const { remainingSwaps, pendingTransaction, toWithdraw, chainId, user } = position;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const web3Service = useWeb3Service();
  const [connectedNetwork] = useWalletNetwork(user);
  const wallet = useWallet(user);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const isOnNetwork = connectedNetwork?.chainId === positionNetwork.chainId;
  const pushToHistory = usePushToHistory();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);
  const tokenList = useTokenList({});
  const trackEvent = useTrackEvent();

  const onViewDetails = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(setPosition(undefined));
    dispatch(changePositionDetailsTab(0));
    handleClose();
    pushToHistory(`/${chainId}/positions/${position.version}/${position.positionId}`);
    trackEvent('DCA - Position List - View details');
  };

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

  const handleOnWithdraw = (useProtocolToken: boolean) => {
    handleClose();
    onWithdraw(position, useProtocolToken);
    trackEvent('DCA - Position List - Withdraw', { useProtocolToken });
  };

  const handleReusePosition = () => {
    handleClose();
    onReusePosition(position);
    trackEvent('DCA - Position List - Add funds');
  };

  const handleSuggestMigrateYield = () => {
    handleClose();
    onSuggestMigrateYield(position);
    trackEvent('DCA - Position List - Suggest migrate yield');
  };

  const handleMigrateYield = () => {
    handleClose();
    onMigrateYield(position);
    trackEvent('DCA - Position List - Migrate yield');
  };

  const handleTerminate = () => {
    handleClose();
    onTerminate(position);
    trackEvent('DCA - Position List - Terminate');
  };

  if (isPending) {
    return (
      <StyledCallToActionContainer>
        <StyledCardFooterButton variant="contained" fullWidth>
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

  const walletIsConnected = wallet.status === WalletStatus.connected;

  const showSwitchAction =
    walletIsConnected && !isOnNetwork && !CHAIN_CHANGING_WALLETS_WITHOUT_REFRESH.includes(wallet.providerInfo.name);

  const fromIsSupportedInNewVersion =
    !!tokenList[`${position.chainId}-${position.from.address.toLowerCase()}` as TokenListId];
  const toIsSupportedInNewVersion =
    !!tokenList[`${position.chainId}-${position.to.address.toLowerCase()}` as TokenListId];
  const fromSupportsYield = find(yieldOptions, { enabledTokens: [position.from.address] });
  const toSupportsYield = find(yieldOptions, { enabledTokens: [position.to.address] });

  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;

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

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');

  const disabledTerminate =
    disabledWithdraw ||
    DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  return (
    <StyledCallToActionContainer>
      <>
        <PositionControlsContainer>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
        </PositionControlsContainer>
        <StyledMenu
          anchorEl={anchorEl}
          open={open && !isPending}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          {toWithdraw > 0n && (
            <MenuItem
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              disabled={disabled || showSwitchAction || disabledWithdraw}
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
            </MenuItem>
          )}
          {toWithdraw > 0n && hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS && (
            <MenuItem
              onClick={() => handleOnWithdraw(false)}
              disabled={disabled || showSwitchAction || disabledWithdraw}
            >
              <Typography variant="bodySmall">
                <FormattedMessage
                  description="withdrawWrapped"
                  defaultMessage="Withdraw {wrappedProtocolToken}"
                  values={{
                    wrappedProtocolToken: wrappedProtocolToken.symbol,
                  }}
                />
              </Typography>
            </MenuItem>
          )}
          <MenuItem onClick={onViewDetails} disabled={disabled}>
            <Link
              href={`/${chainId}/positions/${position.version}/${position.positionId}`}
              underline="none"
              color="inherit"
            >
              <Typography variant="bodySmall">
                <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
              </Typography>
            </Link>
          </MenuItem>
          <MenuItem onClick={handleTerminate} disabled={disabled || showSwitchAction || disabledTerminate}>
            <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
          </MenuItem>
        </StyledMenu>
      </>
      {!walletIsConnected && (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <>
              <StyledCardFooterButton variant="contained" onClick={openConnectModal} fullWidth>
                <Typography variant="bodySmall">
                  <FormattedMessage description="reconnect wallet" defaultMessage="Reconnect wallet" />
                </Typography>
              </StyledCardFooterButton>
            </>
          )}
        </ConnectButton.Custom>
      )}
      {showSwitchAction && (
        <StyledCardFooterButton variant="contained" onClick={onChangeNetwork} fullWidth>
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
            <StyledCardFooterButton
              variant="contained"
              onClick={handleReusePosition}
              disabled={disabledIncrease}
              fullWidth
            >
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
            <StyledCardFooterButton variant="contained" onClick={handleMigrateYield} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {remainingSwaps <= 0n && shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
              onClick={handleSuggestMigrateYield}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="bodySmall">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton variant="contained" onClick={handleReusePosition} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton variant="contained" onClick={handleMigrateYield} fullWidth disabled={disabled}>
              <Typography variant="bodySmall">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
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
export default PositionControls;
