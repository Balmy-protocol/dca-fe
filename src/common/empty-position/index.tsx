import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';

const StyledCard = styled(Card)`
  ${({ theme }) => `
    margin: 10px;
    border-radius: 10px;
    position: relative;
    min-height: 215px;
    background-color: transparent;
    border: 3px dashed ${theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.8)'};
    flex-grow: 1;
  `}
`;

const EmptyPosition = () => <StyledCard variant="outlined" />;

export default EmptyPosition;
