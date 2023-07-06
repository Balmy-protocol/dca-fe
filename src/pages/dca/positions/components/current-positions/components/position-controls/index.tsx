import * as React from 'react';
import find from 'lodash/find';
import Button from '@common/components/button';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { NetworkStruct, Position, Token, YieldOptions } from '@types';
import {
  NETWORKS,
  OLD_VERSIONS,
  VERSIONS_ALLOWED_MODIFY,
  shouldEnableFrequency,
  DISABLED_YIELD_WITHDRAWS,
  DCA_TOKEN_BLACKLIST,
  DCA_PAIR_BLACKLIST,
  LATEST_VERSION,
  COMPANION_ADDRESS,
} from '@constants';
import { BigNumber } from 'ethers';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import useWalletService from '@hooks/useWalletService';
import { useAppDispatch } from '@state/hooks';
import { setPosition } from '@state/position-details/actions';
import { changePositionDetailsTab } from '@state/tabs/actions';
import useTokenList from '@hooks/useTokenList';
import usePushToHistory from '@hooks/usePushToHistory';
import { setNetwork } from '@state/config/actions';
import useWeb3Service from '@hooks/useWeb3Service';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useTrackEvent from '@hooks/useTrackEvent';
import {
  mergeCompanionPermissions,
  createPermissionsObject,
  PositionPermissions,
} from '@state/position-permissions/hooks';

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
  background-color: rgba(216, 216, 216, 0.05);
`;

const StyledMenu = withStyles(() =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
      borderRadius: '8px',
    },
  })
)(Menu);

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
  const { remainingSwaps, pendingTransaction, toWithdraw, chainId } = position;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const connectedNetwork = useCurrentNetwork();
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const web3Service = useWeb3Service();
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
  const tokenList = useTokenList();
  const trackEvent = useTrackEvent();

  const onViewDetails = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(setPosition(null));
    dispatch(changePositionDetailsTab(0));
    handleClose();
    pushToHistory(`/${chainId}/positions/${position.version}/${position.positionId}`);
    trackEvent('DCA - Position List - View details');
  };

  const onChangeNetwork = () => {
    trackEvent('DCA - Position List - Change network', { chainId });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, () => {
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
        <StyledCardFooterButton variant="contained" color="pending" fullWidth>
          <Link
            href={buildEtherscanTransaction(pendingTransaction, positionNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
            underline="none"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography variant="body2" component="span">
              <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </Link>
        </StyledCardFooterButton>
      </StyledCallToActionContainer>
    );
  }

  const showSwitchAction = !isOnNetwork;

  const fromIsSupportedInNewVersion = !!tokenList[position.from.address];
  const toIsSupportedInNewVersion = !!tokenList[position.to.address];
  const fromSupportsYield = find(yieldOptions, { enabledTokens: [position.from.address] });
  const toSupportsYield = find(yieldOptions, { enabledTokens: [position.to.address] });

  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;

  const shouldShowMigrate =
    hasSignSupport && remainingSwaps.gt(BigNumber.from(0)) && toIsSupportedInNewVersion && fromIsSupportedInNewVersion;

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
  const account = web3Service.getAccount();
  const companionAddress =
    COMPANION_ADDRESS[position.version][position.chainId] || COMPANION_ADDRESS[LATEST_VERSION][position.chainId];

  const isToProtocolToken = position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const hasYield = !!position.to.underlyingTokens.length || !!position.from.underlyingTokens.length;

  const companionPermissions = createPermissionsObject(
    false,
    position?.permissions?.find((permission) => permission.operator === companionAddress.toLowerCase())?.permissions
  );

  const accountPermissions = createPermissionsObject(
    account.toLowerCase() === position.user.toLowerCase(),
    position?.permissions?.find((permission) => permission.operator === account.toLowerCase())?.permissions
  ) as PositionPermissions;

  const mergedPermissions =
    hasYield || isToProtocolToken
      ? mergeCompanionPermissions(accountPermissions, companionPermissions)
      : accountPermissions;

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');

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
          {toWithdraw.gt(BigNumber.from(0)) && mergedPermissions.WITHDRAW && (
            <MenuItem
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              disabled={disabled || !isOnNetwork || disabledWithdraw}
            >
              <Typography variant="body2">
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
          {toWithdraw.gt(BigNumber.from(0)) && hasSignSupport && isToProtocolToken && accountPermissions.WITHDRAW && (
            <MenuItem onClick={() => handleOnWithdraw(false)} disabled={disabled || !isOnNetwork || disabledWithdraw}>
              <Typography variant="body2">
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
              <Typography variant="body2">
                <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
              </Typography>
            </Link>
          </MenuItem>
          {((accountPermissions.TERMINATE && !hasYield) || mergedPermissions.TERMINATE) && (
            <MenuItem
              onClick={handleTerminate}
              disabled={disabled || !isOnNetwork || disabledWithdraw}
              style={{ color: '#FF5359' }}
            >
              <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
            </MenuItem>
          )}
        </StyledMenu>
      </>
      {showSwitchAction && (
        <StyledCardFooterButton variant="contained" color="secondary" onClick={onChangeNetwork} fullWidth>
          <Typography variant="body2">
            <FormattedMessage
              description="incorrect network"
              defaultMessage="Switch to {network}"
              values={{ network: positionNetwork.name }}
            />
          </Typography>
        </StyledCardFooterButton>
      )}
      {!OLD_VERSIONS.includes(position.version) && isOnNetwork && mergedPermissions.INCREASE && (
        <>
          {!disabled && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={handleReusePosition}
              disabled={disabledIncrease}
              fullWidth
            >
              <Typography variant="body2">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
        </>
      )}
      {OLD_VERSIONS.includes(position.version) && isOnNetwork && (
        <>
          {shouldShowMigrate && shouldMigrateToYield && (
            <StyledCardFooterButton
              variant="contained"
              color="migrate"
              onClick={handleMigrateYield}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {remainingSwaps.lte(BigNumber.from(0)) && shouldMigrateToYield && canAddFunds && mergedPermissions.INCREASE && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={handleSuggestMigrateYield}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && canAddFunds && mergedPermissions.INCREASE && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={handleReusePosition}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
              color="migrate"
              onClick={handleMigrateYield}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && !canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={() => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
              fullWidth
              disabled={disabled || toWithdraw.lte(BigNumber.from(0))}
            >
              <Typography variant="body2">
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
