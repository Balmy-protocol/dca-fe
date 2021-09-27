import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import find from 'lodash/find';
import { NETWORKS } from 'config/constants';
import { Typography } from '@material-ui/core';
import NetworkMenu from 'common/network-menu';

const StyledConnectedCircle = styled.div<{ isMainnet: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 30px;
  background-color: rgb(245 183 24);
  background-color: ${(props) => (props.isMainnet ? 'green' : 'rgb(245 183 24)')};
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
  const [shouldOpenNetworkMenu, setShouldOpenNetworkMenu] = React.useState(false);

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
        onClick={() => setShouldOpenNetworkMenu(true)}
        style={{ maxWidth: '200px', textTransform: 'none' }}
        isMainnet={network.chainId === NETWORKS.mainnet.chainId}
        startIcon={<StyledConnectedCircle isMainnet={network.chainId === NETWORKS.mainnet.chainId} />}
      >
        <Typography variant="body1">{networkName}</Typography>
      </StyledButton>

      <NetworkMenu open={shouldOpenNetworkMenu} onClose={() => setShouldOpenNetworkMenu(false)} />
    </>
  );
};

export default NetworkLabel;
