import { Strategy } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox, DividerBorder2 } from 'ui-library';
import DataHeader from './components/data-header';
import DataCards from './components/data-cards';
import DataAbout from './components/data-about';
import DataHistoricalRate from './components/data-historical-rate';

interface VaultDataProps {
  strategy?: Strategy;
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
        <DividerBorder2 />
        <DataCards strategy={strategy} />
        <DataAbout strategy={strategy} />
        <DataHistoricalRate strategy={strategy} />
      </ContainerBox>
    </StyledPaper>
  );
};

export default VaultData;
