import React from 'react';
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ContainerBox,
  colors,
  ThumbsSatisfaction,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import useAnalytics from '@hooks/useAnalytics';

const StyledQuestion = styled(Typography).attrs({ variant: 'h4Bold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledAnswer = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledContainer = styled(ContainerBox)`
  max-width: 630px;
`;

const TierFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage description="tier-view.faq.title" defaultMessage="Tier Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="tier-view.faq.what-is-tier" defaultMessage="What is Tiers?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.what-is-tier-response"
                defaultMessage="Tiers is amazing, i love it"
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - What is Tiers?" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default TierFAQ;
