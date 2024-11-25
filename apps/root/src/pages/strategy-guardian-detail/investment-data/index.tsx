import { DisplayStrategy } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, colors, Typography } from 'ui-library';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage } from 'react-intl';
import FinancialData from './components/financial-data';

interface InvestmentDataProps {
  strategy: DisplayStrategy;
}

const StyledPaper = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    display: flex;
    flex-direction: column;
    gap: ${spacing(6)};
  `}
`;

const InvestmentData = ({ strategy }: InvestmentDataProps) => {
  const mode = useThemeMode();
  return (
    <StyledPaper>
      <Typography variant="h5Bold" color={colors[mode].typography.typo1}>
        <FormattedMessage description="strategy-detail.vault-investment-data.title" defaultMessage="Vault Summary" />
      </Typography>
      <FinancialData strategy={strategy} />
    </StyledPaper>
  );
};

export default InvestmentData;
