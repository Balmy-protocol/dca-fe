import React from 'react';
import styled from 'styled-components';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Bulb from 'assets/svg/bulb';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 20px;
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledDescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;
`;

const StyledSubtitle = styled(Typography)`
  color: rgba(255, 255, 255, 0.5);
`;

const GraphAggregatorFooter = () => (
  <StyledPaper variant="outlined">
    <StyledIconContainer>
      <Bulb size="90px" />
    </StyledIconContainer>
    <StyledDescriptionContainer>
      <Typography variant="h6">
        <FormattedMessage description="whatIsAggregator" defaultMessage="What is Swap?" />
      </Typography>
      <StyledSubtitle variant="body2">
        <FormattedMessage
          description="whatIsAggregatorAnswer"
          defaultMessage="Mean Finance Swap application is a Meta Dex Aggregator. This means that we aggregate all Dex Aggregators prices to be able to generate the best price for your trade."
          values={{
            p: (chunks: React.ReactNode) => <p>{chunks}</p>,
            br: <br />,
          }}
        />
      </StyledSubtitle>
    </StyledDescriptionContainer>
  </StyledPaper>
);

export default React.memo(GraphAggregatorFooter);
