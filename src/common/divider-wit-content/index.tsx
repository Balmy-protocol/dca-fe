import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;
const StyledBorder = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  width: 100%;
`;
const StyledContent = styled.div`
  padding: 0 10px 0 10px;
`;

const Divider: React.FC = ({ children }) => (
  <StyledContainer>
    <StyledBorder />
    <StyledContent>{children}</StyledContent>
    <StyledBorder />
  </StyledContainer>
);

export default Divider;
