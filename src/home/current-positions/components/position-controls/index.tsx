import * as React from 'react';
import find from 'lodash/find';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Position, Token, YieldOptions } from 'types';
import { useHistory } from 'react-router-dom';
import { TOKEN_BLACKLIST, NETWORKS, OLD_VERSIONS, VERSIONS_ALLOWED_MODIFY } from 'config/constants';
import { BigNumber } from 'ethers';
import { buildEtherscanTransaction } from 'utils/etherscan';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import useWalletService from 'hooks/useWalletService';
import { useAppDispatch } from 'state/hooks';
import { setPosition } from 'state/position-details/actions';
import { changePositionDetailsTab } from 'state/tabs/actions';
import useTokenList from 'hooks/useTokenList';
import useConnectedNetwork from 'hooks/useConnectedNetwork';

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
  const [connectedNetwork] = useConnectedNetwork();
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
  const history = useHistory();
  const walletService = useWalletService();
  const dispatch = useAppDispatch();
  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);
  const tokenList = useTokenList();

  const onViewDetails = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(setPosition(null));
    dispatch(changePositionDetailsTab(0));
    history.push(`/${chainId}/positions/${position.version}/${position.positionId}`);
  };

  const onChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId);
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

  const shouldShowMigrate =
    hasSignSupport && remainingSwaps.gt(BigNumber.from(0)) && toIsSupportedInNewVersion && fromIsSupportedInNewVersion;

  const shouldMigrateToYield =
    !!(fromSupportsYield || toSupportsYield) && toIsSupportedInNewVersion && fromIsSupportedInNewVersion;

  const canAddFunds = VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const disabledIncrease =
    disabled ||
    TOKEN_BLACKLIST.includes(position.from.address) ||
    TOKEN_BLACKLIST.includes(fromSupportsYield?.tokenAddress || '');

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
          {toWithdraw.gt(BigNumber.from(0)) && (
            <MenuItem
              onClick={() => {
                handleClose();
                onWithdraw(position, hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS);
              }}
              disabled={disabled || !isOnNetwork}
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
          {toWithdraw.gt(BigNumber.from(0)) && hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS && (
            <MenuItem
              onClick={() => {
                handleClose();
                onWithdraw(position, false);
              }}
              disabled={disabled || !isOnNetwork}
            >
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
          <MenuItem
            onClick={(e) => {
              handleClose();
              onViewDetails(e);
            }}
            disabled={disabled}
          >
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
          <MenuItem
            onClick={() => {
              handleClose();
              onTerminate(position);
            }}
            disabled={disabled || !isOnNetwork}
            style={{ color: '#FF5359' }}
          >
            <FormattedMessage description="terminate position" defaultMessage="Close position" />
          </MenuItem>
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
      {!OLD_VERSIONS.includes(position.version) && isOnNetwork && (
        <>
          {!disabled && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={() => onReusePosition(position)}
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
              onClick={() => onMigrateYield(position)}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {remainingSwaps.lte(BigNumber.from(0)) && shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={() => onSuggestMigrateYield(position)}
              fullWidth
              disabled={disabled}
            >
              <Typography variant="body2">
                <FormattedMessage description="addFunds" defaultMessage="Add funds" />
              </Typography>
            </StyledCardFooterButton>
          )}
          {!shouldMigrateToYield && canAddFunds && (
            <StyledCardFooterButton
              variant="contained"
              color="secondary"
              onClick={() => onReusePosition(position)}
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
              onClick={() => onMigrateYield(position)}
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
              onClick={() => onWithdraw(position, hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
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
