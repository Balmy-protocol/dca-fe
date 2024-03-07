import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Card } from 'ui-library';

const StyledCard = styled(Card)`
  margin: 10px;
  position: relative;
  min-height: 215px;
  border: 3px dashed;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  align-self: stretch;
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
        values={{ status: isClosed ? 'closed' : 'open' }}
      />
    </Typography>
  </StyledCard>
);

export default EmptyPositions;
