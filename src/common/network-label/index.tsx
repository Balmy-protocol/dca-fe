import React from 'react';
import styled from 'styled-components';
import { NETWORKS } from 'config/constants';
import { Typography } from '@material-ui/core';

const StyledLabel = styled.div`
  padding: 10px;
  border-radius: 20px;
  background-color: rgba(243, 132, 30, 0.05);
  color: rgb(243, 183, 30);
  font-weight: 500 !important;
  margin-right: 10px;
`;
interface NetworkLabelProps {
  network: {
    chainId: number;
    name: string;
  } | null;
}

const NetworkLabel = ({ network }: NetworkLabelProps) => {
  if (!network || (network && network.chainId === NETWORKS.mainnet.chainId)) return null;
  return (
    <StyledLabel>
      <Typography variant="body1">{network.name}</Typography>
    </StyledLabel>
  );
};

export default NetworkLabel;
