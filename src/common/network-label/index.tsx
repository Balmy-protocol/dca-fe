import React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import { NETWORKS } from 'config/constants';
import { Typography } from '@material-ui/core';

const StyledLabel = styled.div`
  padding: 10px;
  border-radius: 20px;
  background-color: rgba(243, 132, 30, 0.2);
  color: rgb(188 135 0);
  font-weight: 500 !important;
  margin-right: 10px;
`;
interface NetworkLabelProps {
  network: {
    chainId: number;
    name: string;
  } | null;
}

function capitalizeFirstLetter(toCap: string) {
  return toCap.charAt(0).toUpperCase() + toCap.slice(1);
}

const NetworkLabel = ({ network }: NetworkLabelProps) => {
  if (!network || (network && network.chainId === NETWORKS.mainnet.chainId)) return null;

  const networkName = React.useMemo(() => {
    const supportedNetwork = find(NETWORKS, { chainId: network.chainId });
    return (supportedNetwork && supportedNetwork.name) || capitalizeFirstLetter(network.name);
  }, [network]);

  return (
    <StyledLabel>
      <Typography variant="body1">{networkName}</Typography>
    </StyledLabel>
  );
};

export default NetworkLabel;
