import { DisplayStrategy } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, ContainerBox } from 'ui-library';
import DataHistoricalRate from '../vault-data/components/data-historical-rate';

interface InvestmentDataProps {
  strategy?: DisplayStrategy;
}

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)}
  `}
`;

const InvestmentData = ({ strategy }: InvestmentDataProps) => {
  return (
    <StyledPaper>
      <ContainerBox flexDirection="column" alignItems="stretch" gap={6}>
        <DataHistoricalRate strategy={strategy} />
      </ContainerBox>
    </StyledPaper>
  );
};

export default InvestmentData;
