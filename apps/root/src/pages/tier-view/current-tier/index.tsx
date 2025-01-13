import React from 'react';
import { ContainerBox } from 'ui-library';
import Tiers from './tiers';
import MyTier from './my-tier';

const CurrentTier = () => {
  return (
    <ContainerBox gap={12} flexDirection="column">
      <MyTier />
      <Tiers />
    </ContainerBox>
  );
};

export default CurrentTier;
