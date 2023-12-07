import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Paper } from 'ui-library';
import Bulb from '@assets/svg/bulb';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
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

const StyledSubtitle = styled(Typography)``;

const GraphFooter = () => (
  <StyledPaper variant="outlined">
    <StyledIconContainer>
      <Bulb size="90px" />
    </StyledIconContainer>
    <StyledDescriptionContainer>
      <Typography variant="h6">
        <FormattedMessage description="whatIsDca" defaultMessage="What is DCA?" />
      </Typography>
      <StyledSubtitle variant="bodySmall">
        <FormattedMessage
          description="whatIsDcaAnswer"
          defaultMessage="Dollar-cost averaging is a tool an investor can use to build savings and wealth over a long period while neutralizing the short-term volatility in the market.{br}The purchases occur regardless of the asset's price and at regular intervals. In effect, this strategy removes much of the detailed work of attempting to time the market in order to make purchases of assets at the best prices."
          values={{
            p: (chunks: React.ReactNode) => <p>{chunks}</p>,
            br: <br />,
          }}
        />
      </StyledSubtitle>
    </StyledDescriptionContainer>
  </StyledPaper>
);

export default React.memo(GraphFooter);
