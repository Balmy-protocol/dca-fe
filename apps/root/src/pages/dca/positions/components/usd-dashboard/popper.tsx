import React from 'react';
import { Typography, Paper } from 'ui-library';
import styled from 'styled-components';

import { emptyTokenWithDecimals, formatCurrencyAmount } from '@common/utils/currency';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  display: flex;
  flex: 1;
  align-items: flex-start;
`;

const StyledLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  align-self: stretch;
  justify-content: space-evenly;
`;

const StyledBreakdownContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledTypography = styled(Typography)`
  font-weight: 500;
`;

interface DashboardPopperProps {
  tokensBreakdown?: Record<string, { summedBalanceUsdToShow: number; summedRawBalance: bigint; decimals: number }>;
}
const DashboardPopper = ({ tokensBreakdown }: DashboardPopperProps) => {
  if (!tokensBreakdown) return null;

  const tokensSymbols = Object.keys(tokensBreakdown);

  return (
    <StyledPaper variant="outlined">
      <StyledLabelContainer>
        {tokensSymbols.map((tokenSymbol) => (
          <StyledBreakdownContainer key={tokenSymbol}>
            <StyledTypography variant="bodySmall">
              {tokenSymbol}:{' '}
              {formatCurrencyAmount(
                tokensBreakdown[tokenSymbol].summedRawBalance,
                emptyTokenWithDecimals(tokensBreakdown[tokenSymbol].decimals),
                4
              )}{' '}
              (${`${tokensBreakdown[tokenSymbol].summedBalanceUsdToShow.toFixed(2)}`})
            </StyledTypography>
          </StyledBreakdownContainer>
        ))}
      </StyledLabelContainer>
    </StyledPaper>
  );
};

export default DashboardPopper;
