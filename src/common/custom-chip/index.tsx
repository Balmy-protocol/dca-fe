import React from 'react';
import styled from 'styled-components';

const StyledChipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  border-radius: 24px;
  background: rgba(216, 216, 216, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
`;

const StyledIconContainer = styled.div``;

const StyledChildrenContainer = styled.div``;

const CustomChip: React.FC<{ icon: React.ReactNode }> = ({ children, icon }) => (
  <StyledChipContainer>
    <StyledIconContainer>{icon}</StyledIconContainer>
    <StyledChildrenContainer>{children}</StyledChildrenContainer>
  </StyledChipContainer>
);

export default CustomChip;
