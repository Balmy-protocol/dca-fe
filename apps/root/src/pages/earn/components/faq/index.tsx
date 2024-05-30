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
import useTrackEvent from '@hooks/useTrackEvent';

const StyledQuestion = styled(Typography).attrs({ variant: 'h6' })``;

const StyledAnswer = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

const StyledContainer = styled(ContainerBox)`
  max-width: 630px;
`;

const EarnFAQ = () => {
  const trackEvent = useTrackEvent();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        <FormattedMessage description="earnFaqTitle" defaultMessage="Balmy’s Earn Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column">
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqWhatIsEarn" defaultMessage="What is Earn?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsEarnResponse"
                defaultMessage="Earn is a feature that allows you to earn passive income on your assets. With Earn, we show you the best vaults in the market, and you can choose to deposit your assets through us. This way, you can earn interest or other rewards on your assets without the need for active trading or investing."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA what is dca" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default EarnFAQ;
