import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import find from 'lodash/find';
import { NETWORKS, NETWORKS_FOR_MENU } from 'config/constants';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import useWeb3Service from 'hooks/useWeb3Service';
import { createStyles, makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import TokenIcon from 'common/token-icon';
import { emptyTokenWithAddress } from 'utils/currency';

const usePopoverStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(1),
    },
  })
);

const StyledConnectedCircle = styled.div<{ isMainnet: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 30px;
  background-color: rgb(245 183 24);
  background-color: ${(props) => (props.isMainnet ? 'green' : 'rgb(245 183 24)')};
`;

const StyledMenu = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  flex-direction: column;
`;

const StyledMenuItem = styled(Button)`
  margin-top: 10px;
  text-transform: none;
`;

const StyledTokenIconContainer = styled.div`
  margin-right: 5px;
  display: flex;
`;

const StyledButton = styled(Button).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    (!['isMainnet'].includes(prop) && defaultValidatorFn(prop)) || ['startIcon'].includes(prop),
})<{ isMainnet: boolean }>`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  background-color: ${(props) => (props.isMainnet ? '#FFF' : 'rgba(243, 132, 30, 0.2)')};
  color: ${(props) => (props.isMainnet ? 'black' : 'rgb(188 135 0)')};
  margin-right: 10px;
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

const NetworkLabel = ({ network }: NetworkLabelProps) => {
  const popoverClasses = usePopoverStyles();
  const [shouldOpenNetworkMenu, setShouldOpenNetworkMenu] = React.useState(false);
  const web3Service = useWeb3Service();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShouldOpenNetworkMenu(true);
  };

  const handleClose = (chainId: number) => {
    setAnchorEl(null);
    setShouldOpenNetworkMenu(false);
    web3Service.changeNetwork(chainId);
  };

  const networkName = React.useMemo(() => {
    const supportedNetwork = find(NETWORKS, { chainId: network.chainId });
    return (supportedNetwork && supportedNetwork.name) || capitalizeFirstLetter(network.name);
  }, [network]);

  return (
    <>
      <StyledButton
        aria-controls="customized-menu"
        aria-haspopup="true"
        color="primary"
        onClick={handleClick}
        style={{ maxWidth: '220px', textTransform: 'none' }}
        isMainnet={NETWORKS_FOR_MENU.includes(network.chainId)}
        endIcon={<StyledConnectedCircle isMainnet={NETWORKS_FOR_MENU.includes(network.chainId)} />}
      >
        <StyledTokenIconContainer>
          <TokenIcon
            size="20px"
            token={emptyTokenWithAddress(find(NETWORKS, { chainId: network.chainId })?.mainCurrency || '')}
          />
        </StyledTokenIconContainer>
        <Typography variant="body1">{networkName}</Typography>
      </StyledButton>
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
      >
        <StyledMenu>
          {NETWORKS_FOR_MENU.map((chainId) => (
            <StyledMenuItem variant="outlined" color="default" size="small" onClick={() => handleClose(chainId)}>
              <StyledTokenIconContainer>
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
