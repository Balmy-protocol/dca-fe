import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Tooltip from '@mui/material/Tooltip';
import find from 'lodash/find';
import {
  getGhTokenListLogoUrl,
  NETWORKS,
  NETWORKS_FOR_MENU,
  PositionVersions,
  SUPPORTED_NETWORKS,
} from 'config/constants';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import { createStyles, makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import TokenIcon from 'common/token-icon';
import { emptyTokenWithAddress, toToken } from 'utils/currency';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import useIsOnCorrectNetwork from 'hooks/useIsOnCorrectNetwork';
import useWalletService from 'hooks/useWalletService';
import { useLocation, useParams } from 'react-router-dom';
import useLoadedAsSafeApp from 'hooks/useLoadedAsSafeApp';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useSdkChains from 'hooks/useSdkChains';
import { FormattedMessage } from 'react-intl';
import useReplaceHistory from 'hooks/useReplaceHistory';

const usePopoverStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(1),
    },
  })
);

const StyledMenu = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  flex-direction: column;
`;

const StyledMenuItem = styled(Button)`
  margin-top: 10px;
  text-transform: none;
`;

const StyledTokenIconContainer = styled.div<{ small: boolean }>`
  margin-right: ${({ small }) => (small ? '0px' : '5px')};
  display: flex;
`;

const StyledWarningIcon = styled(WarningAmberIcon)`
  margin-right: 5px;
`;

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  margin-right: 10px;
  padding: 4px 8px;
  min-width: 0px;
`;
interface NetworkLabelProps {
  network: {
    chainId: number;
    name: string;
  };
}

function capitalizeFirstLetter(toCap: string) {
  return toCap.charAt(0).toUpperCase() + toCap.slice(1);
}

const Warning = () => (
  <Tooltip
    title={
      <FormattedMessage description="networkLabelWarning" defaultMessage="You are not connected to this network" />
    }
    open
    arrow
    placement="bottom"
  >
    <StyledWarningIcon />
  </Tooltip>
);

type PositionDetailUrlParams = { positionId: string; chainId: string; positionVersion: PositionVersions };

const NetworkLabel = ({ network }: NetworkLabelProps) => {
  const popoverClasses = usePopoverStyles();
  const [shouldOpenNetworkMenu, setShouldOpenNetworkMenu] = React.useState(false);
  const walletService = useWalletService();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
  const location = useLocation();
  const urlParams = useParams<PositionDetailUrlParams>();
  const replaceHistory = useReplaceHistory();
  const loadedAsSafeApp = useLoadedAsSafeApp();
  const currentBreakPoint = useCurrentBreakpoint();
  const aggSupportedNetworks = useSdkChains();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (loadedAsSafeApp) {
      return;
    }

    setAnchorEl(event.currentTarget);
    setShouldOpenNetworkMenu(true);
  };

  const handleClose = (chainId?: number) => {
    setAnchorEl(null);
    setShouldOpenNetworkMenu(false);
    if (chainId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetwork(chainId, () => {
        if (location.pathname.startsWith('/positions')) {
          replaceHistory('/positions');
        } else if (location.pathname === '/' || location.pathname.startsWith('/create')) {
          replaceHistory(`/create/${chainId}`);
        } else if (location.pathname.startsWith('/position')) {
          const { positionId, positionVersion } = urlParams;
          replaceHistory(`/${chainId}/positions/${positionVersion}/${positionId}`);
        } else if (location.pathname.startsWith('/swap')) {
          replaceHistory(`/swap/${chainId}`);
        }
      });
    }
  };

  const networkName = React.useMemo(() => {
    const supportedNetwork = find(NETWORKS, { chainId: network.chainId });
    return (supportedNetwork && supportedNetwork.name) || capitalizeFirstLetter(network.name);
  }, [network]);

  const foundNetwork = find(NETWORKS, { chainId: network.chainId });
  const buttonToRender = (
    <StyledButton
      aria-controls="customized-menu"
      aria-haspopup="true"
      color="transparent"
      variant="outlined"
      style={{ maxWidth: '220px', textTransform: 'none', cursor: 'default' }}
      endIcon={isOnCorrectNetwork ? null : <Warning />}
    >
      {(NETWORKS_FOR_MENU.includes(network.chainId) || aggSupportedNetworks.includes(network.chainId)) && (
        <StyledTokenIconContainer small={currentBreakPoint === 'xs'}>
          <TokenIcon
            size={currentBreakPoint === 'xs' ? '25px' : '20px'}
            token={toToken({
              address: foundNetwork?.mainCurrency || '',
              chainId: network.chainId,
              logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
            })}
          />
        </StyledTokenIconContainer>
      )}
      {currentBreakPoint !== 'xs' && <Typography variant="body1">{networkName}</Typography>}
    </StyledButton>
  );

  const componentToRender =
    SUPPORTED_NETWORKS.includes(network.chainId) || aggSupportedNetworks.includes(network.chainId) ? (
      buttonToRender
    ) : (
      <Tooltip title="We do not support this network. You are seeing data from Optimism" arrow placement="top">
        {buttonToRender}
      </Tooltip>
    );

  return (
    <>
      {componentToRender}
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        open={shouldOpenNetworkMenu}
        classes={popoverClasses}
        onClose={() => handleClose()}
        disableEnforceFocus
      >
        <StyledMenu>
          {NETWORKS_FOR_MENU.map((chainId) => (
            <StyledMenuItem
              key={chainId}
              color="transparent"
              variant="outlined"
              size="small"
              onClick={() => handleClose(chainId)}
            >
              <StyledTokenIconContainer small={false}>
                <TokenIcon
                  size="20px"
                  token={emptyTokenWithAddress((find(NETWORKS, { chainId }) || { mainCurrency: '' }).mainCurrency)}
                />
              </StyledTokenIconContainer>
              {(find(NETWORKS, { chainId }) || { name: '' }).name}
            </StyledMenuItem>
          ))}
        </StyledMenu>
      </Popover>
    </>
  );
};

export default NetworkLabel;
