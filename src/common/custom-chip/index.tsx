import React from 'react';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';

const StyledChipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(216, 216, 216, 0.1);
  padding: 1px 10px 1px 6px;
`;

const StyledIconContainer = styled.div``;

const StyledChildrenContainer = styled.div``;

const StyledExtraTextContainer = styled(Typography)``;

const CustomChip: React.FC<{ icon: React.ReactNode; extraText?: React.ReactNode }> = ({
  children,
  icon,
  extraText,
}) => (
  <StyledChipContainer>
    <StyledIconContainer>{icon}</StyledIconContainer>
    <StyledChildrenContainer>{children}</StyledChildrenContainer>
    {extraText && (
      <StyledExtraTextContainer variant="body2" color="rgba(255, 255, 255, 0.5)">
        {extraText}
      </StyledExtraTextContainer>
    )}
  </StyledChipContainer>
);

export default CustomChip;
