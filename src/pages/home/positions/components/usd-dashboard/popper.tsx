import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { emptyTokenWithDecimals, formatCurrencyAmount } from 'utils/currency';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background-color: rgb(28 28 28);
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
  tokensBreakdown?: Record<string, { summedBalanceUsdToShow: number; summedRawBalance: BigNumber; decimals: number }>;
}
const DashboardPopper = ({ tokensBreakdown }: DashboardPopperProps) => {
  if (!tokensBreakdown) return null;

  const tokensSymbols = Object.keys(tokensBreakdown);

  return (
    <StyledPaper variant="outlined">
      <StyledLabelContainer>
        {tokensSymbols.map((tokenSymbol) => (
          <StyledBreakdownContainer>
            <StyledTypography variant="body2">
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
