import { DisplayStrategy } from 'common-types';
import React from 'react';
import { BackgroundPaper, ContainerBox } from 'ui-library';
import DataHeader from './components/data-header';
import DataCards from './components/data-cards';
import DataAbout from './components/data-about';
import DataGuardian from './components/data-guardian';
import RewardsContainer from './components/data-rewards';
import { isNil } from 'lodash';

interface VaultDataProps {
  strategy?: DisplayStrategy;
}

const VaultData = ({ strategy }: VaultDataProps) => {
  return (
    <BackgroundPaper variant="outlined">
      <ContainerBox flexDirection="column" alignItems="stretch" gap={6}>
        <DataHeader strategy={strategy} />
        <DataCards strategy={strategy} isLocked={!isNil(strategy?.needsTier)} />
        {!!strategy?.guardian && <DataGuardian strategy={strategy} />}
        <RewardsContainer strategy={strategy} />
        <DataAbout strategy={strategy} collapsed />
      </ContainerBox>
    </BackgroundPaper>
  );
};

export default VaultData;
