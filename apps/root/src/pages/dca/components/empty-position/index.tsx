import React from 'react';
import styled from 'styled-components';
import { Card } from 'ui-library';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  min-height: 215px;
  border: 3px dashed;
  flex-grow: 1;
`;

const EmptyPosition = () => <StyledCard variant="outlined" />;

export default EmptyPosition;
