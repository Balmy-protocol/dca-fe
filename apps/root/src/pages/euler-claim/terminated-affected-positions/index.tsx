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

const TerminatedAffectedPositions = () => (
  <StyledCard variant="outlined">
    <Typography variant="h4">
      <FormattedMessage
        description="terminated affected positions"
        defaultMessage="You have terminated all your active positions."
      />
    </Typography>
  </StyledCard>
);

export default TerminatedAffectedPositions;
