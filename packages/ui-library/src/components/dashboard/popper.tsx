import React from 'react';
import { Typography, Paper } from '../';
import styled from 'styled-components';

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

interface BaseData {
  name: string;
  value: number;
}

interface DashboardPopperProps {
  breakdown: BaseData[];
  valueFormatter: (value: number) => string;
}

const DashboardPopper = ({ breakdown, valueFormatter }: DashboardPopperProps) => {
  return (
    <StyledPaper variant="outlined">
      <StyledLabelContainer>
        {breakdown.map(({ name, value }) => (
          <StyledBreakdownContainer key={name}>
            <StyledTypography variant="bodySmall">
              {name}: {valueFormatter(value)}
            </StyledTypography>
          </StyledBreakdownContainer>
        ))}
      </StyledLabelContainer>
    </StyledPaper>
  );
};

export default DashboardPopper;
