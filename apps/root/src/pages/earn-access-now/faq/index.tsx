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

const EarnFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage
          description="earn-access-now.faq.title"
          defaultMessage="Early Access Frequently Asked Questions"
        />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="earn-access-now.faq.what-is-early-access"
                defaultMessage="What is Earn Early Access?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="earn-access-now.faq.what-is-early-access-response"
                defaultMessage="Earn Early Access is an exclusive program that gives you early access to our new Earn Guardian product. As an early access member, you'll be among the first to try out"
                values={{
                  b: (chunks) => <b>{chunks}</b>,
                  br: () => <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - What is Earn Early Access?" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default EarnFAQ;
