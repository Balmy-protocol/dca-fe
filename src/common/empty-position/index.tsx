import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  min-height: 189px;
  background-color: transparent;
  border: 3px dashed rgba(0, 0, 0, 0.12);
`;

const EmptyPosition = () => <StyledCard variant="outlined" />;

export default EmptyPosition;
