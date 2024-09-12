import { DisplayStrategy } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox } from 'ui-library';
import DataHeader from './components/data-header';
import DataCards from './components/data-cards';
import DataAbout from './components/data-about';
import DataGuardian from './components/data-guardian';

interface VaultDataProps {
  strategy?: DisplayStrategy;
}

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)}
  `}
`;

const VaultData = ({ strategy }: VaultDataProps) => {
  return (
    <StyledPaper>
      <ContainerBox flexDirection="column" alignItems="stretch" gap={6}>
        <DataHeader strategy={strategy} />
        <DataCards strategy={strategy} />
        {!!strategy?.guardian && <DataGuardian strategy={strategy} />}
        <DataAbout strategy={strategy} collapsed />
      </ContainerBox>
    </StyledPaper>
  );
};

export default VaultData;
