import React from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';

const StyledCard = styled(Card)`
  margin: 10px;
  border-radius: 10px;
  position: relative;
  min-height: 215px;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.4);
  border: 3px dashed rgba(0, 0, 0, 0.12);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

interface EmptyPositionsProps {
  isClosed?: boolean;
}

const EmptyPositions = ({ isClosed }: EmptyPositionsProps) => (
  <StyledCard variant="outlined">
    <Typography variant="h4">
      <FormattedMessage
        description="empty positions"
        defaultMessage="No {status} positions yet."
        values={{ status: isClosed ? 'past' : 'open' }}
      />
    </Typography>
  </StyledCard>
);

export default EmptyPositions;
