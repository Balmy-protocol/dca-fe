import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Card } from 'ui-library';

const StyledCard = styled(Card)`
  ${({ theme }) => `
    margin: 10px;
    border-radius: 10px;
    position: relative;
    min-height: 215px;
    background-color: transparent;
    color: ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.4)' : '#FFF'};
    border: 3px dashed ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.8)'};
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    align-self: stretch;
  `}
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
